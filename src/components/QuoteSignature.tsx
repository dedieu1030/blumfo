import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignatureCanvas, SignatureCanvasAdapter } from "@/components/SignatureCanvas";
import { SignatureDisplay } from "@/components/SignatureDisplay";
import { Quote, QuoteSignature as QuoteSignatureType, QuoteSignRequest } from "@/types/quote";
import { SignatureData } from "@/types/invoice";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface QuoteSignatureProps {
  quote?: Quote;
  quoteId?: string;
  onSuccess?: (signature?: QuoteSignatureType) => void;
  readOnly?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuoteSignatureComponent({ quote, quoteId, onSuccess, readOnly = false }: QuoteSignatureProps) {
  const [signatureData, setSignatureData] = useState<SignatureData | undefined>();
  const [signerName, setSignerName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const existingSignature = quote?.signatures && quote.signatures.length > 0 
    ? quote.signatures[0] : undefined;
  
  const handleSignatureChange = (data: SignatureData | undefined) => {
    setSignatureData(data);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signatureData && !existingSignature?.signature_data) {
      toast.error("Veuillez dessiner votre signature ou utiliser vos initiales");
      return;
    }
    
    if (!signerName) {
      toast.error("Veuillez entrer votre nom complet");
      return;
    }
    
    if (!termsAccepted) {
      toast.error("Vous devez accepter les conditions générales pour signer le devis");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Récupérer l'IP client et l'user agent pour la traçabilité
      const userAgent = navigator.userAgent;
      
      const signRequest: QuoteSignRequest = {
        quoteId: quote?.id || quoteId || "",
        signatureData: signatureData,
        signedName: signerName
      };
      
      // Appel de l'edge function pour signer le devis
      const { data, error } = await supabase.functions.invoke('quote-signature', {
        body: {
          ...signRequest,
          userAgent,
          clientIp: null // L'IP sera captée côté serveur
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Le devis a été signé avec succès");
      
      if (onSuccess && data.signature) {
        onSuccess(data.signature);
      }
      
    } catch (err: any) {
      console.error("Erreur lors de la signature:", err);
      setError(err.message || "Une erreur est survenue lors de la signature");
      toast.error("Erreur lors de la signature du devis");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Si on est en mode lecture seule et qu'il y a une signature existante
  if (readOnly && existingSignature) {
    return (
      <Card className="max-w-xl mx-auto my-6">
        <CardHeader>
          <CardTitle>Devis signé</CardTitle>
          <CardDescription>
            Ce devis a été signé le {format(new Date(existingSignature.signed_at), 'PPP', { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 bg-gray-50">
            <SignatureDisplay 
              signature={existingSignature.signature_data as SignatureData} 
              className="flex justify-center" 
            />
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Signé par {existingSignature.signed_name}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Si le devis est déjà signé et qu'on n'est pas en mode lecture seule
  if (quote?.status === 'signed' && !readOnly) {
    return (
      <Card className="max-w-xl mx-auto my-6">
        <CardHeader>
          <CardTitle>Devis déjà signé</CardTitle>
          <CardDescription>
            Ce devis a déjà été signé et ne peut plus être modifié.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto my-6">
      <CardHeader>
        <CardTitle>Signature du devis</CardTitle>
        <CardDescription>
          Veuillez signer le devis {quote?.quote_number} pour accepter les conditions.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <SignatureCanvasAdapter 
              onSignatureChange={handleSignatureChange}
              signatureData={signatureData}
              userName={signerName}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="signer-name">Votre nom complet</Label>
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              J'accepte les conditions générales et je reconnais que cette signature électronique a la même valeur qu'une signature manuscrite.
            </Label>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">Annuler</Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !signatureData || !signerName || !termsAccepted}
          >
            {isSubmitting ? "Signature en cours..." : "Signer le devis"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Composant wrapper avec Dialog pour la signature
export function QuoteSignature({ open, onOpenChange, quoteId, onSuccess }: QuoteSignatureProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <QuoteSignatureComponent quoteId={quoteId} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
