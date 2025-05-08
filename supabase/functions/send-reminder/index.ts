
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from 'https://esm.sh/stripe@12.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    // Parse request body
    const { invoiceId, reminderId } = await req.json()

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get authorization from request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Check if the invoice belongs to the user
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('stripe_invoices')
      .select('*')
      .eq('stripe_invoice_id', invoiceId)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ 
          error: 'Invoice not found or does not belong to you',
          details: invoiceError?.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get reminder template if ID is provided
    let reminderRule = null;
    let emailSubject = null;
    let emailBody = null;
    
    if (reminderId) {
      const { data: reminderData } = await supabaseClient
        .from('reminder_rules')
        .select('*')
        .eq('id', reminderId)
        .single();
      
      if (reminderData) {
        reminderRule = reminderData;
        emailSubject = reminderData.email_subject;
        emailBody = reminderData.email_body;
      }
    }

    // Update reminder history
    const { data: reminderHistory, error: reminderError } = await supabaseClient
      .from('invoice_reminders')
      .insert({
        invoice_id: invoice.id,
        reminder_rule_id: reminderId || null,
        sent_at: new Date().toISOString(),
        status: 'sent',
        email_subject: emailSubject,
        email_body: emailBody,
        metadata: {
          manual: reminderId ? false : true,
        }
      })
      .select()
      .single();

    if (reminderError) {
      console.error('Error recording reminder history:', reminderError);
    }

    // Send the invoice reminder
    // For Stripe invoices, we use the built-in reminder function
    const reminded = await stripe.invoices.sendInvoice(invoiceId);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invoice: reminded,
        reminderHistory,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending reminder:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
