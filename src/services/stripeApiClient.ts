
/**
 * Client for interacting with Stripe API to manage invoices
 */

import { supabase } from '@/integrations/supabase/client';

export interface CreateInvoiceParams {
  customerEmail: string;
  customerName?: string;
  customer?: string; // Stripe customer ID if already exists
  items: Array<{
    description: string;
    quantity: number;
    unit_amount: number; // In cents (e.g., 1000 for $10.00)
    tax_rates?: string[];
  }>;
  dueDate?: Date;
  currency?: string;
  taxRates?: string[];
  metadata?: Record<string, string>;
  footer?: string;
  memo?: string;
}

export interface InvoiceResponse {
  success: boolean;
  error?: string;
  invoice?: any;
  paymentLink?: string;
}

export interface PaymentLinkResponse {
  success: boolean;
  error?: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
}

export interface InvoiceSendResponse {
  success: boolean;
  error?: string;
  invoice?: any;
}

export interface InvoiceItem {
  id: string;
  stripe_invoice_id: string;
  stripe_product_id: string | null;
  quantity: number;
  unit_price_cents: number;
  tax_rate: number | null;
  amount_total: number;
  amount_tax: number | null;
  description: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  stripe_invoice_id: string | null;
  stripe_customer_id: string | null;
  user_id: string | null;
  amount_total: number;
  amount_paid: number;
  currency: string;
  status: string;
  payment_link: string | null;
  payment_intent_id: string | null;
  invoice_pdf_url: string | null;
  due_date: string | null;
  issued_date: string;
  paid_date: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  stripe_customers?: {
    name: string | null;
    email: string;
  };
  items?: InvoiceItem[];
}

/**
 * Creates an invoice in Stripe
 * @param params Invoice creation parameters
 * @returns Invoice creation response
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
  try {
    // Validate required fields
    if (!params.customerEmail) {
      return {
        success: false,
        error: 'Customer email is required'
      };
    }

    if (!params.items || params.items.length === 0) {
      return {
        success: false,
        error: 'At least one invoice item is required'
      };
    }

    // Convert params for the Edge Function
    const requestData = {
      customer: params.customer || null,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      items: params.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
        tax_rates: item.tax_rates
      })),
      dueDate: params.dueDate ? Math.floor(params.dueDate.getTime() / 1000) : undefined,
      footer: params.footer,
      memo: params.memo,
      currency: params.currency || 'eur',
      taxRates: params.taxRates,
      metadata: params.metadata
    };

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('create-invoice', {
      body: requestData
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
 * Creates a payment link for an invoice
 * @param invoiceId Stripe invoice ID
 * @param successUrl URL to redirect after successful payment
 * @param cancelUrl URL to redirect after cancelled payment
 * @returns Payment link response
 */
export async function createPaymentLink(
  invoiceId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<PaymentLinkResponse> {
  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('create-payment-link', {
      body: { invoiceId, successUrl, cancelUrl }
    });

    if (error) {
      console.error('Error creating payment link:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Generate QR code URL for the payment link
    const qrCodeUrl = generateQRCodeUrl(data.paymentUrl);

    return {
      success: true,
      paymentUrl: data.paymentUrl,
      qrCodeUrl
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
 * Sends an invoice to the customer via email
 * @param invoiceId Stripe invoice ID
 * @returns Invoice send response
 */
export async function sendInvoice(invoiceId: string): Promise<InvoiceSendResponse> {
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
 * Gets invoice details including status updates from Stripe
 * @param invoiceId Stripe invoice ID
 * @returns Invoice details
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('get-invoice', {
      body: {},
      url: `?id=${invoiceId}`
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
 * Lists all invoices for the authenticated user
 * @returns List of invoices
 */
export async function listInvoices(): Promise<{ success: boolean; invoices?: Invoice[]; error?: string }> {
  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('list-invoices', {
      body: {}
    });

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

/**
 * Generates a QR code URL for a payment link
 * @param paymentUrl Payment URL to encode in the QR code
 * @returns URL to a QR code image
 */
export function generateQRCodeUrl(paymentUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentUrl)}`;
}
