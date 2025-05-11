
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

    // Get invoice data from request body
    const { invoiceId, paymentDetails } = await req.json()
    
    if (!invoiceId) {
      throw new Error('Invoice ID is required')
    }

    // Get current date for payment date
    const paidDate = new Date().toISOString()
    
    // First, try to update Stripe invoices table if it exists
    const { data: stripeInvoice, error: stripeInvoiceError } = await supabaseClient
      .from('stripe_invoices')
      .update({
        status: 'paid',
        paid_date: paidDate,
        updated_at: paidDate
      })
      .eq('id', invoiceId)
      .select()
      .single()
    
    // If there's no Stripe invoice or it errors, try the regular invoices table
    if (stripeInvoiceError || !stripeInvoice) {
      console.log('No Stripe invoice found or error occurred, trying regular invoices table')
      
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .update({
          status: 'paid',
          updated_at: paidDate
        })
        .eq('id', invoiceId)
        .select()
        .single()
      
      if (invoiceError) {
        throw new Error(`Error updating invoice: ${invoiceError.message}`)
      }
      
      // Create a payment record if successful
      if (invoice) {
        const { data: payment, error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            amount: invoice.total_amount,
            payment_date: paidDate,
            payment_method: paymentDetails?.method || 'manual',
            status: 'completed',
            client_id: invoice.client_id,
            company_id: invoice.company_id
          })
          .select()
          .single()
          
        if (paymentError) {
          console.error('Error creating payment record:', paymentError)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            invoice,
            payment
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    } else {
      // Create a payment record for the Stripe invoice
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          invoice_id: stripeInvoice.invoice_id || invoiceId,
          amount: stripeInvoice.amount_total,
          payment_date: paidDate,
          payment_method: paymentDetails?.method || 'manual',
          status: 'completed',
          client_id: stripeInvoice.client_id
        })
        .select()
        .single()
      
      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          invoice: stripeInvoice,
          payment
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // If we got here, neither table update worked
    throw new Error('Could not find matching invoice to update')
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
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
