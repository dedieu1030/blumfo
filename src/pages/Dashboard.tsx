import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceList } from "@/components/InvoiceList";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useTranslation } from "react-i18next";

// Mock data for demonstration
const recentInvoices = [
  {
    id: "1",
    number: "INV-2023-001",
    invoice_number: "INV-2023-001", // Added required field
    client: "Client A",
    amount: "€1,200.00",
    date: "2023-05-15",
    dueDate: "2023-06-15", 
    status: "paid" as const
  },
  {
    id: "2",
    number: "INV-2023-002",
    invoice_number: "INV-2023-002", // Added required field
    client: "Client B",
    amount: "€850.00",
    date: "2023-05-20",
    dueDate: "2023-06-20",
    status: "pending" as const
  },
  {
    id: "3", 
    number: "INV-2023-003",
    invoice_number: "INV-2023-003", // Added required field
    client: "Client C",
    amount: "€1,500.00", 
    date: "2023-05-22", 
    dueDate: "2023-06-22",
    status: "overdue" as const
  }
];

const draftInvoices = [
  {
    id: "4",
    number: "DRAFT-001",
    invoice_number: "DRAFT-001", // Added required field
    client: "Client D",
    amount: "€750.00",
    date: "2023-05-25",
    dueDate: "2023-06-25",
    status: "draft" as const
  },
  {
    id: "5",
    number: "DRAFT-002",
    invoice_number: "DRAFT-002", // Added required field
    client: "Client E",
    amount: "€1,200.00",
    date: "2023-05-27",
    dueDate: "2023-06-27",
    status: "draft" as const
  }
];

export function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Header 
        title={t('dashboard')} 
        description={t('dashboardDescription')}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-8">
        <DashboardStats />
        
        <InvoiceList 
          title={t('recentInvoices')}
          invoices={recentInvoices} 
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
