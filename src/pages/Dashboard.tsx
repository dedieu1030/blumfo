import { DashboardStats } from "@/components/DashboardStats";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceList } from "@/components/InvoiceList";
import { useEffect, useState } from "react";
import { Invoice } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { QuickAction } from "@/components/QuickAction";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, FilePlus } from "lucide-react";
import { QuoteList } from "@/components/QuoteList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        console.log("Fetching dashboard data...");
        // Fetch stats totals
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select("status");

        if (invoicesError) {
          console.error("Error fetching invoice status:", invoicesError);
          throw invoicesError;
        }

        // Update overdue invoices
        const { data: overdueData, error: overdueError } = await supabase
          .from("invoices")
          .select("*, client:clients(*)")
          .eq("status", "overdue")
          .order("due_date", { ascending: false });
          
        if (overdueError) {
          console.error("Error fetching overdue invoices:", overdueError);
          throw overdueError;
        }

        console.log("Overdue invoices data:", overdueData);

        // Transform data for overdue invoices
        const transformedOverdueInvoices: Invoice[] = overdueData.map((invoice) => ({
          id: invoice.id,
          number: invoice.invoice_number,
          invoice_number: invoice.invoice_number,
          client: invoice.client || "Client inconnu",
          client_name: invoice.client?.client_name || "Client inconnu",
          amount: invoice.total_amount.toString(),
          date: invoice.issue_date,
          dueDate: invoice.due_date,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status as "paid" | "pending" | "overdue" | "draft"
        }));

        setOverdueInvoices(transformedOverdueInvoices);

        // Fetch recent invoices
        const { data: recentData, error: recentError } = await supabase
          .from("invoices")
          .select("*, client:clients(*)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) {
          console.error("Error fetching recent invoices:", recentError);
          throw recentError;
        }

        console.log("Recent invoices data:", recentData);

        // Transform data to match Invoice type
        const transformedInvoices: Invoice[] = recentData.map((invoice) => ({
          id: invoice.id,
          number: invoice.invoice_number,
          invoice_number: invoice.invoice_number,
          client: invoice.client || "Client inconnu",
          client_name: invoice.client?.client_name || "Client inconnu",
          amount: invoice.total_amount.toString(),
          date: invoice.issue_date,
          dueDate: invoice.due_date,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status as "paid" | "pending" | "overdue" | "draft"
        }));

        setRecentInvoices(transformedInvoices);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Rendu adaptatif pour les appareils mobiles et desktop
  return (
    <div>
      <Header
        title="Dashboard"
        description="Bienvenue sur votre tableau de bord"
        onOpenMobileMenu={() => {}}
        actions={<QuickAction />}
      />
      
      <DashboardStats
        overdueInvoices={overdueInvoices}
      />

      {isMobile ? (
        // Version mobile avec tabs pour améliorer l'expérience utilisateur
        <div className="mt-6">
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="invoices">{t("recentInvoices", "Factures récentes")}</TabsTrigger>
              <TabsTrigger value="quotes">{t("recentQuotes", "Devis récents")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="invoices" className="space-y-1">
              <div className="flex items-center justify-between py-2">
                <h3 className="text-sm font-medium">{t("last5Invoices", "Les 5 dernières factures")}</h3>
                <Link to="/invoices">
                  <Button variant="link" size="sm" className="h-8 p-0 text-primary">
                    {t("viewAll", "Voir tout")} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <InvoiceList 
                invoices={recentInvoices}
                limit={5}
                showActions={false}
              />
            </TabsContent>
            
            <TabsContent value="quotes" className="space-y-1">
              <div className="flex items-center justify-between py-2">
                <h3 className="text-sm font-medium">{t("last5Quotes", "Les 5 derniers devis")}</h3>
                <Link to="/quotes">
                  <Button variant="link" size="sm" className="h-8 p-0 text-primary">
                    {t("viewAll", "Voir tout")} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <QuoteList 
                limit={5}
                showActions={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Version desktop avec deux colonnes
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Factures récentes</CardTitle>
                <CardDescription>Les 5 dernières factures créées</CardDescription>
              </div>
              <Link to="/invoices">
                <Button variant="ghost" size="sm" className="gap-1">
                  <FileText className="h-4 w-4" /> Toutes les factures
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <InvoiceList 
                invoices={recentInvoices}
                limit={5}
                showActions={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Devis récents</CardTitle>
                <CardDescription>Les 5 derniers devis créés</CardDescription>
              </div>
              <Link to="/quotes">
                <Button variant="ghost" size="sm" className="gap-1">
                  <FilePlus className="h-4 w-4" /> Tous les devis
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <QuoteList 
                limit={5}
                showActions={false}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
