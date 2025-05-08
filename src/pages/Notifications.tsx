
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { useState } from "react";

export default function Notifications() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header 
        title="Notifications" 
        description="Gérer vos notifications" 
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <NotificationsPanel />
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
