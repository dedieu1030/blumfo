
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { InvoiceDialog } from "@/components/InvoiceDialog";

export default function Invoicing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  
  const openInvoiceDialog = () => {
    setInvoiceDialogOpen(true);
  };

  return (
    <>
      <Header 
        title="Créer une facture" 
        description="Préparez et envoyez une nouvelle facture"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Facturation</CardTitle>
            <CardDescription>Créez et gérez vos factures</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={openInvoiceDialog} className="bg-violet hover:bg-violet/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            Vous pouvez également consulter vos factures existantes dans la section "Factures"
          </CardFooter>
        </Card>
      </div>
      
      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen} 
      />
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
