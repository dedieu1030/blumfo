
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
    number: "INV-001",
    client: "SCI Legalis",
    amount: "1,200.00 €",
    date: "01/05/2023",
    dueDate: "15/05/2023",
    status: "paid" as const,
  },
  {
    id: "2",
    number: "INV-002",
    client: "Cabinet Lefort",
    amount: "850.00 €",
    date: "03/05/2023",
    dueDate: "17/05/2023",
    status: "pending" as const,
  },
  {
    id: "3",
    number: "INV-003",
    client: "Me. Dubois",
    amount: "1,400.00 €",
    date: "05/05/2023",
    dueDate: "19/05/2023",
    status: "overdue" as const,
  }
];

const draftInvoices = [
  {
    id: "4",
    number: "DRAFT-001",
    client: "Me. Martin",
    amount: "950.00 €",
    date: "05/05/2023",
    dueDate: "19/05/2023",
    status: "draft" as const,
  }
];

export default function Dashboard() {
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
