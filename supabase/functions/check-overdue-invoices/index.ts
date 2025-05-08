
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    )
    
    const now = new Date().toISOString();
    
    // Get overdues invoices (due date in the past)
    const { data: overdueInvoices, error: overdueError } = await supabaseClient
      .from('stripe_invoices')
      .select('id, invoice_number, stripe_invoice_id, due_date, amount_total, client_id, status')
      .eq('status', 'unpaid')
      .lt('due_date', now)
      .order('due_date', { ascending: true });
      
    if (overdueError) throw overdueError;
    
    // Get invoices that are near due (due date in next 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const { data: nearDueInvoices, error: nearDueError } = await supabaseClient
      .from('stripe_invoices')
      .select('id, invoice_number, stripe_invoice_id, due_date, amount_total, client_id, status')
      .eq('status', 'unpaid')
      .gte('due_date', now)
      .lte('due_date', sevenDaysLater.toISOString())
      .order('due_date', { ascending: true });
      
    if (nearDueError) throw nearDueError;
    
    // Get client details for each invoice
    const getClientDetails = async (invoices) => {
      if (!invoices || invoices.length === 0) return [];
      
      return Promise.all(
        invoices.map(async (invoice) => {
          if (!invoice.client_id) return invoice;
          
          const { data: client } = await supabaseClient
            .from('clients')
            .select('name, email')
            .eq('id', invoice.client_id)
            .single();
            
          return {
            ...invoice,
            client: client || null
          };
        })
      );
    };
    
    const overdueWithClients = await getClientDetails(overdueInvoices);
    const nearDueWithClients = await getClientDetails(nearDueInvoices);

    return new Response(
      JSON.stringify({
        overdue: overdueWithClients || [],
        nearDue: nearDueWithClients || [],
        overdueCount: overdueWithClients?.length || 0,
        nearDueCount: nearDueWithClients?.length || 0
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
