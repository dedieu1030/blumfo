
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

    // Récupérer les factures régulières depuis la table invoices
    const { data: regularInvoices, error: regularInvoicesError } = await supabaseClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        client_id,
        issue_date,
        due_date,
        total_amount,
        amount_paid,
        amount_due,
        status,
        payment_link,
        clients (
          client_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (regularInvoicesError) {
      console.error('Error fetching regular invoices:', regularInvoicesError)
      throw new Error(`Error fetching regular invoices: ${regularInvoicesError.message}`)
    }

    // Récupérer également les factures Stripe si disponibles
    const { data: stripeInvoices, error: stripeInvoicesError } = await supabaseClient
      .from('stripe_invoices')
      .select(`
        *,
        stripe_customers(name, email)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (stripeInvoicesError) {
      console.error('Error fetching Stripe invoices:', stripeInvoicesError)
      // Ne pas arrêter l'exécution, on continue avec les factures régulières
    }

    // Formatage uniforme des factures pour le frontend
    const formattedInvoices = (regularInvoices || []).map(invoice => {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      const isOverdue = invoice.status === 'pending' && dueDate < today;
      
      return {
        id: invoice.id,
        number: invoice.invoice_number,
        invoice_number: invoice.invoice_number,
        client: invoice.clients || "Client inconnu",
        client_name: invoice.clients?.client_name || "Client inconnu",
        amount: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total_amount || 0),
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid || 0,
        date: new Date(invoice.issue_date).toLocaleDateString('fr-FR'),
        issue_date: new Date(invoice.issue_date).toISOString(),
        dueDate: new Date(invoice.due_date).toLocaleDateString('fr-FR'),
        due_date: new Date(invoice.due_date).toISOString(),
        status: isOverdue ? 'overdue' : invoice.status,
        paymentUrl: invoice.payment_link || null,
        stripeInvoiceId: null
      };
    });

    // Ajouter les factures Stripe si disponibles
    const allInvoices = formattedInvoices;
    if (stripeInvoices && stripeInvoices.length > 0) {
      const formattedStripeInvoices = stripeInvoices.map(invoice => {
        return {
          id: invoice.id,
          number: invoice.invoice_number,
          invoice_number: invoice.invoice_number, 
          client: invoice.stripe_customers || { name: "Client Stripe", email: "" },
          client_name: invoice.stripe_customers?.name || "Client Stripe",
          amount: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.amount_total || 0),
          total_amount: invoice.amount_total,
          amount_paid: invoice.amount_paid || 0,
          date: new Date(invoice.issued_date).toLocaleDateString('fr-FR'),
          issue_date: new Date(invoice.issued_date).toISOString(),
          dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '-',
          due_date: invoice.due_date ? new Date(invoice.due_date).toISOString() : null,
          status: invoice.status,
          paymentUrl: null, // Généralement disponible via Stripe
          stripeInvoiceId: invoice.stripe_invoice_id
        };
      });
      allInvoices.push(...formattedStripeInvoices);
    }

    // Trier toutes les factures par date d'émission décroissante
    allInvoices.sort((a, b) => {
      const dateA = new Date(a.issue_date).getTime();
      const dateB = new Date(b.issue_date).getTime();
      return dateB - dateA;
    });

    // Verification des mises à jour Stripe si nécessaire
    let statusUpdates = [];
    if (stripeInvoices && stripeInvoices.some(invoice => invoice.status === 'open' || invoice.status === 'draft')) {
      try {
        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        });

        // Check for status updates of the invoices from Stripe
        const pendingInvoices = stripeInvoices.filter(
          invoice => invoice.status === 'open' || invoice.status === 'draft'
        );

        // Update pending invoices status in database if needed
        for (const invoice of pendingInvoices) {
          if (invoice.stripe_invoice_id) {
            try {
              const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
              
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
                  statusUpdates.push(data);
                }
              }
            } catch (error) {
              console.error(`Error retrieving invoice ${invoice.stripe_invoice_id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking Stripe invoices:', error);
      }
    }

    // Return success response with possibly updated invoices
    return new Response(
      JSON.stringify({
        success: true,
        invoices: statusUpdates.length > 0 ? 
          allInvoices.map(invoice => {
            const updated = statusUpdates.find(update => update.id === invoice.id);
            return updated ? { ...invoice, status: updated.status } : invoice;
          }) : 
          allInvoices,
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
