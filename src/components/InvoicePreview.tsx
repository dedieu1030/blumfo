import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, Printer } from "lucide-react";
import { saveAs } from 'file-saver';
import { QRCodeSVG } from 'qrcode.react';
import { InvoiceData } from '@/types/invoice';

interface InvoicePreviewProps {
  htmlContent: string;
  invoiceData: InvoiceData;
  templateId: string;
  showDownloadButton?: boolean;
  onClose?: () => void;
}

export function InvoicePreview({ 
  htmlContent, 
  invoiceData, 
  templateId, 
  showDownloadButton = false,
  onClose
}: InvoicePreviewProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Fonction pour télécharger la facture comme PDF
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          htmlContent, 
          invoiceNumber: invoiceData.invoiceNumber,
          templateId
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, `Facture_${invoiceData.invoiceNumber}.pdf`);
      } else {
        console.error('Erreur lors de la génération du PDF');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };
  
  // Fonction pour imprimer la facture
  const handlePrintInvoice = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression de facture ${invoiceData.invoiceNumber}</title>
          </head>
          <body>
            ${htmlContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  // Fonction pour afficher en plein écran
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Fonction pour préparer le QR code avec lien de paiement
  const getPaymentQRCode = () => {
    if (!invoiceData.paymentMethods) {
      return null;
    }
    
    const hasOnlinePayment = invoiceData.paymentMethods.some(pm => pm.type === 'card' && pm.enabled);
    
    if (!hasOnlinePayment) {
      return null;
    }
    
    return null; // Placeholder pour futur QR code
  };

  // Rendu des informations bancaires
  const renderBankingInfo = () => {
    if (!invoiceData.issuerInfo) {
      return null;
    }
    
    return (
      <div className="mt-4 text-sm">
        {invoiceData.issuerInfo?.bankName && (
          <p><strong>Banque:</strong> {invoiceData.issuerInfo?.bankName}</p>
        )}
        {invoiceData.issuerInfo?.accountHolder && (
          <p><strong>Titulaire:</strong> {invoiceData.issuerInfo?.accountHolder}</p>
        )}
        {invoiceData.issuerInfo?.bankAccount && (
          <p><strong>IBAN:</strong> {invoiceData.issuerInfo?.bankAccount}</p>
        )}
        <p><strong>Référence:</strong> {invoiceData.invoiceNumber}</p>
        {invoiceData.issuerInfo?.paypal && (
          <p className="mt-2"><strong>PayPal:</strong> {invoiceData.issuerInfo?.paypal}</p>
        )}
      </div>
    );
  };
  
  // Fonction pour personnaliser le contenu HTML avant l'affichage
  const processedHtml = () => {
    let html = htmlContent;
    
    // Personnaliser le HTML si nécessaire (par exemple, ajouter un filigrane pour les factures impayées)
    if (invoiceData.status === 'unpaid' || invoiceData.status === 'pending') {
      html = html.replace('</body>', `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          opacity: 0.15;
          color: #ff0000;
          font-weight: bold;
          pointer-events: none;
          z-index: 1000;
        ">NON PAYÉ</div>
        </body>
      `);
    }
    
    return html;
  };

  // Afficher les notes conditionnellement
  const renderNotes = () => {
    if (invoiceData.notes) {
      return (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <h4 className="font-medium mb-2">Notes:</h4>
          <p className="whitespace-pre-line">{invoiceData.notes}</p>
        </div>
      );
    }
    return null;
  };
  
  // Informations de l'émetteur
  const renderIssuerInfo = () => {
    if (invoiceData.issuerInfo) {
      return (
        <div className="text-sm">
          <h4 className="font-medium">{invoiceData.issuerInfo.name}</h4>
          <p className="whitespace-pre-line">{invoiceData.issuerInfo.address}</p>
          <p>Email: {invoiceData.issuerInfo.email}</p>
        </div>
      );
    }
    return null;
  };
  
  // Informations du client
  const renderClientInfo = () => {
    if (invoiceData.clientName) {
      return (
        <div className="text-sm mt-4">
          <h4 className="font-medium">Client:</h4>
          <p className="font-medium">{invoiceData.clientName}</p>
          <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
          {invoiceData.clientEmail && <p>Email: {invoiceData.clientEmail}</p>}
        </div>
      );
    }
    return null;
  };

  // Si en plein écran, afficher dans une Dialog
  if (isFullScreen) {
    return (
      <Dialog open={isFullScreen} onOpenChange={toggleFullScreen} modal={false}>
        <DialogContent className="max-w-screen-lg max-h-screen flex flex-col">
          <DialogHeader>
            <DialogTitle>Facture {invoiceData.invoiceNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto print:overflow-visible p-4">
            <div dangerouslySetInnerHTML={{ __html: processedHtml() }} />
          </div>
          
          <div className="flex justify-end space-x-2 mt-4 print:hidden">
            {showDownloadButton && (
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            )}
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button variant="outline" onClick={toggleFullScreen}>
              Réduire
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Sinon, afficher normalement
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto print:overflow-visible p-4">
        <div dangerouslySetInnerHTML={{ __html: processedHtml() }} />
      </div>
      
      <div className="flex justify-end space-x-2 mt-4 print:hidden">
        {showDownloadButton && (
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        )}
        <Button variant="outline" onClick={handlePrintInvoice}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
        <Button variant="outline" onClick={toggleFullScreen}>
          <Eye className="mr-2 h-4 w-4" />
          Plein écran
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        )}
      </div>
    </div>
  );
}
