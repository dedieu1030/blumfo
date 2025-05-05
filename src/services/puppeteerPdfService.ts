
/**
 * Ce service est conçu pour être utilisé dans une Supabase Edge Function
 * ou toute autre fonction serverless (Vercel, AWS Lambda, etc.)
 */

import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from './pdfGenerator';

// Types pour les requêtes et réponses
export interface GeneratePdfRequest {
  invoiceData: any; 
  templateId: string;
  accessToken?: string; // Pour l'authentification
}

export interface GeneratePdfResponse {
  success: boolean;
  pdfBuffer?: Buffer;
  pdfUrl?: string;
  error?: string;
}

/**
 * Fonction principale pour générer un PDF avec Puppeteer
 * Cette fonction est destinée à être exécutée côté serveur
 */
export async function generatePdf(request: GeneratePdfRequest): Promise<GeneratePdfResponse> {
  try {
    // Vérification d'authentification (à implémenter selon votre système d'auth)
    if (!validateAuth(request.accessToken)) {
      return {
        success: false,
        error: 'Authentication failed'
      };
    }

    // Génération du HTML à partir des données de facture
    const htmlContent = generateInvoiceHTML(request.invoiceData, request.templateId);

    // Lancement de Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Nécessaire pour les environnements serverless
    });
    
    const page = await browser.newPage();
    
    // Configuration de la page pour format A4
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Génération du PDF avec options précises pour A4
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
    await browser.close();
    
    // Dans un environnement réel, vous pourriez stocker le PDF dans un stockage cloud
    // et renvoyer l'URL plutôt que le buffer directement
    const pdfUrl = await storePdfInStorage(pdfBuffer, request.invoiceData.invoiceNumber);
    
    return {
      success: true,
      pdfBuffer,
      pdfUrl
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fonction fictive pour la validation d'authentification
// À remplacer par votre logique d'authentification réelle (JWT, session, etc.)
function validateAuth(accessToken?: string): boolean {
  // Exemple simple: vérifier si le token existe
  // Dans un cas réel: vérifier la validité du JWT, la session, etc.
  if (!accessToken) return false;
  
  // Logique de validation du token
  // Retourne true si le token est valide
  return accessToken.length > 0; 
}

// Fonction fictive pour stocker le PDF
// À remplacer par votre logique de stockage réelle (S3, Supabase Storage, etc.)
async function storePdfInStorage(pdfBuffer: Buffer, invoiceNumber: string): Promise<string> {
  // Dans une implémentation réelle, vous utiliseriez:
  // - Supabase Storage: await supabaseClient.storage.from('invoices').upload(...)
  // - AWS S3: await s3Client.putObject(...)
  // - Firebase Storage: await storageRef.put(...)
  
  // Exemple fictif retournant une URL simulée
  return `https://storage.example.com/invoices/${invoiceNumber}.pdf`;
}
