
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
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
import { SearchBar } from "./components/SearchBar";
import { Button } from "./components/ui/button";
import { LanguageSelector } from "./components/LanguageSelector";
import { Plus } from "lucide-react";
import { NotificationBell } from "./components/NotificationBell";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const queryClient = new QueryClient();

const TopNav = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleNewInvoice = () => {
    navigate("/invoicing");
  };
  
  return (
    <div className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center border-b border-border bg-background pl-64 pr-4">
      <div className="flex w-full items-center justify-between">
        <div className="grow md:max-w-md">
          <SearchBar />
        </div>
        <div className="ml-4 hidden items-center gap-2 md:flex">
          <Button 
            onClick={handleNewInvoice}
            size="sm" 
            className="shrink-0"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('newInvoice')}
          </Button>
          <LanguageSelector />
          <NotificationBell />
        </div>
      </div>
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
          <div className="flex min-h-screen">
            <Sidebar />
            <TopNav />
            <div className="flex-1 overflow-auto md:ml-64 pt-16">
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
        </BrowserRouter>
      </NotificationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
