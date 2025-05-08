
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Header 
        title={t('notifications')} 
        description={t('manageNotifications')} 
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
