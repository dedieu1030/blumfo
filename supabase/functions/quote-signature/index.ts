
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

    const { quoteId, signatureData, signedName, clientIp, userAgent } = await req.json();

    if (!quoteId || !signedName) {
      return new Response(
        JSON.stringify({ error: "ID de devis et nom du signataire requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Vérification que le devis existe
    const { data: quote, error: quoteError } = await supabase
      .from("devis")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error("Erreur lors de la récupération du devis:", quoteError);
      return new Response(
        JSON.stringify({ error: "Devis non trouvé", details: quoteError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Création de la signature
    const { data: signature, error: signatureError } = await supabase
      .from("devis_signatures")
      .insert({
        quote_id: quoteId,
        signed_name: signedName,
        signature_data: signatureData,
        signed_ip: clientIp || null,
        user_agent: userAgent || null,
        checkbox_confirmed: true
      })
      .select()
      .single();

    if (signatureError) {
      console.error("Erreur lors de la création de la signature:", signatureError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la signature", details: signatureError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Mise à jour du statut du devis à "signé"
    const { error: updateError } = await supabase
      .from("devis")
      .update({ status: "signed" })
      .eq("id", quoteId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour du devis:", updateError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour du statut", details: updateError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Devis signé avec succès", 
        signature: signature 
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
