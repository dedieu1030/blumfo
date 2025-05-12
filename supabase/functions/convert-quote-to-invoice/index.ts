
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Définition des en-têtes CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Récupération des variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Création du client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { quoteId } = await req.json();

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: "ID de devis requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Récupération des détails du devis
    const { data: quote, error: quoteError } = await supabase
      .from("devis")
      .select(`
        *,
        client:client_id(*),
        company:company_id(*),
        items:devis_items(*)
      `)
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error("Erreur lors de la récupération du devis:", quoteError);
      return new Response(
        JSON.stringify({ error: "Devis non trouvé", details: quoteError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (quote.status !== 'signed' && quote.status !== 'accepted') {
      return new Response(
        JSON.stringify({ error: "Seuls les devis signés ou acceptés peuvent être convertis en factures" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Création d'une nouvelle facture basée sur le devis
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        client_id: quote.client_id,
        company_id: quote.company_id,
        template_id: quote.template_id,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: quote.subtotal,
        tax_amount: quote.tax_amount,
        total_amount: quote.total_amount,
        notes: quote.notes,
        customizations: quote.customizations,
        status: "draft"
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Erreur lors de la création de la facture:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création de la facture", details: invoiceError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Copie des articles du devis vers la facture
    const invoiceItems = quote.items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      console.error("Erreur lors de la création des articles de la facture:", itemsError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création des articles de la facture", details: itemsError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Mise à jour du statut du devis à "invoiced"
    const { error: updateError } = await supabase
      .from("devis")
      .update({ status: "invoiced" })
      .eq("id", quoteId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour du statut du devis:", updateError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour du statut du devis", details: updateError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Devis converti en facture avec succès",
        invoice: invoice
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
