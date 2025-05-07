
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

    // Parse request body
    const { returnUrl } = await req.json()

    if (!returnUrl) {
      throw new Error('Return URL is required')
    }

    // Generate a random state string to prevent CSRF attacks
    const stateBuffer = new Uint8Array(16)
    crypto.getRandomValues(stateBuffer)
    const state = Array.from(stateBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Store state in database temporarily to validate on callback
    await supabaseClient
      .from('stripe_connect_accounts')
      .insert({
        user_id: user.id,
        stripe_account_id: `pending_${state}`, // Will be replaced with real account ID after authorization
        is_active: false
      })

    // Stripe OAuth parameters
    const clientId = Deno.env.get('STRIPE_CLIENT_ID')
    
    // Create the OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId || '',
      scope: 'read_write',
      state: state,
      redirect_uri: returnUrl
    })

    const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`

    return new Response(
      JSON.stringify({ 
        url: stripeConnectUrl,
        state: state 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error initiating Stripe Connect:', error)
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
