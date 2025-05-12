
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

// Interface pour les props du DashboardStats
interface DashboardStatsData {
  invoicesCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  isLoading: boolean;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<DashboardStatsData>({
    invoicesCount: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    isLoading: true
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats totals
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select("status");

        if (invoicesError) {
          throw invoicesError;
        }

        // Update stats with correct property names
        setStatsData({
          invoicesCount: invoicesData.length,
          paidCount: invoicesData.filter((inv) => inv.status === "paid").length,
          pendingCount: invoicesData.filter((inv) => inv.status === "pending").length,
          overdueCount: invoicesData.filter((inv) => inv.status === "overdue").length,
          isLoading: false
        });

        // Fetch recent invoices
        const { data: recentData, error: recentError } = await supabase
          .from("invoices")
          .select("*, client:client_id(*)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) {
          throw recentError;
        }

        // Transform data to match Invoice type
        const transformedInvoices: Invoice[] = recentData.map((invoice) => ({
          id: invoice.id,
          number: invoice.invoice_number,
          client_name: invoice.client?.client_name || "Client inconnu",
          amount: invoice.total_amount,
          date: invoice.issue_date,
          dueDate: invoice.due_date,
          status: invoice.status,
          client: invoice.client,
          
          // Ajout des propriétés requises par le type Invoice
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount
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

  return (
    <div>
      <Header
        title="Dashboard"
        description="Bienvenue sur votre tableau de bord"
        onOpenMobileMenu={() => {}}
        actions={<QuickAction />}
      />
      
      <DashboardStats
        invoicesCount={statsData.invoicesCount}
        paidCount={statsData.paidCount}
        pendingCount={statsData.pendingCount}
        overdueCount={statsData.overdueCount}
        isLoading={statsData.isLoading}
      />

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
    </div>
  );
};

export default Dashboard;
