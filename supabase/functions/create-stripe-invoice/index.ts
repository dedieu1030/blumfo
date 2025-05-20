
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.3.0"

interface RequestBody {
  clientId: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
  notes?: string;
  userId: string;
}

interface InvoiceItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

const handleRequest = async (req: Request): Promise<Response> => {
  try {
    // Configuration de Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Clé Stripe manquante" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Configurer le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Configuration Supabase manquante" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupérer et valider le corps de la requête
    const { clientId, items, dueDate, notes, userId } = await req.json() as RequestBody;
    
    if (!clientId || !items || !userId || items.length === 0) {
      return new Response(JSON.stringify({ error: "Paramètres invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Récupérer les informations du client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('client_name, email')
      .eq('id', clientId)
      .single();
    
    if (clientError || !client) {
      return new Response(JSON.stringify({ error: "Client non trouvé" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Récupérer les informations de la société
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_name, stripe_account_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (companyError) {
      return new Response(JSON.stringify({ error: "Erreur lors de la récupération des informations de la société" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Vérifier si le client existe déjà chez Stripe
    let stripeCustomerId;
    const { data: stripeCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('client_id', clientId)
      .maybeSingle();
    
    if (stripeCustomer && stripeCustomer.stripe_customer_id) {
      stripeCustomerId = stripeCustomer.stripe_customer_id;
    } else {
      // Créer un nouveau client Stripe si nécessaire
      const stripeCustomerData = await stripe.customers.create({
        name: client.client_name,
        email: client.email || undefined,
        metadata: {
          client_id: clientId,
          user_id: userId
        }
      });
      
      stripeCustomerId = stripeCustomerData.id;
      
      // Enregistrer le client Stripe dans la base de données
      await supabase.from('stripe_customers').insert({
        client_id: clientId,
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        email: client.email || '',
      });
    }
    
    // Préparer les éléments de la facture
    const invoiceItems: InvoiceItem[] = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.description,
        },
        unit_amount: Math.round(item.unitPrice * 100), // Convertir en centimes
      },
      quantity: item.quantity,
    }));
    
    // Créer un brouillon de facture
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 30, // Par défaut 30 jours
      auto_advance: true, // Envoyer automatiquement après finalisation
      description: `Facture pour ${client.client_name}`,
      footer: notes || undefined,
      metadata: {
        client_id: clientId,
        user_id: userId,
      }
    });
    
    // Ajouter les éléments à la facture
    for (const item of invoiceItems) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        price_data: item.price_data,
        quantity: item.quantity,
      });
    }
    
    // Finaliser la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    
    // Envoyer la facture
    const sentInvoice = await stripe.invoices.send(invoice.id);
    
    // Enregistrer la facture dans la base de données stripe_invoices
    const { data: invoiceRecord, error: invoiceError } = await supabase
      .from('stripe_invoices')
      .insert({
        client_id: clientId,
        user_id: userId,  // Ajouter user_id explicitement
        invoice_number: sentInvoice.number || `INV-${Date.now()}`,
        issued_date: new Date().toISOString(),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        stripe_invoice_id: sentInvoice.id,  // Ajouter stripe_invoice_id explicitement
        stripe_hosted_invoice_url: sentInvoice.hosted_invoice_url,
        status: 'sent',
        amount_due: sentInvoice.amount_due ? sentInvoice.amount_due / 100 : 0,
        amount_paid: sentInvoice.amount_paid ? sentInvoice.amount_paid / 100 : 0,
        amount_total: sentInvoice.total ? sentInvoice.total / 100 : 0,
        currency: sentInvoice.currency || 'eur',
        metadata: {
          notes: notes || null,
          company_id: company?.id || null
        }
      })
      .select()
      .single();
    
    if (invoiceError) {
      console.error("Erreur lors de l'enregistrement de la facture:", invoiceError);
      // Continue malgré l'erreur pour retourner l'ID de la facture Stripe
    }
    
    // Déclencher une notification
    try {
      await supabase.functions.invoke("generate-invoice-notifications", {
        body: { invoice_id: invoiceRecord?.id },
      });
    } catch (notifError) {
      console.error("Erreur lors de la génération des notifications:", notifError);
    }
    
    return new Response(JSON.stringify({
      id: sentInvoice.id,
      invoiceNumber: sentInvoice.number,
      amountDue: sentInvoice.amount_due ? sentInvoice.amount_due / 100 : 0,
      currency: sentInvoice.currency,
      status: sentInvoice.status,
      dueDate: sentInvoice.due_date,
      hostedInvoiceUrl: sentInvoice.hosted_invoice_url,
      stripe_invoice_id: sentInvoice.id, // Inclure explicitement dans la réponse
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return new Response(JSON.stringify({ error: error.message || "Erreur interne du serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

serve(handleRequest);
