
import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceList } from "@/components/InvoiceList";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useTranslation } from "react-i18next";
import { Invoice } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Mock data for demonstration
const recentInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2023-001",
    invoice_number: "INV-2023-001",
    client: "Client A",
    amount: "€1,200.00",
    date: "2023-05-15",
    dueDate: "2023-06-15", 
    status: "paid"
  },
  {
    id: "2",
    number: "INV-2023-002",
    invoice_number: "INV-2023-002",
    client: "Client B",
    amount: "€850.00",
    date: "2023-05-20",
    dueDate: "2023-06-20",
    status: "pending"
  },
  {
    id: "3", 
    number: "INV-2023-003",
    invoice_number: "INV-2023-003",
    client: "Client C",
    amount: "€1,500.00", 
    date: "2023-05-22", 
    dueDate: "2023-06-22",
    status: "overdue"
  },
  {
    id: "6", 
    number: "INV-2023-006",
    invoice_number: "INV-2023-006",
    client: "Client F",
    amount: "€980.00", 
    date: "2023-05-28", 
    dueDate: "2023-06-28",
    status: "overdue"
  }
];

const draftInvoices: Invoice[] = [
  {
    id: "4",
    number: "DRAFT-001",
    invoice_number: "DRAFT-001",
    client: "Client D",
    amount: "€750.00",
    date: "2023-05-25",
    dueDate: "2023-06-25",
    status: "draft"
  },
  {
    id: "5",
    number: "DRAFT-002",
    invoice_number: "DRAFT-002",
    client: "Client E",
    amount: "€1,200.00",
    date: "2023-05-27",
    dueDate: "2023-06-27",
    status: "draft"
  }
];

export function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Try to fetch invoices from Supabase if connected
  const { data: fetchedInvoices } = useQuery({
    queryKey: ["dashboard-invoices"],
    queryFn: async () => {
      try {
        console.log("Fetching invoices for dashboard");
        const { data } = await supabase.functions.invoke('list-invoices');
        console.log("Fetched invoices:", data?.invoices);
        return data?.invoices || [];
      } catch (error) {
        console.error("Error fetching invoices for dashboard:", error);
        return [];
      }
    },
    meta: {
      onError: (error: any) => {
        console.log("Using mock data due to error:", error);
      }
    }
  });

  // Use fetched invoices if available, otherwise use mock data
  const allInvoices = fetchedInvoices?.length > 0 ? fetchedInvoices : [...recentInvoices, ...draftInvoices];
  
  // Filter recent and overdue invoices
  const recentFilteredInvoices = allInvoices.filter(invoice => invoice.status !== "draft").slice(0, 5);
  const overdueInvoices = allInvoices.filter(invoice => invoice.status === "overdue");

  return (
    <>
      <Header 
        title={t('dashboard')} 
        description={t('dashboardDescription')}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-8">
        <DashboardStats overdueInvoices={overdueInvoices} />
        
        <InvoiceList 
          title={t('recentInvoices')}
          invoices={recentFilteredInvoices} 
          showViewAll
        />
        
        <Card>
          <CardHeader>
            <CardTitle>{t('resumeDraft')}</CardTitle>
          </CardHeader>
          <CardContent>
            {draftInvoices.length > 0 ? (
              <InvoiceList 
                title="" 
                invoices={draftInvoices}
              />
            ) : (
              <p className="text-muted-foreground">{t('noDrafts')}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}

export default Dashboard;
