
import { useState } from "react";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { InvoiceTemplateSettings } from "@/components/settings/InvoiceTemplateSettings";

export default function Templates() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header 
        title="Templates" 
        description="Personnalisez l'apparence de vos factures"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <InvoiceTemplateSettings />

      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
