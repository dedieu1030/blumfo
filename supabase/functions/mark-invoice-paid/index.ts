
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

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
    let requestBody;
    try {
      requestBody = await req.json()
    } catch (jsonError) {
      console.error("Mark invoice paid: Invalid JSON in request body", jsonError)
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: 'Request body must be valid JSON' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    const { invoiceId, paymentDetails } = requestBody
    
    console.log(`Mark invoice paid: Processing invoice ${invoiceId}`, paymentDetails)
    
    if (!invoiceId) {
      console.error("Mark invoice paid: Invoice ID is required")
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get current date for payment date
    const paidDate = new Date().toISOString()
    
    // First, try to update Stripe invoices table if it exists
    try {
      const { data: stripeInvoice, error: stripeInvoiceError } = await supabase
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
        try {
          const { data: payment, error: paymentError } = await supabase
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
            
            // Return success but with warning about payment record
            return new Response(
              JSON.stringify({
                success: true,
                invoice: stripeInvoice,
                payment: null,
                warning: "Invoice marked as paid but payment record creation failed"
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            )
          }
          
          console.log("Mark invoice paid: Created payment record for stripe invoice", payment)
          
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
        } catch (paymentCreateError) {
          console.error("Mark invoice paid: Exception creating payment record:", paymentCreateError)
          
          // Return success but with warning about payment record
          return new Response(
            JSON.stringify({
              success: true,
              invoice: stripeInvoice,
              payment: null,
              warning: "Invoice marked as paid but payment record creation failed due to exception"
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      } else if (stripeInvoiceError && stripeInvoiceError.code !== 'PGRST116') {
        // If this is an actual database error and not just "no rows returned"
        console.error("Mark invoice paid: Error updating stripe invoice:", stripeInvoiceError)
      }
    } catch (stripeError) {
      console.error("Mark invoice paid: Error updating stripe invoice:", stripeError)
      // Continue to try regular invoice as fallback
    }
    
    // If no Stripe invoice was found, try the regular invoices table
    try {
      console.log(`Mark invoice paid: Attempting to update regular invoice ${invoiceId}`)
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          updated_at: paidDate
        })
        .eq('id', invoiceId)
        .select()
      
      if (invoiceError) {
        console.error(`Mark invoice paid: Error updating regular invoice:`, invoiceError)
        throw new Error(`Error updating invoice: ${invoiceError.message}`)
      }
      
      if (!invoice || invoice.length === 0) {
        console.error(`Mark invoice paid: No invoice found with ID ${invoiceId}`)
        return new Response(
          JSON.stringify({
            error: 'Invoice not found',
            success: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        )
      }
      
      // Create a payment record if successful
      const invoiceRecord = Array.isArray(invoice) ? invoice[0] : invoice;
      console.log(`Mark invoice paid: Updated regular invoice ${invoiceId}`, invoiceRecord)
      
      try {
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            amount: invoiceRecord.total_amount,
            payment_date: paidDate,
            payment_method: paymentDetails?.method || 'manual',
            status: 'completed',
            client_id: invoiceRecord.client_id,
            company_id: invoiceRecord.company_id
          })
          .select()
          .single()
          
        if (paymentError) {
          console.error("Mark invoice paid: Error creating payment record for regular invoice:", paymentError)
          
          return new Response(
            JSON.stringify({
              success: true,
              invoice: invoiceRecord,
              payment: null,
              warning: "Invoice marked as paid but payment record creation failed"
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
        
        console.log("Mark invoice paid: Created payment record for regular invoice", payment)
        
        return new Response(
          JSON.stringify({
            success: true,
            invoice: invoiceRecord,
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
            invoice: invoiceRecord,
            payment: null,
            warning: "Invoice marked as paid but payment record creation failed"
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    } catch (invoiceError) {
      console.error("Mark invoice paid: Error in invoice update:", invoiceError)
      throw invoiceError
    }

    // If we got here, neither table update worked
    console.error(`Mark invoice paid: Could not find matching invoice to update ${invoiceId}`)
    return new Response(
      JSON.stringify({
        error: 'Could not find matching invoice to update',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
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
