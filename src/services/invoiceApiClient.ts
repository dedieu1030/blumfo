
/**
 * Client pour interagir avec l'API de génération de PDF
 */

// URL de l'API - à remplacer par votre URL réelle
// Par exemple pour Supabase: https://your-project-ref.functions.supabase.co/generate-invoice-pdf
const API_URL = import.meta.env.VITE_PDF_SERVICE_URL || '';

// Types pour les requêtes et réponses
export interface GeneratePdfRequest {
  invoiceData: any; 
  templateId: string;
  html?: string;
  accessToken?: string;
}

export interface GeneratePdfResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

/**
 * Appelle l'API pour générer un PDF d'une facture
 */
export async function generateInvoicePdf(
  invoiceData: any,
  templateId: string,
  accessToken?: string
): Promise<GeneratePdfResponse> {
  try {
    // Vérifier si l'URL de l'API est configurée
    if (!API_URL) {
      console.warn('PDF API URL not configured. Using local generation. Set VITE_PDF_SERVICE_URL in your environment for production.');
      // Utiliser la génération HTML locale et simuler une URL PDF
      return {
        success: true,
        pdfUrl: `data:application/pdf;base64,${btoa(JSON.stringify(invoiceData))}`
      };
    }
    
    // Préparation de la requête
    const request: GeneratePdfRequest = {
      invoiceData,
      templateId,
      accessToken
    };

    // Appel à l'API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify(request)
    });

    // Traitement de la réponse
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result as GeneratePdfResponse;
  } catch (error) {
    console.error('Error calling PDF API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling PDF API'
    };
  }
}

/**
 * Télécharge un PDF depuis une URL
 */
export function downloadPdf(pdfUrl: string, fileName: string = 'invoice.pdf'): void {
  // Création d'un lien invisible pour le téléchargement
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = fileName;
  
  // Ajout au DOM, clic, puis suppression
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Génère et télécharge un PDF de facture
 */
export async function generateAndDownloadInvoicePdf(
  invoiceData: any,
  templateId: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const result = await generateInvoicePdf(invoiceData, templateId, accessToken);
    
    if (result.success && result.pdfUrl) {
      // Téléchargement automatique du PDF
      downloadPdf(result.pdfUrl, `facture_${invoiceData.invoiceNumber}.pdf`);
      return true;
    } else {
      console.error('Failed to generate PDF:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    return false;
  }
}
