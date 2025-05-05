
/**
 * This file contains code for a serverless function that generates PDFs using Puppeteer.
 * 
 * DEPLOYMENT GUIDE:
 * 
 * For Supabase Edge Functions:
 * 1. Create a new Edge Function
 *    supabase functions new generate-invoice-pdf
 * 
 * 2. Adapt this code for Deno (modifying imports) and copy it to the function folder
 *    - Change imports to use Deno URLs
 *    - Update the code to use Deno-specific features
 * 
 * 3. Deploy the function
 *    supabase functions deploy generate-invoice-pdf
 * 
 * For Vercel, Next.js, or other Node.js environments:
 * 1. Create an API route
 * 2. Install puppeteer: npm install puppeteer
 * 3. Copy this code (with appropriate modifications) to your API handler
 */

const puppeteer = require('puppeteer');

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// This function is the main handler for HTTP requests
// Adapt it based on your serverless platform
async function handler(req, res) {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end('ok');
    return;
  }

  try {
    // Authenticate the request (implementation depends on your auth system)
    // This is just a placeholder - replace with your actual auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required');
    }

    // Extract and validate the token (in a real scenario)
    // const token = authHeader.split(' ')[1];
    // validateToken(token) - implement this based on your auth system

    // Parse request body
    const requestData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { invoiceData, templateId, html } = requestData;

    if (!invoiceData && !html) {
      return sendError(res, 400, 'Invoice data or HTML content is required');
    }

    // Generate HTML if raw HTML wasn't provided
    let htmlContent = html;
    if (!htmlContent && invoiceData) {
      // Import your HTML generation function or implement it here
      // This is just a placeholder - you'll need to implement this
      htmlContent = generateInvoiceHtml(invoiceData, templateId);
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
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

    // In a real implementation, you would:
    // 1. Save the PDF to cloud storage (S3, Supabase Storage, etc.)
    // 2. Return the URL to the stored PDF

    // This is a placeholder for saving to storage
    const pdfUrl = await savePdfToStorage(pdfBuffer, invoiceData?.invoiceNumber || 'invoice');

    // Send success response
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      pdfUrl: pdfUrl,
      // Don't send the buffer in production unless really needed
      // pdfBase64: pdfBuffer.toString('base64')
    }));
  } catch (error) {
    console.error('Error generating PDF:', error);
    sendError(res, 500, error.message || 'Internal server error');
  }
}

// Helper function to send error responses
function sendError(res, statusCode, message) {
  res.writeHead(statusCode, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: message
  }));
}

// Placeholder function for generating HTML
// In a real implementation, you would import this from a shared module
function generateInvoiceHtml(invoiceData, templateId) {
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
            ${invoiceData.serviceLines.map(line => `
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

// Placeholder function for saving PDF to storage
// Replace with actual storage implementation
async function savePdfToStorage(pdfBuffer, filename) {
  // In a real implementation, you would:
  // 1. Save to S3: await s3.putObject(...)
  // 2. Save to Supabase Storage: await supabase.storage.from('invoices').upload(...)
  // 3. Save to Firebase Storage: await storageRef.put(...)
  
  // This is a placeholder returning a simulated URL
  return `https://storage.example.com/invoices/${filename}.pdf`;
}

// Export the handler for serverless platforms
// The exact export format depends on your platform
module.exports = handler;
