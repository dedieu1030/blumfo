
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  requires_gateway: boolean;
  gateway_code?: string;
}

export interface PaymentDetails {
  date?: Date;
  method?: string;
  reference?: string;
  amount?: number;
  is_partial?: boolean;
}

export interface PaymentRequestOptions {
  invoiceId: string;
  paymentMethodCode: string;
  amount?: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
  is_partial?: boolean;
}

export interface PaymentResponse {
  success: boolean;
  payment?: any;
  paymentUrl?: string;
  requiresRedirect?: boolean;
  message?: string;
  error?: string;
  warning?: string;
}

/**
 * Récupère les méthodes de paiement disponibles
 */
export async function getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_enabled', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching payment methods:', error);
    return [];
  }
}

/**
 * Traite un paiement en utilisant la méthode spécifiée
 */
export async function processPayment(options: PaymentRequestOptions): Promise<PaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        ...options,
        clientIp: await fetchClientIp(),
        is_partial: options.is_partial || false
      }
    });

    if (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error.message || 'Échec du traitement du paiement'
      };
    }

    return {
      success: data.success,
      payment: data.payment,
      paymentUrl: data.paymentUrl,
      requiresRedirect: data.requiresRedirect,
      message: data.message,
      warning: data.warning,
      error: data.error
    };
  } catch (error) {
    console.error('Exception processing payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors du traitement du paiement'
    };
  }
}

/**
 * Marque une facture comme payée manuellement
 */
export async function markInvoiceAsPaid(invoiceId: string, paymentDetails?: PaymentDetails): Promise<{
  success: boolean;
  invoice?: any;
  payment?: any;
  error?: string;
  warning?: string;
}> {
  try {
    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('mark-invoice-paid', {
      body: { 
        invoiceId, 
        paymentDetails 
      }
    });

    if (error) {
      console.error('Erreur lors du marquage de la facture comme payée:', error);
      return {
        success: false,
        error: error.message || 'Échec du marquage de la facture comme payée'
      };
    }

    return {
      success: data.success,
      invoice: data.invoice,
      payment: data.payment,
      warning: data.warning,
      error: data.error
    };
  } catch (error) {
    console.error('Exception lors du marquage de la facture comme payée:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors du marquage de la facture comme payée'
    };
  }
}

/**
 * Récupère l'historique des paiements d'un client ou d'une facture
 */
export async function getPaymentHistory(options: { 
  clientId?: string; 
  invoiceId?: string; 
}): Promise<{
  payments: any[];
  invoice?: any;
}> {
  try {
    // 1. Récupérer les paiements
    let query = supabase
      .from('payments')
      .select(`
        *,
        payment_methods (id, name, code, icon)
      `)
      .order('created_at', { ascending: false });

    if (options.clientId) {
      query = query.eq('client_id', options.clientId);
    }

    if (options.invoiceId) {
      query = query.eq('invoice_id', options.invoiceId);
    }

    const { data: payments, error: paymentsError } = await query;

    if (paymentsError) {
      console.error('Error fetching payment history:', paymentsError);
      return { payments: [] };
    }

    // 2. Si un ID de facture est fourni, récupérer également les informations de la facture
    let invoice = null;
    if (options.invoiceId) {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', options.invoiceId)
        .single();

      if (!invoiceError && invoiceData) {
        invoice = invoiceData;
      }
    }

    return {
      payments: payments || [],
      invoice
    };
  } catch (error) {
    console.error('Exception fetching payment history:', error);
    return { payments: [] };
  }
}

// Fonction utilitaire pour obtenir l'adresse IP du client
async function fetchClientIp(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching client IP:', error);
    return undefined;
  }
}
