
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Définition des en-têtes CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Vérification de la méthode HTTP
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Méthode non autorisée" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }

    // Récupération des paramètres de l'URL
    const url = new URL(req.url);
    const quoteId = url.searchParams.get("id");

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: "ID de devis requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Récupération des variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Création du client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Récupération du devis
    const { data: quote, error: quoteError } = await supabase
      .from("devis")
      .select(`
        *,
        client:client_id(*),
        company:company_id(*),
        items:devis_items(*),
        signatures:devis_signatures(*)
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

    return new Response(
      JSON.stringify({ quote }),
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
