
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://ahodvrugfywgcpreeocn.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to send notifications using the create-notification function
const sendNotification = async (notification: any) => {
  const res = await fetch(
    `${supabaseUrl}/functions/v1/create-notification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(notification),
    }
  );
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to send notification: ${JSON.stringify(errorData)}`);
  }
  
  return await res.json();
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Checking for invoices requiring notifications...");
    
    // Get current date
    const today = new Date();
    
    // Check for invoices that are due soon (3 days before due date)
    const dueSoonDate = new Date();
    dueSoonDate.setDate(today.getDate() + 3);
    const dueSoonFormatted = dueSoonDate.toISOString().split('T')[0];
    
    // Find invoices due soon
    const { data: dueSoonInvoices, error: dueSoonError } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        due_date,
        client_id,
        company_id,
        total_amount,
        clients:client_id (id, client_name)
      `)
      .eq("status", "pending")
      .eq("due_date", dueSoonFormatted);
    
    if (dueSoonError) {
      console.error("Error fetching due soon invoices:", dueSoonError);
      throw dueSoonError;
    }
    
    // Check for overdue invoices
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        due_date,
        client_id,
        company_id,
        total_amount,
        clients:client_id (id, client_name)
      `)
      .eq("status", "pending")
      .lt("due_date", today.toISOString().split('T')[0]);
    
    if (overdueError) {
      console.error("Error fetching overdue invoices:", overdueError);
      throw overdueError;
    }
    
    // Get user IDs from company IDs for notifications
    const companyIds = [...new Set([
      ...dueSoonInvoices.map(invoice => invoice.company_id),
      ...overdueInvoices.map(invoice => invoice.company_id)
    ])].filter(Boolean);
    
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, user_id")
      .in("id", companyIds);
    
    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      throw companiesError;
    }
    
    // Create a mapping of company ID to user ID
    const companyToUserMap = companies.reduce((map: Record<string, string>, company: any) => {
      if (company.user_id) {
        map[company.id] = company.user_id;
      }
      return map;
    }, {});
    
    // Process due soon notifications
    const dueSoonPromises = dueSoonInvoices.map(async (invoice: any) => {
      const userId = companyToUserMap[invoice.company_id];
      if (!userId) {
        console.warn(`No user ID found for company ${invoice.company_id}`);
        return null;
      }
      
      const clientName = invoice.clients?.client_name || 'Unknown Client';
      
      return sendNotification({
        userId,
        type: "invoice_due_soon",
        title: `Facture à échéance proche : ${invoice.invoice_number}`,
        message: `La facture ${invoice.invoice_number} pour ${clientName} d'un montant de ${invoice.total_amount}€ est due dans 3 jours.`,
        referenceType: "invoice",
        referenceId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoice_number,
          dueDate: invoice.due_date,
          amount: invoice.total_amount
        }
      });
    });
    
    // Process overdue notifications
    const overduePromises = overdueInvoices.map(async (invoice: any) => {
      const userId = companyToUserMap[invoice.company_id];
      if (!userId) {
        console.warn(`No user ID found for company ${invoice.company_id}`);
        return null;
      }
      
      const clientName = invoice.clients?.client_name || 'Unknown Client';
      
      return sendNotification({
        userId,
        type: "invoice_overdue",
        title: `Facture en retard : ${invoice.invoice_number}`,
        message: `La facture ${invoice.invoice_number} pour ${clientName} d'un montant de ${invoice.total_amount}€ est en retard de paiement.`,
        referenceType: "invoice",
        referenceId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoice_number,
          dueDate: invoice.due_date,
          amount: invoice.total_amount
        }
      });
    });
    
    // Wait for all notifications to be sent
    const dueSoonResults = await Promise.allSettled(dueSoonPromises);
    const overdueResults = await Promise.allSettled(overduePromises);
    
    // Count successful notifications
    const dueSoonSuccessCount = dueSoonResults.filter(result => result.status === 'fulfilled').length;
    const overdueSuccessCount = overdueResults.filter(result => result.status === 'fulfilled').length;
    
    console.log(`Sent ${dueSoonSuccessCount} due soon notifications and ${overdueSuccessCount} overdue notifications`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        dueSoonNotificationsSent: dueSoonSuccessCount,
        overdueNotificationsSent: overdueSuccessCount
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
