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
    const { 
      invoiceId, 
      paymentMethodCode, 
      amount, 
      currency = 'EUR',
      successUrl, 
      cancelUrl,
      clientIp,
      is_partial = false,
      metadata = {}
    } = await req.json()

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!paymentMethodCode) {
      return new Response(
        JSON.stringify({ error: 'Payment method is required' }),
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

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          warning: 'Cette facture est déjà marquée comme payée' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Calcul du montant à payer (montant spécifié ou montant restant dû)
    const remainingAmount = invoice.total_amount - (invoice.amount_paid || 0);
    const paymentAmount = amount !== undefined ? amount : remainingAmount;
    
    // Vérifier que le montant de paiement n'est pas supérieur au montant restant dû
    if (paymentAmount > remainingAmount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Le montant du paiement (${paymentAmount}) est supérieur au montant restant dû (${remainingAmount})` 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Si le montant est inférieur au montant total et is_partial n'est pas spécifié, marquer comme paiement partiel
    const isPartialPayment = is_partial || (paymentAmount < remainingAmount);

    // Get payment method details
    const { data: paymentMethod, error: paymentMethodError } = await supabaseClient
      .from('payment_methods')
      .select('*')
      .eq('code', paymentMethodCode)
      .single()

    if (paymentMethodError || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Payment method not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Create a payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        client_id: invoice.client_id,
        user_id: user.id,
        payment_method_id: paymentMethod.id,
        amount: paymentAmount,
        currency: currency,
        status: 'pending',
        payment_method: paymentMethod.code,
        is_partial: isPartialPayment
      })
      .select()
      .single()

    if (paymentError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create payment', details: paymentError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Record payment attempt
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('payment_attempts')
      .insert({
        payment_id: payment.id,
        user_id: user.id,
        payment_method_id: paymentMethod.id,
        amount: amount || invoice.total_amount,
        currency: currency,
        status: 'pending',
        client_ip: clientIp
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Failed to record payment attempt:', attemptError);
    }

    // Increment attempts count
    await supabaseClient
      .from('payments')
      .update({
        attempts_count: payment.attempts_count ? payment.attempts_count + 1 : 1
      })
      .eq('id', payment.id)

    // Process payment based on method
    if (paymentMethod.requires_gateway) {
      if (paymentMethod.gateway_code === 'stripe') {
        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        })

        try {
          // Create a payment intent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(paymentAmount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            payment_method_types: ['card'],
            metadata: {
              invoice_id: invoiceId,
              invoice_number: invoice.invoice_number,
              payment_id: payment.id,
              is_partial: isPartialPayment.toString(),
              ...metadata
            }
          })

          // Update payment with transaction reference
          await supabaseClient
            .from('payments')
            .update({
              transaction_reference: paymentIntent.id,
              gateway_status: paymentIntent.status,
              gateway_response: paymentIntent
            })
            .eq('id', payment.id)

          // Create a payment session
          const session = await stripe.checkout.sessions.create({
            payment_intent_data: {
              payment_intent: paymentIntent.id
            },
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: currency.toLowerCase(),
                  product_data: {
                    name: isPartialPayment 
                      ? `Paiement partiel de la facture ${invoice.invoice_number}`
                      : `Facture ${invoice.invoice_number}`,
                  },
                  unit_amount: Math.round(paymentAmount * 100),
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: successUrl || `${req.headers.get('origin')}/invoices/${invoiceId}?success=true`,
            cancel_url: cancelUrl || `${req.headers.get('origin')}/invoices/${invoiceId}?cancelled=true`,
          })

          // Update payment with payment link
          await supabaseClient
            .from('payments')
            .update({
              payment_link: session.url
            })
            .eq('id', payment.id)

          // Update attempt with gateway reference
          if (attempt) {
            await supabaseClient
              .from('payment_attempts')
              .update({
                gateway_reference: paymentIntent.id,
                gateway_response: {
                  intent_id: paymentIntent.id,
                  session_id: session.id,
                  status: paymentIntent.status
                }
              })
              .eq('id', attempt.id)
          }

          return new Response(
            JSON.stringify({
              success: true,
              payment: payment,
              paymentUrl: session.url,
              requiresRedirect: true
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (stripeError) {
          console.error('Stripe error:', stripeError);

          // Update payment as failed
          await supabaseClient
            .from('payments')
            .update({
              status: 'failed',
              failure_reason: stripeError.message
            })
            .eq('id', payment.id)

          // Update attempt with error
          if (attempt) {
            await supabaseClient
              .from('payment_attempts')
              .update({
                status: 'failed',
                error_message: stripeError.message
              })
              .eq('id', attempt.id)
          }

          return new Response(
            JSON.stringify({ error: 'Payment processing failed', details: stripeError.message }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
      } else if (paymentMethod.gateway_code === 'paypal') {
        // PayPal implementation would go here
        return new Response(
          JSON.stringify({ error: 'PayPal integration not implemented yet' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 501,
          }
        )
      } else {
        return new Response(
          JSON.stringify({ error: `Unsupported payment gateway: ${paymentMethod.gateway_code}` }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
    } else {
      // For manual payment methods like bank transfer, check, cash
      return new Response(
        JSON.stringify({
          success: true,
          payment: payment,
          requiresRedirect: false,
          message: `Paiement ${isPartialPayment ? 'partiel ' : ''}initié via ${paymentMethod.name}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during payment processing'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
