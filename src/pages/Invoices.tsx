
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { InvoiceList } from "@/components/InvoiceList";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";
import { InvoiceReportDialog } from "@/components/InvoiceReportDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InvoicePaymentAlert } from "@/components/InvoicePaymentAlert";
import { differenceInDays, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Fonction pour vérifier si une facture est proche de l'échéance (sous 3 jours)
const isNearDue = (dueDate: string) => {
  if (!dueDate) return false;
  const today = new Date();
  const due = parseISO(dueDate);
  const daysDiff = differenceInDays(due, today);
  return daysDiff >= 0 && daysDiff <= 3; // Entre aujourd'hui et 3 jours
};

// Mock data for demonstration
const allInvoices = [
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
  },
  {
    id: "4",
    number: "INV-004",
    client: "Cabinet Moreau",
    amount: "950.00 €",
    date: "10/05/2023",
    dueDate: "24/05/2023",
    status: "pending" as const,
  },
  {
    id: "5",
    number: "DRAFT-001",
    client: "Me. Martin",
    amount: "950.00 €",
    date: "12/05/2023",
    dueDate: "26/05/2023",
    status: "draft" as const,
  }
];

export default function Invoices() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Attempt to fetch invoices from Supabase if authenticated
  const { data: fetchedInvoices, isError, isLoading, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const { data } = await supabase.functions.invoke('list-invoices');
        console.log("Invoices fetched:", data);
        return data?.invoices || [];
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast({
          title: t("errorFetchingInvoices", "Erreur"),
          description: t("errorFetchingInvoicesDesc", "Impossible de récupérer les factures. Veuillez réessayer."),
          variant: "destructive"
        });
        return [];
      }
    },
    // Use better React Query configuration
    meta: {
      onError: (error: any) => {
        console.log("Using mock data due to error:", error);
      }
    },
    refetchOnWindowFocus: false, // Prevent unwanted refetches
    staleTime: 30000, // Data stays fresh for 30 seconds
  });
  
  // Use either fetched invoices or mock data
  const invoices = fetchedInvoices?.length > 0 ? fetchedInvoices : allInvoices;
  
  // Handle invoice status change with better error handling
  const handleInvoiceStatusChange = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing invoice data:", error);
      toast({
        title: t("refreshError", "Erreur de rafraîchissement"),
        description: t("errorRefreshingData", "Erreur lors du rafraîchissement des données. Veuillez réessayer."),
        variant: "destructive"
      });
    }
  };
  
  // Filter invoices by search term
  const filteredInvoices = invoices.filter((invoice) => {
    const search = searchTerm.toLowerCase();
    return (
      invoice.number.toLowerCase().includes(search) ||
      invoice.client.toLowerCase().includes(search)
    );
  });
  
  // Filter invoices by status
  const paidInvoices = filteredInvoices.filter(invoice => invoice.status === "paid");
  const pendingInvoices = filteredInvoices.filter(invoice => invoice.status === "pending");
  const overdueInvoices = filteredInvoices.filter(invoice => invoice.status === "overdue");
  const draftInvoices = filteredInvoices.filter(invoice => invoice.status === "draft");
  
  // Calculate invoices that need verification (more than 2 days past due)
  const needsVerificationInvoices = filteredInvoices.filter(invoice => {
    if (invoice.status !== "pending") return false;
    
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
    
    return daysPastDue > 2; // Plus de 2 jours après l'échéance
  });

  // Calculate invoices nearing due date (within 3 days)
  const nearDueInvoices = filteredInvoices.filter(invoice => {
    if (invoice.status !== "pending") return false;
    return isNearDue(invoice.dueDate);
  });
  
  const handleViewOverdue = () => {
    setActiveTab("needs-verification");
  };
  
  const handleViewNearDue = () => {
    setActiveTab("near-due");
  };

  return (
    <>
      <Header 
        title="Mes factures" 
        description="Gérez toutes vos factures"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-6">
        {/* Alerte pour les factures nécessitant une vérification */}
        <InvoicePaymentAlert 
          overdueCount={needsVerificationInvoices.length}
          nearDueCount={nearDueInvoices.length}
          onViewOverdue={handleViewOverdue}
          onViewNearDue={handleViewNearDue}
          className="mb-6"
        />
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une facture..." 
              className="pl-10 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={() => setIsReportDialogOpen(true)}
            className="gap-2"
            disabled={isLoading}
          >
            <FileText className="h-4 w-4" />
            Générer un rapport
          </Button>
        </div>
        
        <Tabs 
          defaultValue={activeTab === "needs-verification" ? "needs-verification" : "all"} 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              Toutes ({filteredInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              En attente ({pendingInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="paid"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              Payées ({paidInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="overdue"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              En retard ({overdueInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="needs-verification"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              À vérifier ({needsVerificationInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="near-due"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              Échéance proche ({nearDueInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="draft"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
              disabled={isLoading}
            >
              Brouillons ({draftInvoices.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={filteredInvoices} 
              onInvoiceStatusChanged={handleInvoiceStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={pendingInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          </TabsContent>
          
          <TabsContent value="paid" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={paidInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          </TabsContent>
          
          <TabsContent value="overdue" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={overdueInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          </TabsContent>
          
          <TabsContent value="needs-verification" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={needsVerificationInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          </TabsContent>
          
          <TabsContent value="near-due" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={nearDueInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="draft" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={draftInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <InvoiceReportDialog 
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        invoices={invoices}
      />
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
