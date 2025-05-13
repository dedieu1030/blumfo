
import { supabase } from "@/integrations/supabase/client";
import { processPayment } from "@/services/paymentService";

// Types pour les réponses d'API
export interface InvoiceResponse {
  success: boolean;
  invoice?: any;
  error?: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  invoice?: any;
  paymentLink?: string;
  error?: string;
}

export interface PaymentLinkResponse {
  success: boolean;
  paymentUrl?: string;
  invoice?: any;
  error?: string;
}

export interface SendInvoiceResponse {
  success: boolean;
  invoice?: any;
  error?: string;
}

/**
 * Récupère les détails d'une facture, y compris les mises à jour de statut depuis Stripe
 * @param invoiceId ID de la facture Stripe
 * @returns Détails de la facture
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
  try {
    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('get-invoice', {
      body: { invoiceId }
    });

    if (error) {
      console.error('Error getting invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      invoice: data.invoice
    };
  } catch (error) {
    console.error('Error getting invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting invoice'
    };
  }
}

/**
 * Crée une nouvelle facture dans Stripe
 * @param invoiceData Données nécessaires pour créer la facture
 * @returns Détails de la facture créée
 */
export async function createInvoice(invoiceData: any): Promise<CreateInvoiceResponse> {
  try {
    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('create-invoice', {
      body: invoiceData
    });

    if (error) {
      console.error('Error creating invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      invoice: data.invoice,
      paymentLink: data.paymentLink
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating invoice'
    };
  }
}

/**
 * Envoie une facture à un client par email
 * @param invoiceId ID de la facture Stripe
 * @returns Réponse avec le statut d'envoi
 */
export async function sendInvoice(invoiceId: string): Promise<SendInvoiceResponse> {
  try {
    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('send-invoice', {
      body: { invoiceId }
    });

    if (error) {
      console.error('Error sending invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      invoice: data.invoice
    };
  } catch (error) {
    console.error('Error sending invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending invoice'
    };
  }
}

/**
 * Crée un lien de paiement pour une facture
 * @param invoiceId ID de la facture Stripe
 * @returns Réponse avec l'URL de paiement
 */
export async function createPaymentLink(
  invoiceId: string, 
  successUrl?: string, 
  cancelUrl?: string
): Promise<PaymentLinkResponse> {
  try {
    // Utiliser notre nouveau service de paiement par défaut
    const response = await processPayment({
      invoiceId,
      paymentMethodCode: 'card', // Méthode par défaut
      successUrl,
      cancelUrl
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Échec de la création du lien de paiement'
      };
    }

    return {
      success: true,
      paymentUrl: response.paymentUrl,
      invoice: response.payment
    };
  } catch (error) {
    console.error('Error creating payment link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating payment link'
    };
  }
}

/**
 * Liste toutes les factures pour l'utilisateur actuel
 * @returns Liste des factures
 */
export async function listInvoices(): Promise<{
  success: boolean;
  invoices?: any[];
  error?: string;
}> {
  try {
    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('list-invoices');

    if (error) {
      console.error('Error listing invoices:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      invoices: data.invoices
    };
  } catch (error) {
    console.error('Error listing invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error listing invoices'
    };
  }
}
