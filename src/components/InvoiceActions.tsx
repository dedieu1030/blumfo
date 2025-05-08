import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Download, Send, Eye, Save, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAndDownloadInvoicePdf } from '@/services/invoiceApiClient';
import { InvoiceData } from '@/types/invoice';
import { createPaymentLink, sendInvoice } from '@/services/stripeApiClient';
import { InvoiceReminder } from './InvoiceReminder';

interface InvoiceActionsProps {
  invoiceData: InvoiceData;
  templateId: string;
  stripeInvoiceId?: string;
  clientEmail?: string;
  onPreview?: () => void;
  onSave?: () => void;
  onSend?: () => void;
  className?: string;
}

export function InvoiceActions({ 
  invoiceData,
  templateId,
  stripeInvoiceId,
  clientEmail,
  onPreview, 
  onSave,
  onSend,
  className = ""
}: InvoiceActionsProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
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

  const handleSendInvoice = async () => {
    if (!stripeInvoiceId) {
      toast({
        title: "Erreur",
        description: "ID de facture Stripe manquant",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    toast({
      title: "Envoi en cours",
      description: "Envoi de la facture au client..."
    });

    try {
      const response = await sendInvoice(stripeInvoiceId);

      if (response.success) {
        toast({
          title: "Facture envoyée",
          description: "La facture a été envoyée au client avec succès"
        });
        
        if (onSend) {
          onSend();
        }
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Impossible d'envoyer la facture",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de la facture",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!stripeInvoiceId) {
      toast({
        title: "Erreur",
        description: "ID de facture Stripe manquant",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPaymentLink(true);
    toast({
      title: "Création en cours",
      description: "Création du lien de paiement..."
    });

    try {
      const response = await createPaymentLink(stripeInvoiceId);

      if (response.success && response.paymentUrl) {
        setPaymentUrl(response.paymentUrl);
        toast({
          title: "Lien créé",
          description: "Le lien de paiement a été créé avec succès"
        });
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Impossible de créer le lien de paiement",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du lien de paiement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du lien de paiement",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPaymentLink(false);
    }
  };

  const openPaymentLink = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
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
      
      {stripeInvoiceId && (
        <>
          <Button 
            variant="outline" 
            onClick={handleSendInvoice}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSending ? "Envoi..." : "Envoyer par email"}
          </Button>
          
          {/* Ajout du bouton de rappel */}
          <InvoiceReminder 
            invoiceId={invoiceData.id}
            stripeInvoiceId={stripeInvoiceId}
            clientEmail={clientEmail}
          />
          
          {!paymentUrl ? (
            <Button 
              variant="outline" 
              onClick={handleCreatePaymentLink}
              disabled={isCreatingPaymentLink}
            >
              {isCreatingPaymentLink ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {isCreatingPaymentLink ? "Création..." : "Lien de paiement"}
            </Button>
          ) : (
            <Button 
              className="bg-violet hover:bg-violet/90" 
              onClick={openPaymentLink}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir lien de paiement
            </Button>
          )}
        </>
      )}
      
      {onSend && !stripeInvoiceId && (
        <Button className="bg-violet hover:bg-violet/90" onClick={onSend}>
          <Send className="mr-2 h-4 w-4" />
          Générer et envoyer
        </Button>
      )}
    </div>
  );
}

export default InvoiceActions;
