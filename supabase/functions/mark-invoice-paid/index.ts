
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

    // Check if invoice is already fully paid
    if (invoice.status === 'paid') {
      return new Response(
        JSON.stringify({ 
          success: false,
          warning: 'Cette facture est déjà marquée comme entièrement payée',
          invoice
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Déterminer si c'est un paiement partiel
    const paymentAmount = paymentDetails?.amount || invoice.total_amount;
    const isPartial = paymentDetails?.is_partial === true || paymentAmount < (invoice.total_amount - (invoice.amount_paid || 0));
    
    // Si le montant payé + le nouveau paiement est supérieur ou égal au montant total, c'est un paiement complet
    const newTotalPaid = (invoice.amount_paid || 0) + paymentAmount;
    const isFullPayment = newTotalPaid >= invoice.total_amount;
    
    // Mettre à jour le statut de la facture
    let newStatus = invoice.status;
    if (isFullPayment) {
      newStatus = 'paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'partially_paid';
    }

    // Update invoice status et amount_paid
    const { data: updatedInvoice, error: updateError } = await supabaseClient
      .from('invoices')
      .update({
        status: newStatus,
        amount_paid: newTotalPaid,
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
      amount: paymentAmount,
      payment_date: paymentDetails?.date ? new Date(paymentDetails.date).toISOString() : new Date().toISOString(),
      payment_method: paymentDetails?.method || 'manual',
      payment_reference: paymentDetails?.reference || `manual-${Date.now()}`,
      status: 'completed',
      currency: invoice.currency || 'EUR',
      is_partial: isPartial
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
          title: isFullPayment ? 'Paiement complet enregistré' : 'Paiement partiel enregistré',
          message: isFullPayment 
            ? `Le paiement complet pour la facture ${invoice.invoice_number} a été enregistré.` 
            : `Un paiement partiel de ${paymentAmount} pour la facture ${invoice.invoice_number} a été enregistré.`,
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
        payment: createdPayment || null,
        isPartial: isPartial
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
