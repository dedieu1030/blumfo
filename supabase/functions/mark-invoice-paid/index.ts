
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

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
    const { invoiceId, paymentDetails } = await req.json()

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

    // Get the invoice
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ 
          error: 'Invoice not found',
          details: invoiceError?.message 
        }),
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
          warning: 'Cette facture est déjà marquée comme payée',
          invoice
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Update invoice status to "paid"
    const { data: updatedInvoice, error: updateError } = await supabaseClient
      .from('invoices')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update invoice: ${updateError.message}`)
    }

    // Create payment record
    const payment = {
      invoice_id: invoiceId,
      client_id: invoice.client_id,
      amount: invoice.total_amount,
      payment_date: paymentDetails?.date ? new Date(paymentDetails.date).toISOString() : new Date().toISOString(),
      payment_method: paymentDetails?.method || 'manual',
      payment_reference: paymentDetails?.reference || `manual-${Date.now()}`,
      status: 'completed',
      currency: 'EUR'
    }

    const { data: createdPayment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert([payment])
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Continue anyway as the invoice is marked paid
    }

    // Create notification for the payment
    try {
      await supabaseClient
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'payment',
          title: 'Paiement enregistré',
          message: `Le paiement pour la facture ${invoice.invoice_number} a été enregistré.`,
          reference_type: 'invoice',
          reference_id: invoiceId,
          is_read: false
        }])
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Continue anyway as this is non-critical
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invoice: updatedInvoice,
        payment: createdPayment || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
