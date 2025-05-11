
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import Dashboard from "./pages/Dashboard";
import Invoicing from "./pages/Invoicing";
import Invoices from "./pages/Invoices";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import ProductsServices from "./pages/ProductsServices";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import StripeCallback from "./pages/StripeCallback";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import { NotificationsProvider } from "./context/NotificationsContext";
import { useIsMobile } from "./hooks/use-mobile";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePlus, Menu, Plus } from "lucide-react";
import { NotificationBell } from "./components/NotificationBell";
import { LanguageSelector } from "./components/LanguageSelector";
import { InvoiceDialog } from "./components/InvoiceDialog";
import { MobileNavigation } from "./components/MobileNavigation";
import { Header } from "./components/Header";

const queryClient = new QueryClient();

// Component to render page-specific headers
const PageHeader = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Map of routes to their header props
  const headerProps = {
    "/": { title: "Tableau de bord" },
    "/invoicing": { title: "Facturation", description: "Gérez vos paramètres de facturation" },
    "/invoices": { title: "Mes factures", description: "Gérez toutes vos factures" },
    "/clients": { title: "Clients", description: "Gérez vos clients" },
    "/products": { title: "Produits & Services", description: "Gérez vos produits et services" },
    "/templates": { title: "Modèles", description: "Gérez vos modèles de factures" },
    "/settings": { title: "Paramètres", description: "Configurez votre compte" },
    "/notifications": { title: "Notifications", description: "Gérez vos notifications" },
    "/profile": { title: "Profil", description: "Consultez votre profil" },
    "/profile/edit": { title: "Éditer le profil", description: "Modifiez vos informations" },
  };
  
  // Get the current route's header props
  const currentHeaderProps = headerProps[location.pathname] || 
    (location.pathname.startsWith("/clients/") ? 
      { title: "Détails du client" } : 
      { title: "Page" });
  
  return (
    <Header 
      {...currentHeaderProps} 
      onOpenMobileMenu={() => setIsMobileMenuOpen(true)} 
    />
  );
};

const AppContent = () => {
  const isMobile = useIsMobile();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen md:ml-64">
        {/* Fixed search bar and header container */}
        <div className="sticky top-0 z-30 bg-background">
          {/* Search bar container */}
          <div className="px-4 py-4 flex items-center border-b shadow-sm">
            {/* Flexible search bar container that fills available space */}
            <div className="flex-1 mr-4">
              <SearchBar placeholder="Rechercher dans l'application..." />
            </div>
            
            {/* Tightly grouped action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                onClick={() => setInvoiceDialogOpen(true)}
                size={isMobile ? "sm" : "default"}
                className="bg-violet hover:bg-violet/90 whitespace-nowrap"
              >
                {isMobile ? (
                  <FilePlus className="h-4 w-4" />
                ) : (
                  <>
                    <Plus className="mr-1 h-4 w-4" /> Nouvelle facture
                  </>
                )}
              </Button>
              
              {!isMobile && <LanguageSelector />}
              
              <NotificationBell />
              
              {/* Menu button moved to the far right on mobile */}
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Page header container - also fixed */}
          <PageHeader />
        </div>

        {/* Scrollable content area with padding to avoid content being hidden under the fixed header */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoicing" element={<Invoicing />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetails />} />
              <Route path="/products" element={<ProductsServices />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/stripe/callback" element={<StripeCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
      
      {/* Invoice Dialog */}
      <InvoiceDialog 
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
      
      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationsProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </NotificationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
