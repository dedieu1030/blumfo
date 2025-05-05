
import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAndDownloadInvoicePdf } from "@/services/invoiceApiClient";

interface InvoicePaymentLinkProps {
  paymentUrl: string;
  qrCodeUrl: string;
  invoiceData?: any;
  templateId?: string;
}

export function InvoicePaymentLink({ 
  paymentUrl, 
  qrCodeUrl, 
  invoiceData, 
  templateId 
}: InvoicePaymentLinkProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    toast({
      title: "Lien copié",
      description: "Le lien de paiement a été copié dans le presse-papier"
    });
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceData || !templateId) {
      toast({
        title: "Erreur",
        description: "Données de facture manquantes",
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
      const success = await generateAndDownloadInvoicePdf(
        invoiceData, 
        templateId
      );

      if (success) {
        toast({
          title: "Téléchargement démarré",
          description: "Votre facture PDF a été générée avec succès"
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

  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50">
      <h3 className="font-medium mb-2">Lien de paiement Stripe généré</h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <img 
            src={qrCodeUrl} 
            alt="QR Code de paiement" 
            className="w-32 h-32 border"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">
            Scannez ce QR code ou utilisez le lien ci-dessous pour effectuer le paiement:
          </p>
          <div className="flex items-center gap-2">
            <Input 
              value={paymentUrl} 
              readOnly 
              className="text-xs"
            />
            <Button 
              size="sm" 
              onClick={() => window.open(paymentUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Ouvrir
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Download PDF button */}
          {invoiceData && templateId && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-1" />
                {isDownloading ? "Génération..." : "Télécharger la facture (PDF)"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoicePaymentLink;
