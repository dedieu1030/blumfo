
import { supabase, handleSupabaseError, tableExists } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Interface représentant une facture Stripe
 */
export interface StripeInvoice {
  id: string;
  invoice_number: string;
  stripe_invoice_id?: string;
  stripe_hosted_invoice_url?: string;
  amount_due: number;
  amount_paid?: number;
  amount_total?: number;
  currency: string;
  status: string;
  issued_date: string;
  due_date?: string | null;
  paid_date?: string | null;
  client_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Vérifie l'existence et la structure de la table stripe_invoices
 * @returns {Promise<boolean>} true si la table existe et est correctement configurée
 */
export async function checkStripeInvoicesTable(): Promise<boolean> {
  try {
    const tableCheck = await tableExists('stripe_invoices');
    if (!tableCheck) {
      console.error("Table stripe_invoices inexistante");
      toast.error("Table des factures Stripe inexistante. La fonctionnalité sera limitée.");
      return false;
    }
    
    console.log("Table stripe_invoices trouvée");
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de la table stripe_invoices:", error);
    return false;
  }
}

/**
 * Récupère une facture Stripe à partir de son ID
 * @param {string} invoiceId - ID de la facture Stripe
 * @returns {Promise<StripeInvoice | null>} La facture si trouvée, null sinon
 */
export async function getStripeInvoiceById(invoiceId: string): Promise<StripeInvoice | null> {
  try {
    const { data, error } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    
    if (error) {
      handleSupabaseError(error, "récupération de la facture");
      return null;
    }
    
    // Assurer que toutes les propriétés requises sont présentes
    return {
      id: data.id,
      invoice_number: data.invoice_number,
      stripe_invoice_id: data.stripe_invoice_id,
      stripe_hosted_invoice_url: data.stripe_hosted_invoice_url,
      amount_due: data.amount_due || data.amount_total || 0,
      amount_paid: data.amount_paid || 0,
      amount_total: data.amount_total || 0,
      currency: data.currency,
      status: data.status,
      issued_date: data.issued_date,
      due_date: data.due_date,
      paid_date: data.paid_date,
      client_id: data.client_id,
      user_id: data.user_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture:", error);
    toast.error("Impossible de récupérer les détails de la facture");
    return null;
  }
}

/**
 * Récupère une facture Stripe à partir de son ID Stripe
 * @param {string} stripeInvoiceId - ID Stripe de la facture
 * @returns {Promise<StripeInvoice | null>} La facture si trouvée, null sinon
 */
export async function getStripeInvoiceByStripeId(stripeInvoiceId: string): Promise<StripeInvoice | null> {
  try {
    const { data, error } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('stripe_invoice_id', stripeInvoiceId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log("Aucune facture trouvée avec cet ID Stripe:", stripeInvoiceId);
        return null;
      }
      handleSupabaseError(error, "récupération de la facture par ID Stripe");
      return null;
    }
    
    // Assurer que toutes les propriétés requises sont présentes
    return {
      id: data.id,
      invoice_number: data.invoice_number,
      stripe_invoice_id: data.stripe_invoice_id,
      stripe_hosted_invoice_url: data.stripe_hosted_invoice_url,
      amount_due: data.amount_due || data.amount_total || 0,
      amount_paid: data.amount_paid || 0,
      amount_total: data.amount_total || 0,
      currency: data.currency,
      status: data.status,
      issued_date: data.issued_date,
      due_date: data.due_date,
      paid_date: data.paid_date,
      client_id: data.client_id,
      user_id: data.user_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture par ID Stripe:", error);
    toast.error("Impossible de récupérer les détails de la facture");
    return null;
  }
}

/**
 * Liste toutes les factures Stripe de l'utilisateur courant
 * @param {string} userId - ID de l'utilisateur (optionnel, sinon utilisateur courant)
 * @returns {Promise<StripeInvoice[]>} Liste des factures
 */
export async function listStripeInvoices(userId?: string): Promise<StripeInvoice[]> {
  try {
    const { data, error } = await supabase
      .from('stripe_invoices')
      .select('*')
      .order('issued_date', { ascending: false });
    
    if (error) {
      handleSupabaseError(error, "récupération des factures");
      return [];
    }
    
    // Map pour s'assurer que tous les champs requis sont présents
    return data.map(invoice => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      stripe_invoice_id: invoice.stripe_invoice_id,
      stripe_hosted_invoice_url: invoice.stripe_hosted_invoice_url,
      amount_due: invoice.amount_due || invoice.amount_total || 0,
      amount_paid: invoice.amount_paid || 0,
      amount_total: invoice.amount_total || 0,
      currency: invoice.currency,
      status: invoice.status,
      issued_date: invoice.issued_date,
      due_date: invoice.due_date,
      paid_date: invoice.paid_date,
      client_id: invoice.client_id,
      user_id: invoice.user_id,
      metadata: invoice.metadata
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    toast.error("Impossible de récupérer la liste des factures");
    return [];
  }
}

/**
 * Met à jour le statut d'une facture Stripe
 * @param {string} invoiceId - ID de la facture
 * @param {string} status - Nouveau statut
 * @param {object} additionalData - Données supplémentaires à mettre à jour
 * @returns {Promise<StripeInvoice | null>} La facture mise à jour si réussie, null sinon
 */
export async function updateInvoiceStatus(
  invoiceId: string, 
  status: string, 
  additionalData = {}
): Promise<StripeInvoice | null> {
  try {
    const { data, error } = await supabase
      .from('stripe_invoices')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      })
      .eq('id', invoiceId)
      .select()
      .single();
    
    if (error) {
      handleSupabaseError(error, "mise à jour du statut de la facture");
      return null;
    }
    
    toast.success(`Statut de la facture mis à jour: ${status}`);
    
    // Formater correctement la réponse selon l'interface
    return {
      id: data.id,
      invoice_number: data.invoice_number,
      stripe_invoice_id: data.stripe_invoice_id,
      stripe_hosted_invoice_url: data.stripe_hosted_invoice_url,
      amount_due: data.amount_due || data.amount_total || 0,
      amount_paid: data.amount_paid || 0,
      amount_total: data.amount_total || 0,
      currency: data.currency,
      status: data.status,
      issued_date: data.issued_date,
      due_date: data.due_date,
      paid_date: data.paid_date,
      client_id: data.client_id,
      user_id: data.user_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la facture:", error);
    toast.error("Impossible de mettre à jour le statut de la facture");
    return null;
  }
}
