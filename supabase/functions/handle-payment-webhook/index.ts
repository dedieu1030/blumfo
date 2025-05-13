
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
    // Get the request payload
    let payload;
    let signature;
    
    try {
      payload = await req.text();
      signature = req.headers.get('stripe-signature');
    } catch (e) {
      console.error('Error parsing webhook payload:', e);
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    let event;
    
    // Verify the webhook signature
    try {
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (e) {
      console.error('Webhook signature verification failed:', e);
      return new Response(JSON.stringify({ error: e.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Record the webhook in the database
    const { data: webhookRecord, error: webhookError } = await supabaseClient
      .from('payment_webhooks')
      .insert({
        provider: 'stripe',
        event_type: event.type,
        payload: event.data.object,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Failed to record webhook:', webhookError);
      return new Response(JSON.stringify({ error: 'Failed to record webhook' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Process different event types
    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          
          // Find related payment by transaction reference
          const { data: payment, error: paymentError } = await supabaseClient
            .from('payments')
            .update({
              status: 'completed',
              gateway_status: paymentIntent.status,
              gateway_response: paymentIntent,
              updated_at: new Date().toISOString(),
              payment_date: new Date().toISOString()
            })
            .eq('transaction_reference', paymentIntent.id)
            .select()
            .single();

          if (paymentError) {
            throw new Error(`Payment update failed: ${paymentError.message}`);
          }

          // If we have an invoice related to this payment, update it too
          if (payment?.invoice_id) {
            await supabaseClient
              .from('invoices')
              .update({
                status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.invoice_id);
          }
          
          // Update the webhook record
          await supabaseClient
            .from('payment_webhooks')
            .update({
              status: 'processed',
              processed_at: new Date().toISOString(),
              payment_id: payment?.id
            })
            .eq('id', webhookRecord.id);

          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          const error = paymentIntent.last_payment_error;
          
          // Update the payment record
          await supabaseClient
            .from('payments')
            .update({
              status: 'failed',
              gateway_status: paymentIntent.status,
              gateway_response: paymentIntent,
              failure_reason: error ? `${error.code}: ${error.message}` : 'Payment failed',
              updated_at: new Date().toISOString()
            })
            .eq('transaction_reference', paymentIntent.id);
          
          // Update the webhook record
          await supabaseClient
            .from('payment_webhooks')
            .update({
              status: 'processed',
              processed_at: new Date().toISOString()
            })
            .eq('id', webhookRecord.id);
          
          break;
        }
        default:
          // For other events, just mark the webhook as processed
          await supabaseClient
            .from('payment_webhooks')
            .update({
              status: 'processed',
              processed_at: new Date().toISOString()
            })
            .eq('id', webhookRecord.id);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Update the webhook with error information
      await supabaseClient
        .from('payment_webhooks')
        .update({
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookRecord.id);

      return new Response(JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch (error) {
    console.error('Uncaught error in webhook handler:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
