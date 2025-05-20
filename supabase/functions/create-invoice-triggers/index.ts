
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    // Configuration Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Configuration Supabase manquante" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Créer la fonction de synchronisation
    const { error: createFunctionError } = await supabase.rpc('create_sync_invoice_trigger_function', {});
    
    if (createFunctionError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Erreur lors de la création de la fonction de synchronisation", 
        details: createFunctionError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Créer le trigger sur stripe_invoices
    const { error: stripeInvoiceTriggerError } = await supabase.rpc('create_stripe_invoice_trigger', {});
    
    if (stripeInvoiceTriggerError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Erreur lors de la création du trigger sur stripe_invoices", 
        details: stripeInvoiceTriggerError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Créer le trigger sur invoices
    const { error: invoiceTriggerError } = await supabase.rpc('create_invoice_trigger', {});
    
    if (invoiceTriggerError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Erreur lors de la création du trigger sur invoices", 
        details: invoiceTriggerError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Les triggers de synchronisation ont été créés avec succès" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Erreur interne du serveur" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
