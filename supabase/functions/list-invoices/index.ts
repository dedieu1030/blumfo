
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

    // Get invoices from database
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('stripe_invoices')
      .select(`
        *,
        stripe_customers(name, email)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError)
      throw new Error(`Error fetching invoices: ${invoicesError.message}`)
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Check for status updates of the invoices from Stripe
    const pendingInvoices = invoices.filter(
      invoice => invoice.status === 'open' || invoice.status === 'draft'
    )

    // Update pending invoices status in database if needed
    const statusUpdates = []
    for (const invoice of pendingInvoices) {
      if (invoice.stripe_invoice_id) {
        try {
          const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id)
          
          if (stripeInvoice.status !== invoice.status) {
            const { data, error } = await supabaseClient
              .from('stripe_invoices')
              .update({
                status: stripeInvoice.status,
                amount_paid: stripeInvoice.amount_paid,
                paid_date: stripeInvoice.status === 'paid' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', invoice.id)
              .select()
              .single()
            
            if (!error && data) {
              statusUpdates.push(data)
            }
          }
        } catch (error) {
          console.error(`Error retrieving invoice ${invoice.stripe_invoice_id}:`, error)
        }
      }
    }

    // Return success response with possibly updated invoices
    return new Response(
      JSON.stringify({
        success: true,
        invoices: statusUpdates.length > 0 ? 
          invoices.map(invoice => {
            const updated = statusUpdates.find(update => update.id === invoice.id)
            return updated || invoice
          }) : 
          invoices,
        statusUpdates: statusUpdates.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error listing invoices:', error)
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
