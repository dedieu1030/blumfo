
/**
 * Client for interacting with Stripe API to create payment links for invoices
 */

interface CreatePaymentLinkRequest {
  invoiceData: any;
  amount: number; // Amount in smallest currency unit (cents)
  currency?: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

interface CreatePaymentLinkResponse {
  success: boolean;
  paymentUrl?: string;
  qrCodeUrl?: string;
  error?: string;
}

// URL of your serverless function that creates payment links
const API_URL = import.meta.env.VITE_STRIPE_SERVICE_URL || '';

/**
 * Creates a payment link for an invoice via the server function
 */
export async function createStripePaymentLink(
  request: CreatePaymentLinkRequest,
  accessToken?: string
): Promise<CreatePaymentLinkResponse> {
  try {
    // Check if API URL is configured
    if (!API_URL) {
      return {
        success: false,
        error: 'Payment API URL not configured. Please set VITE_STRIPE_SERVICE_URL in your environment.'
      };
    }
    
    // Send request to API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify(request)
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    // Parse and return response
    const result = await response.json();
    return result as CreatePaymentLinkResponse;
  } catch (error) {
    console.error('Error creating payment link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating payment link'
    };
  }
}
