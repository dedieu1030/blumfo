
// supabase/functions/create-invoice/index.ts
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

    // Vérification de la méthode de la requête
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }

    // Récupération et validation des données de la requête
    const requestData = await request.json();
    const { invoiceData, clientInfo } = requestData;

    if (!invoiceData || !clientInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log("Creating invoice with data:", { invoiceData, clientInfo });

    // Création ou mise à jour du client si nécessaire
    let clientId = clientInfo.id;

    if (!clientId) {
      // Format de client pour la DB
      const clientDbData = {
        client_name: clientInfo.name, // Utilise client_name au lieu de name
        email: clientInfo.email,
        phone: clientInfo.phone,
        address: clientInfo.address,
      };
      
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert(clientDbData)
        .select()
        .single();
        
      if (clientError) {
        console.error("Error creating client:", clientError);
        return new Response(
          JSON.stringify({ error: 'Failed to create client', details: clientError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      clientId = newClient.id;
      console.log("New client created:", newClient);
    }

    // Création d'une facture dans stripe_invoices
    const invoiceDbData = {
      client_id: clientId,
      invoice_number: invoiceData.invoiceNumber,
      issued_date: invoiceData.invoiceDate,
      due_date: invoiceData.dueDate || null,
      amount_total: invoiceData.total * 100, // Conversion en centimes pour Stripe
      currency: invoiceData.issuerInfo?.defaultCurrency || 'EUR',
      status: 'pending'
    };
    
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('stripe_invoices')
      .insert(invoiceDbData)
      .select()
      .single();
      
    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invoice', details: invoiceError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log("New invoice created:", newInvoice);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice: newInvoice,
        message: 'Invoice created successfully'
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
