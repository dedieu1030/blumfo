
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

    // Parse request body
    const { code, state } = await req.json()

    if (!code || !state) {
      throw new Error('Authorization code and state are required')
    }

    // Verify state to prevent CSRF attacks
    const { data: pendingConnect, error: stateError } = await supabaseClient
      .from('stripe_connect_accounts')
      .select()
      .eq('user_id', user.id)
      .eq('stripe_account_id', `pending_${state}`)
      .eq('is_active', false)
      .single()

    if (stateError || !pendingConnect) {
      throw new Error('Invalid state parameter')
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Exchange authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    // Store the access token and account details
    const { stripe_user_id, access_token, refresh_token, scope, livemode, token_type } = response

    // Get additional account details
    const accountDetails = await stripe.accounts.retrieve(stripe_user_id)

    // Update the pending connection with the confirmed details
    await supabaseClient
      .from('stripe_connect_accounts')
      .delete()
      .eq('id', pendingConnect.id)

    // Create new confirmed connection
    const { data: newConnection, error: insertError } = await supabaseClient
      .from('stripe_connect_accounts')
      .insert({
        user_id: user.id,
        stripe_account_id: stripe_user_id,
        access_token,
        refresh_token,
        token_type,
        scope,
        livemode,
        is_active: true,
        account_details: accountDetails
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to store Stripe connection: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        accountId: stripe_user_id,
        connected: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing Stripe Connect callback:', error)
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
