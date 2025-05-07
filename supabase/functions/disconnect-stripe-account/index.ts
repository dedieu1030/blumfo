
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

    // Parse request body to get account ID
    const { accountId } = await req.json()
    
    if (!accountId) {
      throw new Error('Account ID is required')
    }

    // Get the Stripe Connect account to disconnect
    const { data: account, error: accountError } = await supabaseClient
      .from('stripe_connect_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('stripe_account_id', accountId)
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ 
          error: 'Account not found or already disconnected',
          details: accountError?.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Deauthorize the connected account if we have an access token
    if (account.access_token) {
      try {
        await stripe.oauth.deauthorize({
          client_id: Deno.env.get('STRIPE_CLIENT_ID') || '',
          stripe_user_id: accountId,
        });
      } catch (stripeError) {
        console.error('Error deauthorizing Stripe account:', stripeError)
        // Continue with disconnection even if deauthorization fails
      }
    }

    // Mark the account as inactive in our database
    await supabaseClient
      .from('stripe_connect_accounts')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString(),
      })
      .eq('id', account.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Stripe account successfully disconnected',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error disconnecting Stripe account:', error)
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
