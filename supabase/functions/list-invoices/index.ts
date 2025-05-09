
// supabase/functions/list-invoices/index.ts
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

// Configuration pour les réponses CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gestionnaire pour les requêtes OPTIONS (CORS preflight)
function handleCors(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }
}

serve(async (request: Request) => {
  // Gérer les requêtes CORS préliminaires
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Configuration du client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupération des factures depuis la base de données
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('stripe_invoices')
      .select(`
        id, 
        invoice_number,
        issued_date,
        due_date,
        paid_date,
        amount_total,
        status,
        currency,
        clients (
          id,
          client_name,
          email
        )
      `)
      .order('issued_date', { ascending: false });

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invoices', details: invoicesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Transformer les données pour le format attendu par le frontend
    const invoices = invoicesData.map(invoice => {
      return {
        id: invoice.id,
        number: invoice.invoice_number,
        client: invoice.clients?.client_name || 'Unknown client',
        clientId: invoice.clients?.id,
        amount: (invoice.amount_total / 100).toFixed(2) + ' ' + (invoice.currency || 'EUR'),
        amountValue: invoice.amount_total / 100,
        currency: invoice.currency || 'EUR',
        date: new Date(invoice.issued_date).toLocaleDateString(),
        dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : null,
        status: invoice.status || 'pending'
      };
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoices: invoices,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
