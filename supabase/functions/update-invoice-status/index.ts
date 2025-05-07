
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

    // Parse request body
    const { invoiceId, status, paymentMethod, paymentDate, paymentReference } = await req.json()

    if (!invoiceId || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Check if the user has access to this invoice
    const { data: invoiceData, error: invoiceError } = await supabaseClient
      .from('stripe_invoices')
      .select('*')
      .eq('stripe_invoice_id', invoiceId)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoiceData) {
      console.error('Error accessing invoice:', invoiceError)
      return new Response(
        JSON.stringify({ error: 'Invoice not found or not authorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    let updatedInvoice
    
    // Update the invoice in Stripe
    if (status === 'paid') {
      try {
        // Mark the invoice as paid in Stripe
        updatedInvoice = await stripe.invoices.pay(invoiceId, {
          paid_out_of_band: true
        })
      } catch (stripeError) {
        // If Stripe update fails, just update our database
        console.error('Error updating Stripe invoice:', stripeError)
        updatedInvoice = null
      }
    }

    // Update our database record
    const { data: updatedRecord, error: updateError } = await supabaseClient
      .from('stripe_invoices')
      .update({
        status: status,
        paid_date: status === 'paid' ? new Date().toISOString() : null,
        amount_paid: status === 'paid' ? invoiceData.amount_total : 0,
        metadata: {
          ...invoiceData.metadata,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_date: paymentDate
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceData.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invoice in database:', updateError)
      throw new Error(`Database update failed: ${updateError.message}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invoice: updatedInvoice || updatedRecord,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating invoice:', error)
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
