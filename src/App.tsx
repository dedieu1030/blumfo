
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { AppHeader } from "./components/AppHeader";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationsProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex-1 overflow-auto md:ml-64">
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
          </div>
        </BrowserRouter>
      </NotificationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
