
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
    console.log("Mark invoice paid: Starting function")
    
    // Get authorization from request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("Mark invoice paid: No authorization header provided")
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
      console.error("Mark invoice paid: Unauthorized", userError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Get invoice data from request body
    const requestBody = await req.json()
    const { invoiceId, paymentDetails } = requestBody
    
    console.log(`Mark invoice paid: Processing invoice ${invoiceId}`, paymentDetails)
    
    if (!invoiceId) {
      console.error("Mark invoice paid: Invoice ID is required")
      throw new Error('Invoice ID is required')
    }

    // Get current date for payment date
    const paidDate = new Date().toISOString()
    
    // First, try to update Stripe invoices table if it exists
    try {
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
        
      // If we successfully updated a stripe invoice
      if (!stripeInvoiceError && stripeInvoice) {
        console.log(`Mark invoice paid: Updated Stripe invoice ${invoiceId}`)
        
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
          console.error("Mark invoice paid: Error creating payment record for stripe invoice:", paymentError)
        } else {
          console.log("Mark invoice paid: Created payment record for stripe invoice", payment)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            invoice: stripeInvoice,
            payment: payment || null
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    } catch (stripeError) {
      console.error("Mark invoice paid: Error updating stripe invoice:", stripeError)
      // Continue to try regular invoice as fallback
    }
    
    // If no Stripe invoice was found, try the regular invoices table
    try {
      console.log(`Mark invoice paid: Attempting to update regular invoice ${invoiceId}`)
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
        console.error(`Mark invoice paid: Error updating regular invoice:`, invoiceError)
        throw new Error(`Error updating invoice: ${invoiceError.message}`)
      }
      
      // Create a payment record if successful
      if (invoice) {
        console.log(`Mark invoice paid: Updated regular invoice ${invoiceId}`)
        try {
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
            console.error("Mark invoice paid: Error creating payment record for regular invoice:", paymentError)
          } else {
            console.log("Mark invoice paid: Created payment record for regular invoice", payment)
          }
          
          return new Response(
            JSON.stringify({
              success: true,
              invoice,
              payment: payment || null
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (paymentError) {
          console.error("Mark invoice paid: Error in payment creation:", paymentError)
          
          // Still return success since the invoice was marked as paid
          return new Response(
            JSON.stringify({
              success: true,
              invoice,
              payment: null,
              warning: "Invoice marked as paid but payment record creation failed"
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }
    } catch (invoiceError) {
      console.error("Mark invoice paid: Error in invoice update:", invoiceError)
      throw invoiceError
    }

    // If we got here, neither table update worked
    console.error(`Mark invoice paid: Could not find matching invoice to update ${invoiceId}`)
    throw new Error('Could not find matching invoice to update')
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
