
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

    // Check if the template requires special font handling
    const waitForNetworkIdle = templateId === 'poppins-orange';

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // For templates using Google Fonts, wait for fonts to load
    await page.setContent(htmlContent, { 
      waitUntil: waitForNetworkIdle ? 'networkidle0' : 'domcontentloaded' 
    });

    // Generate PDF with proper A4 settings
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

// Function for generating HTML
function generateInvoiceHtml(invoiceData, templateId) {
  const template = templateId || 'classic';
  
  // Include Google Fonts link for templates that need it
  let fontImport = '';
  if (template === 'poppins-orange') {
    fontImport = '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet">';
  }
  
  // Format dates
  const invoiceDate = new Date(invoiceData.invoiceDate).toLocaleDateString();
  
  // Calculate due date based on payment delay
  let dueDate = new Date(invoiceData.invoiceDate);
  if (invoiceData.paymentDelay === 'immediate') {
    dueDate = new Date(invoiceData.invoiceDate);
  } else {
    const delayDays = parseInt(invoiceData.paymentDelay) || 0;
    dueDate.setDate(dueDate.getDate() + delayDays);
  }
  const formattedDueDate = dueDate.toLocaleDateString();
  
  // Generate HTML based on template
  if (template === 'poppins-orange') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${fontImport}
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Poppins', sans-serif;
            background: #fff;
            padding: 30px;
            color: #1a1a1a;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 40px;
          }
          h1 {
            font-size: 48px;
            font-weight: 900;
            margin-bottom: 40px;
          }
          .top-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .left h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .left p {
            font-weight: 700;
            font-size: 16px;
            color: #2c2c64;
            border-bottom: 2px solid #2c2c64;
            display: inline-block;
          }
          .right {
            text-align: right;
            font-size: 14px;
          }
          .right .total-due {
            font-weight: 700;
            color: #2c2c64;
            font-size: 18px;
          }
          .invoice-no {
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
          }
          th {
            background: #1a1a1a;
            color: #fff;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          tr:nth-child(even) td {
            background: #f2f2f2;
          }
          .summary {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }
          .summary-box {
            text-align: right;
            font-size: 14px;
          }
          .summary-box p {
            margin-bottom: 8px;
          }
          .total-box {
            background: #1a1a1a;
            color: #fff;
            padding: 10px 20px;
            margin-top: 10px;
            display: inline-block;
            font-weight: 700;
            font-size: 16px;
          }
          .payment, .terms {
            margin-top: 40px;
            font-size: 13px;
          }
          .payment strong {
            display: block;
            margin-bottom: 4px;
          }
          .terms p {
            margin-top: 10px;
            font-style: italic;
          }
          .signature {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature .name {
            font-weight: 600;
            color: #1a1a1a;
          }
          .footer-bar {
            margin-top: 60px;
            background: #ff914d;
            height: 30px;
            position: relative;
          }
          .footer-arrow {
            position: absolute;
            top: 0;
            left: 40px;
            width: 0;
            height: 0;
            border-top: 30px solid transparent;
            border-left: 40px solid #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <h1>INVOICE</h1>
          <div class="top-section">
            <div class="left">
              <h4>INVOICE TO :</h4>
              <p>${invoiceData.clientName}</p>
            </div>
            <div class="right">
              <div><strong>Date :</strong> ${invoiceDate}</div>
              <div><strong>Due Date :</strong> ${formattedDueDate}</div>
              <div><strong>TOTAL DUE :</strong></div>
              <div class="total-due">${invoiceData.total} €</div>
              <div class="invoice-no">Invoice No : ${invoiceData.invoiceNumber}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
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

          <div class="summary">
            <div class="summary-box">
              <p>Sous-total : ${invoiceData.subtotal} €</p>
              <p>TVA : ${invoiceData.taxTotal} €</p>
              <div class="total-box">Total : ${invoiceData.total} €</div>
            </div>
          </div>

          <div class="payment">
            <strong>Modalités de paiement</strong>
            <div>
              <em>Méthode : ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
                invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</em>
            </div>
            ${invoiceData.paymentMethod === 'transfer' ? `
              <div><em>Compte bancaire : FR76 3000 1007 0000 0000 0000 000</em></div>
              <div><em>BIC : BNPAFRPP</em></div>
            ` : ''}
          </div>

          ${invoiceData.notes ? `
            <div class="terms">
              <strong>Termes et conditions</strong>
              <p>${invoiceData.notes}</p>
            </div>
          ` : ''}
          
          <div class="signature">
            <div></div>
            <div>
              <p class="name">Votre Entreprise</p>
              <p>Administrator</p>
            </div>
          </div>

          <div class="footer-bar">
            <div class="footer-arrow"></div>
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    // Default template or other templates (simplified for example)
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
          <p>Date: ${invoiceDate}</p>
          
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
          
          <div style="margin-top: 20px;">
            <p><strong>Modalités de paiement:</strong> ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
              invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</p>
            ${invoiceData.notes ? `<p><strong>Notes:</strong> ${invoiceData.notes}</p>` : ''}
          </div>
        </body>
      </html>
    `;
  }
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
