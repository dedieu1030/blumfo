import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/components/ClientSelector";

/**
 * Associe les clients sans entreprise à une entreprise spécifiée
 * @param {string} companyId - ID de l'entreprise à associer
 * @returns {Promise<number>} Nombre de clients mis à jour
 */
export async function associateClientsToCompany(companyId: string): Promise<number> {
  if (!companyId) {
    throw new Error("ID d'entreprise requis");
  }

  try {
    // Récupérer tous les clients sans company_id
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .is('company_id', null);

    if (error) {
      console.error("Erreur lors de la récupération des clients sans entreprise:", error);
      return 0;
    }

    if (!data || data.length === 0) {
      console.log("Aucun client sans entreprise trouvé");
      return 0;
    }

    const clientIds = data.map(client => client.id);
    console.log(`${clientIds.length} clients sans entreprise trouvés, association à l'entreprise ${companyId}...`);

    // Mettre à jour tous les clients sans company_id
    const { error: updateError } = await supabase
      .from('clients')
      .update({ company_id: companyId })
      .in('id', clientIds);

    if (updateError) {
      console.error("Erreur lors de la mise à jour des clients:", updateError);
      toast.error("Impossible de mettre à jour les clients");
      return 0;
    }

    console.log(`${clientIds.length} clients ont été associés à l'entreprise ${companyId}`);
    return clientIds.length;
  } catch (error) {
    console.error("Erreur lors de l'association des clients à l'entreprise:", error);
    return 0;
  }
}

/**
 * Vérifie si un client appartient à l'entreprise spécifiée
 * @param {Client} client - Client à vérifier
 * @param {string} companyId - ID de l'entreprise
 * @returns {boolean} true si le client appartient à l'entreprise
 */
export function clientBelongsToCompany(client: Client, companyId: string | null): boolean {
  if (!companyId) return true; // Si pas d'ID d'entreprise, on accepte tous les clients
  if (!client.company_id) return true; // Les clients sans entreprise sont considérés comme accessibles
  return client.company_id === companyId;
}

/**
 * Récupère l'ID de l'entreprise de l'utilisateur courant
 * @returns {Promise<string | null>} ID de l'entreprise ou null si non trouvé
 */
export async function getCurrentUserCompanyId(): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user?.id) return null;
    
    const userId = sessionData.session.user.id;
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return null;
    return data.id;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise de l'utilisateur:", error);
    return null;
  }
}

/**
 * Formate le client pour l'affichage
 * @param {Client} client - Client à formater
 * @returns {Client} Client formaté
 */
export function formatClientForDisplay(client: Client): Client {
  return {
    ...client,
    name: client.name || client.client_name || "Client sans nom",
    user_id: client.user_id || client.company_id
  };
}

/**
 * Récupère le nombre de factures pour un client spécifique
 * @param {string} clientId - ID du client
 * @returns {Promise<number>} Nombre de factures
 */
export async function getCountInvoicesByClient(clientId: string): Promise<number> {
  try {
    // Utiliser la fonction RPC existante dans Supabase
    const { data, error } = await supabase
      .rpc('get_client_invoice_count', { client_id: clientId });

    if (error) {
      console.error("Erreur lors de la récupération du nombre de factures:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de factures:", error);
    return 0;
  }
}

/**
 * Interface pour les factures Stripe
 */
interface StripeInvoice {
  id: string;
  stripe_invoice_id: string | null;
  stripe_customer_id?: string | null; // Rendu optionnel avec ?
  invoice_number: string;
  amount_total: number;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  issued_date: string;
  due_date: string | null;
  paid_date: string | null;
  stripe_hosted_invoice_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  client_id: string | null;
  metadata: Record<string, any> | null;
}

/**
 * Récupère les factures Stripe pour un client spécifique
 * @param {string} clientId - ID du client
 * @returns {Promise<StripeInvoice[]>} Liste des factures
 */
export async function getStripeInvoicesByClient(clientId: string): Promise<StripeInvoice[]> {
  try {
    if (!clientId) {
      console.error("ID client requis pour récupérer les factures");
      return [];
    }

    // Récupérer le client Stripe associé au client
    const { data: stripeCustomer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('client_id', clientId)
      .single();

    if (customerError) {
      console.error("Erreur lors de la récupération du client Stripe:", customerError);
      return [];
    }

    if (!stripeCustomer?.stripe_customer_id) {
      console.log("Aucun client Stripe associé à ce client");
      return [];
    }

    // Récupérer les factures Stripe pour ce client
    const { data: invoices, error: invoicesError } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('stripe_customer_id', stripeCustomer.stripe_customer_id)
      .order('issued_date', { ascending: false });

    if (invoicesError) {
      console.error("Erreur lors de la récupération des factures Stripe:", invoicesError);
      return [];
    }

    // Assurons-nous que les données correspondent à l'interface StripeInvoice
    return (invoices || []) as StripeInvoice[];
  } catch (error) {
    console.error("Erreur lors de la récupération des factures Stripe:", error);
    return [];
  }
}
