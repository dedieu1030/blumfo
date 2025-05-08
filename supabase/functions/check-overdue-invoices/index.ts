
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    )
    
    const now = new Date().toISOString();
    
    // Get overdues invoices (due date in the past)
    const { data: overdueInvoices, error: overdueError } = await supabaseClient
      .from('stripe_invoices')
      .select('id, invoice_number, stripe_invoice_id, due_date, amount_total, client_id, status')
      .eq('status', 'unpaid')
      .lt('due_date', now)
      .order('due_date', { ascending: true });
      
    if (overdueError) throw overdueError;
    
    // Get invoices that are near due (due date in next 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const { data: nearDueInvoices, error: nearDueError } = await supabaseClient
      .from('stripe_invoices')
      .select('id, invoice_number, stripe_invoice_id, due_date, amount_total, client_id, status')
      .eq('status', 'unpaid')
      .gte('due_date', now)
      .lte('due_date', sevenDaysLater.toISOString())
      .order('due_date', { ascending: true });
      
    if (nearDueError) throw nearDueError;
    
    // Get client details for each invoice
    const getClientDetails = async (invoices) => {
      if (!invoices || invoices.length === 0) return [];
      
      return Promise.all(
        invoices.map(async (invoice) => {
          if (!invoice.client_id) return invoice;
          
          const { data: client } = await supabaseClient
            .from('clients')
            .select('name, email')
            .eq('id', invoice.client_id)
            .single();
            
          return {
            ...invoice,
            client: client || null
          };
        })
      );
    };
    
    const overdueWithClients = await getClientDetails(overdueInvoices);
    const nearDueWithClients = await getClientDetails(nearDueInvoices);

    // Check for invoices that need automatic reminders
    const checkInvoicesForAutomaticReminders = async () => {
      try {
        // Get all active reminder schedules
        const { data: schedules } = await supabaseClient
          .from('reminder_schedules')
          .select('*, reminder_rules(*)')
          .eq('enabled', true);

        if (!schedules || schedules.length === 0) return [];

        const reminderCandidates = [];

        // Process each schedule and its rules
        for (const schedule of schedules) {
          const userId = schedule.user_id;
          
          // Get user's unpaid invoices
          const { data: invoices } = await supabaseClient
            .from('stripe_invoices')
            .select('*, invoice_reminders(*)')
            .eq('user_id', userId)
            .eq('status', 'unpaid');

          if (!invoices || invoices.length === 0) continue;

          for (const invoice of invoices) {
            for (const rule of schedule.reminder_rules) {
              const shouldSendReminder = await checkReminderRule(rule, invoice, supabaseClient);
              
              if (shouldSendReminder) {
                reminderCandidates.push({
                  invoiceId: invoice.id,
                  stripeInvoiceId: invoice.stripe_invoice_id,
                  ruleId: rule.id,
                  scheduleId: schedule.id,
                  userId: userId
                });
              }
            }
          }
        }

        return reminderCandidates;
      } catch (error) {
        console.error('Error checking automated reminders:', error);
        return [];
      }
    };

    const checkReminderRule = async (rule, invoice, supabase) => {
      // Skip if no due date on invoice
      if (!invoice.due_date && rule.trigger_type !== 'days_after_previous_reminder') {
        return false;
      }

      const now = new Date();

      // Check if we've already sent a reminder based on this rule recently
      const { data: recentReminders } = await supabase
        .from('invoice_reminders')
        .select('*')
        .eq('invoice_id', invoice.id)
        .eq('reminder_rule_id', rule.id)
        .order('sent_at', { ascending: false })
        .limit(1);

      const lastReminderDate = recentReminders && recentReminders.length > 0 
        ? new Date(recentReminders[0].sent_at) 
        : null;

      // If this is a "days after previous reminder" rule and we don't have a previous
      // reminder for this invoice, we should skip
      if (rule.trigger_type === 'days_after_previous_reminder') {
        const { data: anyReminders } = await supabase
          .from('invoice_reminders')
          .select('*')
          .eq('invoice_id', invoice.id)
          .order('sent_at', { ascending: false })
          .limit(1);

        // No previous reminders, so can't trigger a "days after previous" rule
        if (!anyReminders || anyReminders.length === 0) {
          return false;
        }

        // Check if enough days have passed since the last reminder
        const lastReminderSent = new Date(anyReminders[0].sent_at);
        const daysToAdd = rule.trigger_value;
        const triggerDate = new Date(lastReminderSent);
        triggerDate.setDate(triggerDate.getDate() + daysToAdd);

        // Check if we've reached the trigger date and haven't sent this specific rule's reminder yet
        if (now >= triggerDate && (!lastReminderDate || lastReminderDate !== lastReminderSent)) {
          return true;
        }
      } 
      // For days_before_due rules
      else if (rule.trigger_type === 'days_before_due') {
        const dueDate = new Date(invoice.due_date);
        const daysToSubtract = rule.trigger_value;
        const triggerDate = new Date(dueDate);
        triggerDate.setDate(triggerDate.getDate() - daysToSubtract);
        
        // Check if today is the trigger date (or has just passed it) and we haven't sent this reminder yet
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfTriggerDate = new Date(triggerDate.setHours(0, 0, 0, 0));
        
        if (startOfToday >= startOfTriggerDate && !lastReminderDate) {
          return true;
        }
      }
      // For days_after_due rules
      else if (rule.trigger_type === 'days_after_due') {
        const dueDate = new Date(invoice.due_date);
        const daysToAdd = rule.trigger_value;
        const triggerDate = new Date(dueDate);
        triggerDate.setDate(triggerDate.getDate() + daysToAdd);
        
        // Check if today is the trigger date (or has just passed it) and we haven't sent this reminder yet
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfTriggerDate = new Date(triggerDate.setHours(0, 0, 0, 0));
        
        if (startOfToday >= startOfTriggerDate && !lastReminderDate) {
          return true;
        }
      }

      return false;
    };

    const reminderCandidates = await checkInvoicesForAutomaticReminders();

    return new Response(
      JSON.stringify({
        overdue: overdueWithClients || [],
        nearDue: nearDueWithClients || [],
        overdueCount: overdueWithClients?.length || 0,
        nearDueCount: nearDueWithClients?.length || 0,
        reminderCandidates: reminderCandidates
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
