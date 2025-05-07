
import { useState } from "react";
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
  
  // Attempt to fetch invoices from Supabase if authenticated
  const { data: fetchedInvoices, isError } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const { data } = await supabase.functions.invoke('list-invoices');
        return data?.invoices || [];
      } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
      }
    },
    // Use mock data if fetch fails
    onError: (error) => {
      console.log("Using mock data due to error:", error);
      return allInvoices;
    }
  });
  
  // Use either fetched invoices or mock data
  const invoices = fetchedInvoices?.length > 0 ? fetchedInvoices : allInvoices;
  
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

  return (
    <>
      <Header 
        title="Mes factures" 
        description="Gérez toutes vos factures"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une facture..." 
              className="pl-10 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => setIsReportDialogOpen(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Générer un rapport
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
            >
              Toutes ({filteredInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
            >
              En attente ({pendingInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="paid"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
            >
              Payées ({paidInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="overdue"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
            >
              En retard ({overdueInvoices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="draft"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
            >
              Brouillons ({draftInvoices.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-6">
            <InvoiceList title="" invoices={filteredInvoices} />
          </TabsContent>
          
          <TabsContent value="pending" className="pt-6">
            <InvoiceList title="" invoices={pendingInvoices} />
          </TabsContent>
          
          <TabsContent value="paid" className="pt-6">
            <InvoiceList title="" invoices={paidInvoices} />
          </TabsContent>
          
          <TabsContent value="overdue" className="pt-6">
            <InvoiceList title="" invoices={overdueInvoices} />
          </TabsContent>
          
          <TabsContent value="draft" className="pt-6">
            <InvoiceList title="" invoices={draftInvoices} />
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
