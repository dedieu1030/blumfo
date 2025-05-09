
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
import { Plus } from "lucide-react";
import { LanguageSelector } from "./components/LanguageSelector";
import { NotificationBell } from "./components/NotificationBell";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

const TopNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center px-4 md:pl-64">
      <div className="hidden md:flex w-full max-w-screen-2xl mx-auto items-center justify-end gap-4">
        <div className="w-1/3 max-w-md">
          <SearchBar placeholder={t('searchInApp')} />
        </div>
        <Button 
          onClick={() => navigate("/invoicing")} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('newInvoice')}
        </Button>
        <LanguageSelector />
        <NotificationBell />
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
            <div className="flex-1 overflow-auto md:ml-64 pt-16">
              <TopNav />
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
