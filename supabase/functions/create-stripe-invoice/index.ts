
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info",
};

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    const payload = await req.json();
    const {
      client_id,
      client_email,
      client_name,
      items,
      due_days = 30,
      notes,
      metadata = {},
    } = payload;

    if (!client_id || !client_email || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Récupérer l'entreprise associée au client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('company_id')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Récupérer l'entreprise et ses informations Stripe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_connected')
      .eq('id', client.company_id)
      .single();

    if (companyError || !company) {
      console.error('Company not found:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    if (!company.stripe_connected || !company.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Company not connected to Stripe' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Vérifier si le client existe déjà dans Stripe
    let stripeCustomerId;
    const { data: stripeCustomers, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('client_id', client_id)
      .maybeSingle();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Error checking stripe customer:', customerError);
    }

    // Si le client existe déjà dans Stripe, utiliser son ID
    if (stripeCustomers?.stripe_customer_id) {
      stripeCustomerId = stripeCustomers.stripe_customer_id;
    } else {
      // Sinon, créer un nouveau client dans Stripe
      try {
        const customer = await stripe.customers.create(
          {
            email: client_email,
            name: client_name,
            metadata: {
              client_id,
              company_id: client.company_id,
            },
          },
          {
            stripeAccount: company.stripe_account_id,
          }
        );
        stripeCustomerId = customer.id;

        // Sauvegarder le client Stripe dans la base de données
        await supabase.from('stripe_customers').insert({
          client_id,
          stripe_customer_id: customer.id,
          email: client_email,
        });
      } catch (error) {
        console.error('Error creating stripe customer:', error);
        return new Response(
          JSON.stringify({ error: `Failed to create Stripe customer: ${error.message}` }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    // Créer les éléments de la facture
    const lineItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: item.unit_amount,
        product_data: {
          name: item.description,
        },
      },
    }));

    // Calculer la date d'échéance
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + due_days);

    // Créer la facture dans Stripe
    try {
      // Créer d'abord un draft invoice
      const invoice = await stripe.invoices.create(
        {
          customer: stripeCustomerId,
          collection_method: 'send_invoice',
          due_date: Math.floor(dueDate.getTime() / 1000),
          metadata: {
            ...metadata,
            client_id,
            company_id: client.company_id,
          },
          description: notes || `Facture pour ${client_name}`,
        },
        {
          stripeAccount: company.stripe_account_id,
        }
      );

      // Ajouter les lignes à la facture
      for (const item of lineItems) {
        await stripe.invoiceItems.create(
          {
            customer: stripeCustomerId,
            invoice: invoice.id,
            quantity: item.quantity,
            price_data: item.price_data,
          },
          {
            stripeAccount: company.stripe_account_id,
          }
        );
      }

      // Finaliser la facture
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(
        invoice.id,
        {
          auto_advance: true,
        },
        {
          stripeAccount: company.stripe_account_id,
        }
      );

      // Envoyer la facture
      await stripe.invoices.sendInvoice(
        invoice.id,
        {
          stripeAccount: company.stripe_account_id,
        }
      );

      // Stocker les informations de la facture dans notre base de données
      const { data: savedInvoice, error: saveError } = await supabase
        .from('stripe_invoices')
        .insert({
          client_id,
          invoice_number: finalizedInvoice.number,
          amount_total: finalizedInvoice.total,
          status: finalizedInvoice.status,
          currency: finalizedInvoice.currency,
          stripe_invoice_id: finalizedInvoice.id,
          issued_date: new Date().toISOString(),
          due_date: dueDate.toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving invoice to database:', saveError);
      }

      return new Response(
        JSON.stringify({
          id: finalizedInvoice.id,
          number: finalizedInvoice.number,
          invoice_pdf: finalizedInvoice.invoice_pdf,
          hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
          amount_total: finalizedInvoice.total,
          status: finalizedInvoice.status,
          currency: finalizedInvoice.currency,
          due_date: dueDate.toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error creating stripe invoice:', error);
      return new Response(
        JSON.stringify({ error: `Failed to create Stripe invoice: ${error.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
