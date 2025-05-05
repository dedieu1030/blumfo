
// Exemple de Edge Function Supabase pour la génération de PDF avec Puppeteer
// Pour déployer: supabase functions deploy generate-invoice-pdf
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extraire et valider le token (dans un scénario réel)
    const token = authHeader.split(' ')[1];
    // Valider le token avec Supabase Auth...

    // Analyser le corps de la requête
    const requestData = await req.json();
    const { invoiceData, templateId } = requestData;

    if (!invoiceData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invoice data is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Générer le HTML de la facture
    // Note: Dans une vraie Edge Function, importez la fonction de génération HTML
    const htmlContent = generateInvoiceHtml(invoiceData, templateId);

    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Générer le PDF
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

    // Stocker le PDF dans Supabase Storage (exemple)
    // const { data, error } = await supabase.storage
    //   .from('invoices')
    //   .upload(`invoices/${invoiceData.invoiceNumber}.pdf`, pdfBuffer, {
    //     contentType: 'application/pdf',
    //     upsert: true,
    //   });

    // Simuler l'URL de stockage pour cet exemple
    const pdfUrl = `https://storage.example.com/invoices/${invoiceData.invoiceNumber}.pdf`;

    // Retourner la réponse
    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: pdfUrl,
        // Dans un scénario réel, on ne renverrait généralement pas le buffer directement
        // pdfBase64: pdfBuffer.toString('base64')
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Fonction simplifiée pour générer le HTML
// Dans une vraie Edge Function, vous importeriez cette logique depuis un autre fichier
function generateInvoiceHtml(invoiceData: any, templateId: string): string {
  // Version simplifiée - dans un scénario réel, importez la fonction depuis votre module pdfGenerator
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>Facture #${invoiceData.invoiceNumber}</h1>
        <p>Client: ${invoiceData.clientName}</p>
        <p>Date: ${invoiceData.invoiceDate}</p>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>TVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.serviceLines.map((line: any) => `
              <tr>
                <td>${line.description}</td>
                <td>${line.quantity}</td>
                <td>${line.unitPrice} €</td>
                <td>${line.tva}%</td>
                <td>${line.total} €</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p>Sous-total: ${invoiceData.subtotal} €</p>
          <p>TVA: ${invoiceData.taxTotal} €</p>
          <p><strong>Total: ${invoiceData.total} €</strong></p>
        </div>
      </body>
    </html>
  `;
}
