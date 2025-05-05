
# Serverless PDF Generation Service

This folder contains code for deploying a serverless function that generates PDF invoices using Puppeteer.

## Deployment Options

### 1. Supabase Edge Functions

To deploy as a Supabase Edge Function:

1. First, install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Create a new Edge Function:
   ```
   supabase functions new generate-invoice-pdf
   ```

3. Create an `index.ts` file with the following Deno-compatible code:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
   };

   serve(async (req) => {
     // Handle OPTIONS request for CORS
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders });
     }

     try {
       // Authentication check
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

       // Parse request body
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

       // Generate HTML content
       const htmlContent = generateInvoiceHtml(invoiceData, templateId);

       // Launch Puppeteer
       const browser = await puppeteer.launch({
         args: ['--no-sandbox', '--disable-setuid-sandbox']
       });
       
       const page = await browser.newPage();
       
       // Make sure external Google Fonts are loaded when using templates that need them
       const waitForNetworkIdle = templateId === 'poppins-orange';
       await page.setContent(htmlContent, { 
         waitUntil: waitForNetworkIdle ? 'networkidle0' : 'domcontentloaded' 
       });

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

       // For a full implementation, you would save the PDF to Supabase Storage here
       // const { data, error } = await supabaseAdmin.storage.from('invoices')
       //   .upload(`${invoiceData.invoiceNumber}.pdf`, pdfBuffer, { contentType: 'application/pdf' });

       // Return a simulated URL (In production, use the actual Supabase Storage URL)
       const pdfUrl = `https://storage.example.com/invoices/${invoiceData.invoiceNumber}.pdf`;

       return new Response(JSON.stringify({
         success: true,
         pdfUrl: pdfUrl,
       }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       });
     } catch (error) {
       console.error('Error generating PDF:', error);
       return new Response(JSON.stringify({
         success: false,
         error: error.message || 'Internal server error'
       }), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       });
     }
   });

   // HTML generation function - in production, import your actual HTML generator or use a template engine
   function generateInvoiceHtml(invoiceData, templateId) {
     // This would be replaced by your actual template system
     const template = templateId || 'classic';
     
     // For Poppins Orange template, include Google Fonts
     let fontImport = '';
     if (template === 'poppins-orange') {
       fontImport = '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet">';
     }
     
     return `
       <!DOCTYPE html>
       <html>
         <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           ${fontImport}
           <style>
             @page {
               size: A4;
               margin: 0;
             }
             body {
               margin: 0;
               padding: 20px;
               font-family: ${template === 'poppins-orange' ? "'Poppins', sans-serif" : "Arial, sans-serif"};
             }
             /* Template-specific styles would be applied here */
           </style>
         </head>
         <body>
           <h1>Facture #${invoiceData.invoiceNumber}</h1>
           <p>Client: ${invoiceData.clientName}</p>
           <p>Date: ${invoiceData.invoiceDate}</p>
           
           <!-- Invoice items table -->
           <table style="width: 100%; border-collapse: collapse;">
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
           
           <!-- Payment information -->
           <div style="margin-top: 30px;">
             <p><strong>Modalités de paiement:</strong> ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
               invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</p>
             ${invoiceData.notes ? `<p><strong>Notes:</strong> ${invoiceData.notes}</p>` : ''}
           </div>
         </body>
       </html>
     `;
   }
   ```

4. Deploy the function:
   ```
   supabase functions deploy generate-invoice-pdf
   ```

5. Set the function URL in your application:
   ```
   VITE_PDF_SERVICE_URL=https://[YOUR_PROJECT_REF].supabase.co/functions/v1/generate-invoice-pdf
   ```

### 2. Vercel / Next.js API Routes

For Vercel deployment, use the code in `generate-pdf.js` as a template for your API route:

1. Create a Next.js API route in `pages/api/generate-invoice-pdf.js`
2. Install puppeteer: `npm install puppeteer`
3. Copy and adapt the code from `generate-pdf.js`
4. Make sure to handle Google Fonts loading for templates like Poppins Orange

### 3. AWS Lambda

For AWS Lambda deployment:

1. Create a Lambda function with Node.js runtime
2. Use a Lambda layer that includes Chromium
3. Adapt the handler function from `generate-pdf.js`
4. Configure the Lambda to have sufficient memory and timeout settings to handle PDF rendering with fonts

## Usage

Make a POST request with the following JSON body:

```json
{
  "invoiceData": {
    "invoiceNumber": "INV-001",
    "clientName": "Client Name",
    "invoiceDate": "2023-05-05",
    "serviceLines": [
      {
        "description": "Service description",
        "quantity": "1",
        "unitPrice": "100",
        "tva": "20",
        "total": "120"
      }
    ],
    "subtotal": 100,
    "taxTotal": 20,
    "total": 120,
    "paymentMethod": "card",
    "notes": "Thank you for your business."
  },
  "templateId": "poppins-orange" // or "classic", "modern", etc.
}
```

## Response Format

```json
{
  "success": true,
  "pdfUrl": "https://storage.example.com/invoices/INV-001.pdf"
}
```

## Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Template Information

The system supports multiple invoice templates:

- **Classic**: Simple, professional design with bordered tables
- **Modern**: Clean, minimalistic design with subtle colors
- **Elegant**: Sophisticated design with refined typography
- **Colorful**: Bold design with vibrant color accents
- **Poppins Orange**: Stylish design using Poppins font with orange accents

Each template has specific formatting requirements and may use different fonts.
