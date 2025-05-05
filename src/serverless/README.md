
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

3. Adapt the code in `generate-pdf.js` to work with Deno:
   - Change imports to use Deno URLs
   - Update the request/response handling code
   - Sample code:

   ```typescript
   import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
   import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
   
   serve(async (req) => {
     // Function code adapted from generate-pdf.js
     // ...

     return new Response(JSON.stringify({ success: true, pdfUrl: "..." }), {
       headers: { "Content-Type": "application/json", ...corsHeaders }
     });
   });
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

To deploy as a Vercel serverless function:

1. Create a new API route in `api/generate-invoice-pdf.js`
2. Install puppeteer:
   ```
   npm install puppeteer
   ```
3. Copy the code from `generate-pdf.js` and adapt it to the Next.js API format:
   ```javascript
   export default async function handler(req, res) {
     // Function code adapted from generate-pdf.js
     // ...
   }
   ```

### 3. AWS Lambda

For AWS Lambda deployment:

1. Create a Lambda function with Node.js runtime
2. Use a Lambda layer that includes Chromium
3. Adapt the handler function accordingly

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
    "total": 120
  },
  "templateId": "classic"
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
