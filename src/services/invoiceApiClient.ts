
import { supabase } from "@/integrations/supabase/client";

// Interface pour les détails du paiement
export interface PaymentDetails {
  date?: Date;
  method?: string;
  reference?: string;
}

/**
 * Marque une facture comme payée dans le système
 * @param invoiceId ID de la facture à marquer comme payée
 * @param paymentDetails Détails optionnels du paiement (date, méthode, référence)
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

export const generateAndDownloadInvoicePdf = async (
  invoiceData: any,
  templateId: string,
  authToken?: string
): Promise<boolean> => {
  try {
    // Generate the PDF blob
    const pdfBlob = await generateInvoicePdf(invoiceData, templateId, authToken);

    // Create a download link
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    return false;
  }
};

const generateInvoicePdf = async (
  invoiceData: any,
  templateId: string,
  authToken?: string
): Promise<Blob> => {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-production-url.com';
  const endpoint = `${baseUrl}/api/generate-pdf`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ invoiceData, templateId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Nouvelle fonction pour créer une facture avec Stripe
export async function createStripeCheckoutSession(invoiceData: any): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('create-invoice', {
      body: {
        customerEmail: invoiceData.clientEmail,
        customerName: invoiceData.clientName,
        items: invoiceData.serviceLines.map((line: any) => ({
          description: line.description,
          quantity: parseFloat(line.quantity) || 1,
          unit_amount: parseFloat(line.unitPrice) * 100 || 0, // Convert to cents
          tax_rates: [line.tva ? `txr_${line.tva.replace('.', '_')}` : 'txr_20'],
          discount: line.discount
        })),
        dueDate: invoiceData.dueDate ? Math.floor(new Date(invoiceData.dueDate).getTime() / 1000) : undefined,
        currency: (invoiceData.issuerInfo?.defaultCurrency || 'eur').toLowerCase(),
        metadata: {
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
          client_email: invoiceData.clientEmail,
          client_address: invoiceData.clientAddress,
        },
        // Nouvelles propriétés
        discount: invoiceData.discount,
        introText: invoiceData.introText,
        conclusionText: invoiceData.conclusionText,
        footerText: invoiceData.footerText,
      }
    });

    if (error) {
      console.error('Error creating Stripe invoice:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment session'
      };
    }

    if (!data?.paymentLink) {
      return {
        success: false,
        error: 'No payment link returned from server'
      };
    }

    return {
      success: true,
      url: data.paymentLink
    };
  } catch (error) {
    console.error('Exception creating Stripe invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating payment session'
    };
  }
}
