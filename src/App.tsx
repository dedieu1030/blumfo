
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
import { NotificationsProvider } from "./context/NotificationsContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 overflow-auto md:ml-64">
                <div className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route 
                      path="/" 
                      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                    />
                    <Route 
                      path="/invoicing" 
                      element={
                        <ProtectedRoute requiredRoles={['admin', 'manager']}>
                          <Invoicing />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/invoices" 
                      element={<ProtectedRoute><Invoices /></ProtectedRoute>} 
                    />
                    <Route 
                      path="/clients" 
                      element={<ProtectedRoute><Clients /></ProtectedRoute>} 
                    />
                    <Route 
                      path="/clients/:id" 
                      element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} 
                    />
                    <Route 
                      path="/products" 
                      element={
                        <ProtectedRoute requiredRoles={['admin', 'manager']}>
                          <ProductsServices />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/templates" 
                      element={<ProtectedRoute><Templates /></ProtectedRoute>} 
                    />
                    <Route 
                      path="/settings" 
                      element={<ProtectedRoute><Settings /></ProtectedRoute>} 
                    />
                    <Route 
                      path="/notifications" 
                      element={<ProtectedRoute><Notifications /></ProtectedRoute>} 
                    />
                    <Route path="/stripe/callback" element={<StripeCallback />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </div>
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
