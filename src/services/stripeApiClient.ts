
import { supabase } from "@/integrations/supabase/client";

// Types for API responses
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
 * Gets invoice details including status updates from Stripe
 * @param invoiceId Stripe invoice ID
 * @returns Invoice details
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
  try {
    // Call the Edge Function
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
 * Creates a new invoice in Stripe
 * @param invoiceData Data needed to create the invoice
 * @returns Created invoice details
 */
export async function createInvoice(invoiceData: any): Promise<CreateInvoiceResponse> {
  try {
    // Call the Edge Function
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
 * Send an invoice to a customer via email
 * @param invoiceId Stripe invoice ID
 * @returns Response with send status
 */
export async function sendInvoice(invoiceId: string): Promise<SendInvoiceResponse> {
  try {
    // Call the Edge Function
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
 * Creates a payment link for an invoice
 * @param invoiceId Stripe invoice ID
 * @returns Response with payment URL
 */
export async function createPaymentLink(
  invoiceId: string, 
  successUrl?: string, 
  cancelUrl?: string
): Promise<PaymentLinkResponse> {
  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('create-payment-link', {
      body: { 
        invoiceId,
        successUrl,
        cancelUrl
      }
    });

    if (error) {
      console.error('Error creating payment link:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      paymentUrl: data.paymentUrl,
      invoice: data.invoice
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
 * Lists all invoices for the current user
 * @returns List of invoices
 */
export async function listInvoices(): Promise<{
  success: boolean;
  invoices?: any[];
  error?: string;
}> {
  try {
    // Call the Edge Function
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
