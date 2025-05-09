import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Maximize, Minimize, Download } from 'lucide-react';
import { generateAndDownloadInvoicePdf } from '@/services/invoiceApiClient';
import { useToast } from "@/hooks/use-toast";
import { InvoiceData } from '@/types/invoice';

interface InvoicePreviewProps {
  htmlContent: string;
  invoiceData: InvoiceData;
  templateId: string;
  showDownloadButton?: boolean;
}

export function InvoicePreview({ 
  htmlContent, 
  invoiceData, 
  templateId, 
  showDownloadButton = false
}: InvoicePreviewProps) {
  const [iframeHeight, setIframeHeight] = useState(842); // A4 height in pixels (at 96 DPI)
  const [scale, setScale] = useState(0.7); // Default scale to fit in viewport
  const [fullWidth, setFullWidth] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  // A4 dimensions at 96 DPI (standard screen resolution)
  const A4_WIDTH = 595; // pixels
  const A4_HEIGHT = 842; // pixels
  
  // Setup a message listener for iframe resizing if needed
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize-iframe') {
        // Optional: can be used if we want content-based sizing rather than fixed A4
        // setIframeHeight(event.data.height);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  };

  const toggleFullWidth = () => {
    setFullWidth(prev => !prev);
  };

  const handleDownloadPdf = async () => {
    if (!invoiceData) {
      toast({
        title: "Erreur",
        description: "Données de facture manquantes pour générer le PDF",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Génération du PDF",
      description: "Préparation du PDF en cours..."
    });

    try {
      // Utilisation du service API pour générer et télécharger le PDF
      const success = await generateAndDownloadInvoicePdf(
        invoiceData, 
        templateId,
        // Ici, vous pourriez passer un token d'authentification si nécessaire
        undefined
      );

      if (success) {
        toast({
          title: "Téléchargement démarré",
          description: "Votre PDF a été généré avec succès"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de générer le PDF",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération du PDF",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatPaymentInfo = (data: InvoiceData) => {
    if (!data) return '';
    
    const paymentMethods = data.paymentMethods?.filter(m => m.enabled) || [];
    if (paymentMethods.length === 0) return '';
    
    const issuer = data.issuerInfo;
    let html = '<div class="payment-info">';
    html += '<h3>Méthodes de paiement</h3>';
    
    paymentMethods.forEach(method => {
      switch (method.type) {
        case 'card':
          html += '<p><strong>Carte bancaire :</strong> Un lien de paiement Stripe est inclus dans l\'email avec cette facture.</p>';
          break;
        case 'transfer':
          html += `<p><strong>Virement bancaire :</strong><br>`;
          html += `Banque: ${issuer.bankName}<br>`;
          html += `Titulaire: ${issuer.accountHolder}<br>`;
          html += `IBAN: ${issuer.bankAccount}</p>`;
          break;
        case 'paypal':
          html += `<p><strong>PayPal :</strong> ${issuer.paypal}</p>`;
          break;
        case 'check':
          html += `<p><strong>Chèque :</strong> À l'ordre de ${issuer.name}<br>`;
          html += `Adresse: ${issuer.address}</p>`;
          break;
        case 'cash':
          html += `<p><strong>Espèces :</strong> Paiement en personne uniquement.</p>`;
          break;
        case 'other':
          html += `<p><strong>Autre :</strong> ${method.details}</p>`;
          break;
      }
    });
    
    html += '</div>';
    return html;
  };

  const enhanceHtmlWithDetails = (html: string) => {
    if (!invoiceData) return html;
    
    // Injecter les méthodes de paiement
    const paymentInfoHtml = formatPaymentInfo(invoiceData);
    
    // Injecter les conditions de paiement
    let termsHtml = '';
    if (invoiceData.notes) {
      termsHtml = `<div class="payment-terms">
        <h3>Conditions de paiement</h3>
        <p>${invoiceData.notes}</p>
      </div>`;
    }
    
    // Injecter le tout avant la fin du document
    return html.replace('</body>', `${paymentInfoHtml}${termsHtml}</body>`);
  };

  // Enhance the HTML content before displaying
  const enhancedHtml = invoiceData ? enhanceHtmlWithDetails(htmlContent) : htmlContent;
  
  // Use enhancedHtml in your wrappedHtml template instead of the original htmlContent

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: white;
          font-family: Arial, sans-serif;
        }
        .page {
          width: ${A4_WIDTH}px;
          min-height: ${A4_HEIGHT}px;
          padding: 40px;
          box-sizing: border-box;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        @media print {
          body {
            background-color: white;
          }
          .page {
            box-shadow: none;
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        ${enhancedHtml}
      </div>
      <script>
        // Send message to parent window with document height
        window.onload = function() {
          const height = document.body.scrollHeight;
          window.parent.postMessage({ type: 'resize-iframe', height }, '*');
        };
      </script>
    </body>
    </html>
  `;

  const getIssuerName = () => {
    if (invoiceData.issuerInfo?.name) {
      return invoiceData.issuerInfo.name;
    }
    return "Facture";
  };

  const getClientName = () => {
    return invoiceData.clientName || "Client";
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            title="Réduire"
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="flex items-center text-xs font-mono bg-gray-50 px-2 rounded">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            title="Agrandir"
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullWidth}
            title={fullWidth ? "Taille réelle" : "Ajuster à la fenêtre"}
            className="h-8"
          >
            {fullWidth ? <Minimize className="h-4 w-4 mr-1" /> : <Maximize className="h-4 w-4 mr-1" />}
            {fullWidth ? "Taille réelle" : "Ajuster"}
          </Button>
          
          {showDownloadButton && invoiceData && (
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="bg-violet hover:bg-violet/90 h-8"
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "Génération..." : "Télécharger"}
            </Button>
          )}
        </div>
      </div>
      <div 
        className="bg-gray-100 p-2 rounded-md overflow-auto"
        style={{ maxHeight: '75vh' }}
      >
        <div
          className="mx-auto transform origin-top transition-all duration-200"
          style={{ 
            width: fullWidth ? '100%' : `${A4_WIDTH * scale}px`,
            transform: !fullWidth ? `scale(${scale})` : 'none',
            transformOrigin: 'center top',
            marginBottom: !fullWidth ? `${(scale - 1) * -100}%` : '0'
          }}
        >
          <iframe
            srcDoc={wrappedHtml}
            className="border-0 bg-white shadow-lg"
            style={{ 
              width: fullWidth ? '100%' : `${A4_WIDTH}px`,
              height: fullWidth ? 'auto' : `${A4_HEIGHT}px`,
              minHeight: fullWidth ? '842px' : 'auto'
            }}
            title="Aperçu de la facture"
          />
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;
