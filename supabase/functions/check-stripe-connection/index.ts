
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

    // Get the user's Stripe Connect account
    const { data: account, error: accountError } = await supabaseClient
      .from('stripe_connect_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('connected_at', { ascending: false })
      .maybeSingle()

    if (accountError) {
      throw new Error(`Failed to fetch Stripe connection: ${accountError.message}`)
    }

    if (!account) {
      return new Response(
        JSON.stringify({ 
          connected: false,
          message: 'No active Stripe connection found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Verify that the account is still valid with Stripe
    try {
      const accountDetails = await stripe.accounts.retrieve(account.stripe_account_id)
      
      // Update the account details in the database
      await supabaseClient
        .from('stripe_connect_accounts')
        .update({ 
          account_details: accountDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id)

      // Return the connection status with account details
      return new Response(
        JSON.stringify({ 
          connected: true,
          accountId: account.stripe_account_id,
          details: {
            id: account.stripe_account_id,
            livemode: account.livemode,
            business_name: accountDetails.business_name || accountDetails.display_name || accountDetails.email,
            business_type: accountDetails.business_type,
            payouts_enabled: accountDetails.payouts_enabled,
            charges_enabled: accountDetails.charges_enabled,
            connected_at: account.connected_at,
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (stripeError) {
      // Account might be disabled or no longer valid
      console.error('Error retrieving Stripe account:', stripeError)
      
      // Deactivate the connection
      await supabaseClient
        .from('stripe_connect_accounts')
        .update({ 
          is_active: false,
          disconnected_at: new Date().toISOString()
        })
        .eq('id', account.id)
        
      return new Response(
        JSON.stringify({ 
          connected: false,
          message: 'Stripe account is no longer valid',
          error: stripeError instanceof Error ? stripeError.message : 'Unknown error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error) {
    console.error('Error checking Stripe connection:', error)
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
