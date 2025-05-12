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
