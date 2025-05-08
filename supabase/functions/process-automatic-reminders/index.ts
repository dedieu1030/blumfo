
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from 'https://esm.sh/stripe@12.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client with service role key for automation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get all active reminder schedules
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('reminder_schedules')
      .select('id, user_id, name, enabled')
      .eq('enabled', true);

    if (schedulesError) {
      throw new Error(`Error fetching reminder schedules: ${schedulesError.message}`);
    }

    const results = {
      totalProcessed: 0,
      remindersSent: 0,
      errors: [],
      details: [],
    };

    for (const schedule of schedules) {
      // Get reminder rules for this schedule
      const { data: rules, error: rulesError } = await supabaseAdmin
        .from('reminder_rules')
        .select('*')
        .eq('schedule_id', schedule.id);

      if (rulesError) {
        results.errors.push(`Error fetching rules for schedule ${schedule.id}: ${rulesError.message}`);
        continue;
      }

      // Get unpaid invoices for this user
      const { data: invoices, error: invoicesError } = await supabaseAdmin
        .from('stripe_invoices')
        .select('*, invoice_reminders(*)')
        .eq('user_id', schedule.user_id)
        .eq('status', 'unpaid');

      if (invoicesError) {
        results.errors.push(`Error fetching invoices for user ${schedule.user_id}: ${invoicesError.message}`);
        continue;
      }

      // Process each invoice with each rule
      for (const invoice of invoices) {
        results.totalProcessed++;

        for (const rule of rules) {
          const shouldSendReminder = await checkReminderRule(rule, invoice, supabaseAdmin);
          
          if (shouldSendReminder) {
            try {
              // Record the reminder in the history first
              const { data: reminderRecord, error: reminderError } = await supabaseAdmin
                .from('invoice_reminders')
                .insert({
                  invoice_id: invoice.id,
                  reminder_rule_id: rule.id,
                  sent_at: new Date().toISOString(),
                  status: 'sent',
                  email_subject: rule.email_subject,
                  email_body: rule.email_body,
                  metadata: {
                    automatic: true,
                    schedule_id: schedule.id,
                  }
                })
                .select()
                .single();

              if (reminderError) {
                results.errors.push(`Error recording reminder for invoice ${invoice.id}: ${reminderError.message}`);
                continue;
              }

              // Send the actual reminder via Stripe
              if (invoice.stripe_invoice_id) {
                await stripe.invoices.sendInvoice(invoice.stripe_invoice_id);
                
                results.remindersSent++;
                results.details.push({
                  invoice: invoice.invoice_number,
                  rule: rule.id,
                  schedule: schedule.name,
                  timestamp: new Date().toISOString(),
                });
              } else {
                results.errors.push(`No Stripe invoice ID for invoice ${invoice.id}`);
              }
            } catch (error) {
              results.errors.push(`Error sending reminder for invoice ${invoice.id}: ${error.message}`);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing automatic reminders:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to check if we should send a reminder based on the rule
async function checkReminderRule(rule, invoice, supabase) {
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

  // If we already sent this reminder, don't send it again
  if (lastReminderDate) {
    return false;
  }

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

    // Check if we've reached the trigger date
    return now >= triggerDate;
  } 
  // For days_before_due rules
  else if (rule.trigger_type === 'days_before_due') {
    const dueDate = new Date(invoice.due_date);
    const daysToSubtract = rule.trigger_value;
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - daysToSubtract);
    
    // Check if today is the trigger date (or has just passed it)
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfTriggerDate = new Date(triggerDate.setHours(0, 0, 0, 0));
    
    return startOfToday.getTime() === startOfTriggerDate.getTime();
  }
  // For days_after_due rules
  else if (rule.trigger_type === 'days_after_due') {
    const dueDate = new Date(invoice.due_date);
    const daysToAdd = rule.trigger_value;
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() + daysToAdd);
    
    // Check if today is the trigger date (or has just passed it)
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfTriggerDate = new Date(triggerDate.setHours(0, 0, 0, 0));
    
    return startOfToday.getTime() === startOfTriggerDate.getTime();
  }

  return false;
}
