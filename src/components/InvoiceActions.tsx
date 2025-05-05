
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Download, Send, Eye, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAndDownloadInvoicePdf } from '@/services/invoiceApiClient';

interface InvoiceActionsProps {
  invoiceData: any;
  templateId: string;
  onPreview?: () => void;
  onSave?: () => void;
  onSend?: () => void;
  className?: string;
}

export function InvoiceActions({ 
  invoiceData,
  templateId,
  onPreview, 
  onSave,
  onSend,
  className = ""
}: InvoiceActionsProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
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
      const success = await generateAndDownloadInvoicePdf(
        invoiceData, 
        templateId,
        undefined  // Remplacer par le token d'authentification si nécessaire
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
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {onPreview && (
        <Button variant="outline" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Prévisualiser
        </Button>
      )}
      
      {onSave && (
        <Button variant="outline" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
      )}
      
      <Button 
        variant="outline" 
        onClick={handleDownloadPdf}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isDownloading ? "Génération..." : "Télécharger PDF"}
      </Button>
      
      {onSend && (
        <Button className="bg-violet hover:bg-violet/90" onClick={onSend}>
          <Send className="mr-2 h-4 w-4" />
          Envoyer
        </Button>
      )}
    </div>
  );
}

export default InvoiceActions;
