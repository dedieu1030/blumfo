
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key (for admin access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // Récupérer les informations de l'utilisateur
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Aucun jeton d'authentification fourni" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non authentifié", details: userError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 1. Supprimer TOUTES les politiques existantes sur la table clients
    await supabase.rpc('clear_client_policies')

    // 2. Créer des nouvelles politiques RLS
    await supabase.rpc('create_client_access_policies')

    // 3. Vérifier si l'utilisateur a une entreprise associée
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Si l'utilisateur a une entreprise, associer tous les clients sans entreprise à celle-ci
    if (companyData?.id) {
      const { data: unassignedClients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .is('company_id', null)

      if (!clientsError && unassignedClients && unassignedClients.length > 0) {
        const clientIds = unassignedClients.map(client => client.id)
        
        await supabase
          .from('clients')
          .update({ company_id: companyData.id })
          .in('id', clientIds)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Politiques RLS nettoyées et clients associés à votre entreprise", 
          company_id: companyData.id,
          clients_associated: unassignedClients?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Politiques RLS nettoyées, mais aucune entreprise trouvée pour l'utilisateur" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
  } catch (error) {
    console.error("Erreur:", error)
    return new Response(
      JSON.stringify({ error: "Une erreur s'est produite", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
