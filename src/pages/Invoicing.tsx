
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, AlertCircle } from "lucide-react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { useToast } from "@/hooks/use-toast";
import { InvoiceData } from "@/types/invoice";
import { createInvoice } from "@/services/stripeApiClient";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Invoicing() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const openInvoiceDialog = () => {
    setInvoiceDialogOpen(true);
  };

  // Vérifier l'authentification de l'utilisateur
  useState(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsAuthChecking(false);
    };
    
    checkAuth();
  });

  const handleGenerateInvoice = async (invoiceData: InvoiceData) => {
    setIsGenerating(true);
    
    try {
      const itemsTotal = invoiceData.serviceLines.reduce((sum, line) => {
        const lineTotal = parseFloat(line.unitPrice) * parseFloat(line.quantity);
        return sum + lineTotal;
      }, 0);
      
      // Préparer les données pour l'API Stripe
      const stripeInvoiceData = {
        customerEmail: invoiceData.clientEmail,
        customerName: invoiceData.clientName,
        items: invoiceData.serviceLines.map(line => ({
          description: line.description,
          quantity: parseInt(line.quantity),
          unit_amount: Math.round(parseFloat(line.unitPrice) * 100), // Convertir en centimes
          tax_rates: [invoiceData.issuerInfo.taxRate] // Utiliser le taux de TVA défini
        })),
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
        currency: invoiceData.issuerInfo.defaultCurrency || 'eur',
        metadata: {
          invoiceNumber: invoiceData.invoiceNumber,
          templateId: invoiceData.templateId,
          paymentTermsId: invoiceData.paymentTermsId || '',
          notes: invoiceData.notes || ''
        },
        footer: invoiceData.issuerInfo.termsAndConditions,
        memo: invoiceData.issuerInfo.thankYouMessage
      };
      
      // Créer la facture dans Stripe
      const result = await createInvoice(stripeInvoiceData);
      
      if (result.success) {
        toast({
          title: "Facture créée",
          description: `La facture a été créée avec succès dans Stripe. Numéro: ${invoiceData.invoiceNumber}`
        });
        
        // Fermer le dialogue et rediriger vers la liste des factures
        setInvoiceDialogOpen(false);
        navigate("/invoices");
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de créer la facture dans Stripe",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la facture",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Header 
        title="Créer une facture" 
        description="Préparez et envoyez une nouvelle facture"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="flex flex-col items-center justify-center py-12">
        {!isAuthChecking && !isAuthenticated ? (
          <Alert variant="destructive" className="max-w-md mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connexion requise</AlertTitle>
            <AlertDescription>
              Vous devez être connecté pour créer des factures. 
              <Link to="/login" className="underline ml-1">
                Se connecter
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Facturation</CardTitle>
            <CardDescription>Créez et gérez vos factures</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={openInvoiceDialog} 
              className="bg-violet hover:bg-violet/90"
              disabled={!isAuthChecking && !isAuthenticated}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Vous pouvez également consulter vos factures existantes dans la section "Factures"
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/invoices")}
              className="w-full"
            >
              Voir mes factures
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen}
        onGenerateInvoice={handleGenerateInvoice}
        isGenerating={isGenerating}
      />
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
