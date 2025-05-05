
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Maximize, Minimize, Download } from 'lucide-react';
import { generateAndDownloadInvoicePdf } from '@/services/invoiceApiClient';
import { useToast } from "@/hooks/use-toast";

interface InvoicePreviewProps {
  htmlContent: string;
  invoiceData?: any;  // Données complètes de la facture pour la génération du PDF
  templateId?: string; // ID du template utilisé
  showDownloadButton?: boolean; // Option pour afficher le bouton de téléchargement
}

export function InvoicePreview({ 
  htmlContent, 
  invoiceData, 
  templateId = 'classic',
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

  // Add CSS to simulate A4 paper with proper margins
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
        ${htmlContent}
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

  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-2 items-center">
        <div className="text-sm text-muted-foreground">
          Format A4 - Aperçu
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            title="Réduire"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="flex items-center text-sm font-mono">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            title="Agrandir"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullWidth}
            title={fullWidth ? "Taille réelle" : "Ajuster à la fenêtre"}
          >
            {fullWidth ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          
          {showDownloadButton && invoiceData && (
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="bg-violet hover:bg-violet/90 ml-2"
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "Génération..." : "Télécharger PDF"}
            </Button>
          )}
        </div>
      </div>
      <div 
        className="bg-gray-100 p-4 rounded-md overflow-auto"
        style={{ maxHeight: '70vh' }}
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
