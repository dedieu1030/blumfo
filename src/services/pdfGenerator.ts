// This file handles PDF generation from invoice templates

import { formatMoney } from './stripe';

// Template preview image URLs
const TEMPLATE_PREVIATES = {
  classic: "/templates/classic-preview.png",
  modern: "/templates/modern-preview.png",
  elegant: "/templates/elegant-preview.png",
  colorful: "/templates/colorful-preview.png",
  "poppins-orange": "/templates/poppins-orange-preview.png"
};

// A4 paper dimensions in CSS pixels (96 dpi)
const A4_WIDTH_PX = 595;
const A4_HEIGHT_PX = 842;

// Real-world fallback URLs if templates aren't available locally
const FALLBACK_PREVIEWS = {
  classic: "https://via.placeholder.com/600x800/f5f5f5/333?text=Classic+Template",
  modern: "https://via.placeholder.com/600x800/ffffff/333?text=Modern+Template", 
  elegant: "https://via.placeholder.com/600x800/fafafa/333?text=Elegant+Template",
  colorful: "https://via.placeholder.com/600x800/f0f0ff/333?text=Colorful+Template",
  "poppins-orange": "https://via.placeholder.com/600x800/fff5f0/333?text=Poppins+Orange"
};

/**
 * Generates HTML content for an invoice from a template and data
 * @param invoiceData Invoice data to include in the HTML
 * @param templateId ID of the template to use
 * @returns HTML string of the invoice
 */
export const generateInvoiceHTML = (invoiceData: any, templateId: string): string => {
  const template = templateId || 'classic';
  
  // Format dates
  const invoiceDate = new Date(invoiceData.invoiceDate).toLocaleDateString('fr-FR');
  
  // Calculate due date based on payment delay
  let dueDate = new Date(invoiceData.invoiceDate);
  if (invoiceData.paymentDelay === 'immediate') {
    dueDate = new Date(invoiceData.invoiceDate);
  } else {
    const delayDays = parseInt(invoiceData.paymentDelay) || 0;
    dueDate.setDate(dueDate.getDate() + delayDays);
  }
  const formattedDueDate = dueDate.toLocaleDateString('fr-FR');
  
  // Start building HTML based on template
  let html = '';
  
  // Common CSS for all templates to ensure proper PDF rendering
  const commonStyles = `
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: sans-serif;
      font-size: 12px;
      line-height: 1.5;
    }
    .invoice-container {
      max-width: 100%;
      margin: 0;
      box-sizing: border-box;
    }
  `;
  
  // This would be more complex in a real implementation with proper HTML templates
  // Here's a simplified version for demo purposes
  switch(template) {
    case 'poppins-orange':
      html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet">
        <style>
          ${commonStyles}
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Poppins', sans-serif;
            background: #fff;
            padding: 30px;
            color: #1a1a1a;
          }
          .invoice-box {
            width: ${A4_WIDTH_PX - 80}px;
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
          .payment-link {
            margin-top: 20px;
            background: #f8f8f8;
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 5px;
          }
          .payment-link h4 {
            color: #2c2c64;
            margin-bottom: 10px;
          }
          .payment-link .link {
            color: #ff914d;
            font-weight: 600;
            word-break: break-all;
          }
          .payment-qr {
            text-align: center;
            margin-top: 10px;
          }
          .payment-qr img {
            max-width: 150px;
            max-height: 150px;
            border: 1px solid #eee;
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
              <div class="total-due">${formatMoney(invoiceData.total)}</div>
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
              ${invoiceData.serviceLines.map((line: any) => `
                <tr>
                  <td>${line.description}</td>
                  <td>${line.quantity}</td>
                  <td>${formatMoney(parseFloat(line.unitPrice))}</td>
                  <td>${line.tva}%</td>
                  <td>${formatMoney(parseFloat(line.total))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <p>Sous-total : ${formatMoney(invoiceData.subtotal)}</p>
              <p>TVA : ${formatMoney(invoiceData.taxTotal)}</p>
              <div class="total-box">Total : ${formatMoney(invoiceData.total)}</div>
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
      break;
      
    case 'modern':
      html = `
      <style>
        ${commonStyles}
      </style>
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h1 style="font-size: 28px; color: #5046e5;">FACTURE</h1>
            <p style="color: #666;">N° ${invoiceData.invoiceNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-weight: bold; font-size: 18px;">Votre Entreprise</p>
            <p>123 Rue de Paris</p>
            <p>75001 Paris, France</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2 style="color: #5046e5; font-size: 18px; margin-bottom: 10px;">Facturer à:</h2>
            <p style="font-weight: bold;">${invoiceData.clientName}</p>
            <p>${invoiceData.clientAddress}</p>
            <p>${invoiceData.clientEmail}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Date d'émission:</strong> ${invoiceDate}</p>
            <p><strong>Échéance:</strong> ${formattedDueDate}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
          <thead>
            <tr style="background-color: #f4f4f8; text-align: left;">
              <th style="padding: 12px; border-bottom: 2px solid #5046e5;">Description</th>
              <th style="padding: 12px; border-bottom: 2px solid #5046e5;">Quantité</th>
              <th style="padding: 12px; border-bottom: 2px solid #5046e5;">Prix unitaire</th>
              <th style="padding: 12px; border-bottom: 2px solid #5046e5;">TVA</th>
              <th style="padding: 12px; border-bottom: 2px solid #5046e5;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.serviceLines.map((line: any) => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${line.description}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${line.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${formatMoney(parseFloat(line.unitPrice))}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${line.tva}%</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${formatMoney(parseFloat(line.total))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-left: auto; width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <p>Sous-total:</p>
            <p>${formatMoney(invoiceData.subtotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <p>TVA:</p>
            <p>${formatMoney(invoiceData.taxTotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 18px;">
            <p>Total:</p>
            <p>${formatMoney(invoiceData.total)}</p>
          </div>
        </div>
        
        <div style="margin: 40px 0; border-top: 1px solid #eee; padding-top: 20px;">
          <h2 style="color: #5046e5; font-size: 18px;">Modalités de paiement</h2>
          <p>Méthode de paiement: ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
            invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</p>
          ${invoiceData.notes ? `<p>Notes: ${invoiceData.notes}</p>` : ''}
        </div>
      </div>
      `;
      break;
      
    case 'elegant':
      html = `
      <style>
        ${commonStyles}
      </style>
      <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #222;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #222; padding-bottom: 20px;">
          <h1 style="font-size: 32px; margin-bottom: 5px;">FACTURE</h1>
          <p style="font-style: italic;">N° ${invoiceData.invoiceNumber}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <p style="font-weight: bold; font-size: 18px;">Votre Entreprise</p>
            <p>123 Rue de Paris</p>
            <p>75001 Paris, France</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <p><strong>Échéance:</strong> ${formattedDueDate}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Facturer à:</h2>
          <p style="font-weight: bold;">${invoiceData.clientName}</p>
          <p>${invoiceData.clientAddress}</p>
          <p>${invoiceData.clientEmail}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #222; text-align: left;">
              <th style="padding: 12px;">Description</th>
              <th style="padding: 12px;">Quantité</th>
              <th style="padding: 12px;">Prix unitaire</th>
              <th style="padding: 12px;">TVA</th>
              <th style="padding: 12px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.serviceLines.map((line: any) => `
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px;">${line.description}</td>
                <td style="padding: 12px;">${line.quantity}</td>
                <td style="padding: 12px;">${formatMoney(parseFloat(line.unitPrice))}</td>
                <td style="padding: 12px;">${line.tva}%</td>
                <td style="padding: 12px;">${formatMoney(parseFloat(line.total))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-left: auto; width: 300px; border-top: 1px solid #ccc; padding-top: 20px;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <p>Sous-total:</p>
            <p>${formatMoney(invoiceData.subtotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <p>TVA:</p>
            <p>${formatMoney(invoiceData.taxTotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 18px; border-top: 1px solid #ccc; margin-top: 10px;">
            <p>Total:</p>
            <p>${formatMoney(invoiceData.total)}</p>
          </div>
        </div>
        
        <div style="margin: 40px 0; font-style: italic;">
          <p>Modalités de paiement: ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
            invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</p>
          ${invoiceData.notes ? `<p>Notes: ${invoiceData.notes}</p>` : ''}
        </div>
      </div>
      `;
      break;

    case 'colorful':
      html = `
      <style>
        ${commonStyles}
      </style>
      <div style="font-family: 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; background-color: #fcfcff;">
        <div style="background-color: #4a6cf7; color: white; padding: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h1 style="font-size: 28px; margin: 0;">FACTURE</h1>
              <p style="margin: 5px 0 0;">N° ${invoiceData.invoiceNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold;">Votre Entreprise</p>
              <p>123 Rue de Paris</p>
              <p>75001 Paris, France</p>
            </div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="background-color: #f0f4ff; padding: 20px; border-left: 4px solid #4a6cf7; width: 45%;">
            <h2 style="color: #4a6cf7; font-size: 18px; margin-top: 0;">Facturer à:</h2>
            <p style="font-weight: bold;">${invoiceData.clientName}</p>
            <p>${invoiceData.clientAddress}</p>
            <p>${invoiceData.clientEmail}</p>
          </div>
          <div style="background-color: #f0f4ff; padding: 20px; text-align: right; width: 45%;">
            <p><strong>Date d'émission:</strong> ${invoiceDate}</p>
            <p><strong>Échéance:</strong> ${formattedDueDate}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: white; border-radius: 5px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <thead>
            <tr style="background-color: #4a6cf7; color: white; text-align: left;">
              <th style="padding: 15px;">Description</th>
              <th style="padding: 15px;">Quantité</th>
              <th style="padding: 15px;">Prix unitaire</th>
              <th style="padding: 15px;">TVA</th>
              <th style="padding: 15px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.serviceLines.map((line: any, index: number) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f9fbff' : 'white'};">
                <td style="padding: 15px; border-bottom: 1px solid #eee;">${line.description}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee;">${line.quantity}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee;">${formatMoney(parseFloat(line.unitPrice))}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee;">${line.tva}%</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee;">${formatMoney(parseFloat(line.total))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-left: auto; width: 300px; background-color: #f0f4ff; padding: 20px; border-radius: 5px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dbe1ff;">
            <p>Sous-total:</p>
            <p>${formatMoney(invoiceData.subtotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dbe1ff;">
            <p>TVA:</p>
            <p>${formatMoney(invoiceData.taxTotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #4a6cf7;">
            <p>Total:</p>
            <p>${formatMoney(invoiceData.total)}</p>
          </div>
        </div>
        
        <div style="margin: 40px 0; background-color: #f0f4ff; padding: 20px; border-radius: 5px;">
          <h2 style="color: #4a6cf7; font-size: 18px; margin-top: 0;">Modalités de paiement</h2>
          <p>Méthode: ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
            invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</p>
          ${invoiceData.notes ? `<p>Notes: ${invoiceData.notes}</p>` : ''}
        </div>
      </div>
      `;
      break;
      
    // Classic (default) template
    default:
      html = `
      <style>
        ${commonStyles}
      </style>
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h1 style="font-size: 24px; margin-bottom: 0;">FACTURE</h1>
            <p>N° ${invoiceData.invoiceNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-weight: bold;">Votre Entreprise</p>
            <p>123 Rue de Paris</p>
            <p>75001 Paris, France</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2 style="font-size: 16px;">Facturer à:</h2>
            <p style="font-weight: bold;">${invoiceData.clientName}</p>
            <p>${invoiceData.clientAddress}</p>
            <p>${invoiceData.clientEmail}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Date d'émission:</strong> ${invoiceDate}</p>
            <p><strong>Échéance:</strong> ${formattedDueDate}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Description</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Quantité</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Prix unitaire</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">TVA</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.serviceLines.map((line: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${line.description}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${line.quantity}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${formatMoney(parseFloat(line.unitPrice))}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${line.tva}%</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${formatMoney(parseFloat(line.total))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-left: auto; width: 250px;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <p>Sous-total:</p>
            <p>${formatMoney(invoiceData.subtotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <p>TVA:</p>
            <p>${formatMoney(invoiceData.taxTotal)}</p>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold;">
            <p>Total:</p>
            <p>${formatMoney(invoiceData.total)}</p>
          </div>
        </div>
        
        <div style="margin: 30px 0; border-top: 1px solid #ddd; padding-top: 20px;">
          <p><strong>Modalités de paiement:</strong> ${invoiceData.paymentMethod === 'card' ? 'Carte bancaire' : 
            invoiceData.paymentMethod === 'transfer' ? 'Virement bancaire' : 'Carte ou virement'}</p>
          ${invoiceData.notes ? `<p><strong>Notes:</strong> ${invoiceData.notes}</p>` : ''}
        </div>
      </div>
      `;
  }
  
  return html;
};

/**
 * Generates a PDF from invoice data using the selected template
 * @param invoiceData Invoice data to include in the PDF
 * @param templateId ID of the template to use
 * @returns URL to the generated PDF
 */
export const generateInvoicePDF = async (invoiceData: any, templateId: string) => {
  try {
    console.log(`Generating PDF using template: ${templateId}`, invoiceData);
    
    // In production, this would use a library like jsPDF or html2pdf
    // to generate an actual PDF from the invoice template
    
    // Generate the HTML content first (we would convert this to PDF in production)
    const htmlContent = generateInvoiceHTML(invoiceData, templateId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response - in production this would return a URL to the generated PDF
    // or the PDF data itself as a Blob/Base64
    return {
      success: true,
      pdfUrl: `https://example.com/invoices/preview_${Math.random().toString(36).substring(7)}.pdf`,
      htmlContent, // In production, this would be the PDF data
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: 'Failed to generate PDF',
    };
  }
};

/**
 * Generates a preview URL of how the invoice would look with the given template
 * @param invoiceData Invoice data to preview
 * @param templateId ID of the template to use
 * @returns URL to the preview image
 */
export const generateInvoicePreview = async (invoiceData: any, templateId: string) => {
  try {
    console.log(`Generating preview using template: ${templateId}`);
    
    // Generate the HTML content
    const htmlContent = generateInvoiceHTML(invoiceData, templateId);
    
    // In a real implementation, we would render this HTML to an image
    // For now, we're just returning the HTML
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Try to use the local template preview image, fall back to placeholder if not found
    const templatePreviewUrl = TEMPLATE_PREVIATES[templateId as keyof typeof TEMPLATE_PREVIATES] || 
                               FALLBACK_PREVIEWS[templateId as keyof typeof FALLBACK_PREVIEWS];
    
    return {
      success: true,
      previewUrl: templatePreviewUrl,
      htmlContent, // Return the HTML content for the preview modal
    };
  } catch (error) {
    console.error('Error generating preview:', error);
    return {
      success: false,
      error: 'Failed to generate preview',
    };
  }
};
