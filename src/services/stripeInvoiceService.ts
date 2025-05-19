
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StripeInvoiceData {
  client_id: string;
  items: {
    description: string;
    quantity: number;
    unit_amount: number; // in cents
  }[];
  due_days?: number;
  notes?: string;
  metadata?: Record<string, string>;
}

/**
 * Crée une facture Stripe pour un client
 */
export async function createStripeInvoice(data: StripeInvoiceData) {
  try {
    // Vérifier que le client existe avant de créer la facture
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, client_name, email')
      .eq('id', data.client_id)
      .single();
    
    if (clientError || !client) {
      console.error("Erreur lors de la récupération du client:", clientError);
      toast.error("Client introuvable. Impossible de créer la facture.");
      return { error: "Client introuvable", data: null };
    }
    
    if (!client.email) {
      toast.error("Le client doit avoir une adresse email pour créer une facture Stripe.");
      return { error: "Email du client manquant", data: null };
    }

    // Appel à la fonction Supabase Edge qui créera la facture Stripe
    const response = await fetch('/api/create-stripe-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: data.client_id,
        client_email: client.email,
        client_name: client.client_name,
        items: data.items,
        due_days: data.due_days || 30,
        notes: data.notes,
        metadata: data.metadata,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors de la création de la facture Stripe:", result);
      toast.error("Échec de la création de la facture: " + (result.error || "Erreur inconnue"));
      return { error: result.error, data: null };
    }
    
    // Enregistrer la facture Stripe dans notre base de données
    const { data: savedInvoice, error: saveError } = await supabase
      .from('stripe_invoices')
      .insert([{
        client_id: data.client_id,
        invoice_number: result.invoice_number || result.id,
        amount_total: result.amount_total || 0,
        status: result.status || 'pending',
        currency: result.currency || 'EUR',
      }])
      .select()
      .single();
      
    if (saveError) {
      console.error("Erreur lors de l'enregistrement de la facture:", saveError);
      toast.warning("Facture Stripe créée mais non enregistrée dans la base de données.");
      return { error: null, data: result };
    }
    
    toast.success("Facture créée avec succès");
    return { error: null, data: { ...result, savedInvoice } };
  } catch (error) {
    console.error("Erreur lors de la création de la facture Stripe:", error);
    toast.error("Une erreur est survenue lors de la création de la facture.");
    return { error: "Erreur interne", data: null };
  }
}

/**
 * Récupère toutes les factures Stripe d'un client
 */
export async function getClientStripeInvoices(clientId: string) {
  try {
    const { data, error } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Erreur lors de la récupération des factures Stripe:", error);
      return { error, data: null };
    }
    
    return { error: null, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des factures Stripe:", error);
    return { error: "Erreur interne", data: null };
  }
}

/**
 * Récupère une facture Stripe spécifique
 */
export async function getStripeInvoice(invoiceId: string) {
  try {
    // Vérifier d'abord dans notre base de données
    const { data: localInvoice, error: localError } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    
    if (localError && localError.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Erreur lors de la récupération de la facture locale:", localError);
      return { error: localError, data: null };
    }
    
    // Si trouvé localement, récupérer les détails complets depuis Stripe
    if (localInvoice) {
      // Appel à une fonction Edge pour récupérer les détails complets depuis Stripe
      const response = await fetch(`/api/get-stripe-invoice?id=${localInvoice.stripe_invoice_id || invoiceId}`, {
        method: 'GET',
      });
      
      const stripeData = await response.json();
      
      if (!response.ok) {
        return { error: null, data: localInvoice }; // Renvoyer au moins les données locales
      }
      
      // Combiner les données locales et Stripe
      return { error: null, data: { ...localInvoice, stripeDetails: stripeData } };
    }
    
    return { error: "Facture non trouvée", data: null };
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture Stripe:", error);
    return { error: "Erreur interne", data: null };
  }
}

/**
 * Vérifie si la fonctionnalité de facturation Stripe est disponible
 * (vérifie si la connexion Stripe est configurée et si les tables nécessaires existent)
 */
export async function checkStripeInvoiceAvailability() {
  try {
    // Vérifier si la table stripe_invoices existe
    const { data, error } = await supabase
      .from('stripe_invoices')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') { // Relation does not exist
      console.info("La table stripe_invoices n'existe pas");
      return { available: false, reason: "stripe_invoices_missing" };
    }
    
    if (error) {
      console.error("Erreur lors de la vérification de la table stripe_invoices:", error);
      return { available: false, reason: "db_error" };
    }
    
    // Vérifier si au moins une entreprise est connectée à Stripe
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, stripe_connected, stripe_account_id')
      .eq('stripe_connected', true)
      .limit(1);
    
    if (companyError) {
      console.error("Erreur lors de la vérification des entreprises connectées à Stripe:", companyError);
      return { available: false, reason: "company_check_error" };
    }
    
    if (!companies || companies.length === 0) {
      return { available: false, reason: "no_stripe_connection" };
    }
    
    return { available: true, reason: null };
  } catch (error) {
    console.error("Erreur lors de la vérification de la disponibilité de la facturation Stripe:", error);
    return { available: false, reason: "unknown_error" };
  }
}
