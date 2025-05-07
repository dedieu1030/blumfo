
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
import { toast } from "sonner";

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
  const { data: fetchedInvoices, isError, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const { data } = await supabase.functions.invoke('list-invoices');
        return data?.invoices || [];
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Erreur lors de la récupération des factures");
        return [];
      }
    },
    // Handle errors properly using options.meta
    meta: {
      onError: (error: any) => {
        console.log("Using mock data due to error:", error);
      }
    }
  });
  
  // Use either fetched invoices or mock data
  const invoices = fetchedInvoices?.length > 0 ? fetchedInvoices : allInvoices;
  
  // Handle invoice update (payment confirmation, etc)
  const handleInvoiceUpdated = () => {
    toast.success("Facture mise à jour avec succès");
    refetch();
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
  
  // Vérifier les factures qui approchent de leur échéance
  const today = new Date();
  const almostDueInvoices = pendingInvoices.filter(invoice => {
    const dueDate = new Date(invoice.dueDate.split("/").reverse().join("-"));
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

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
        
        {almostDueInvoices.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Factures avec échéance proche: {almostDueInvoices.length}
            </h3>
            <p className="text-xs text-yellow-700 mb-1">
              Les factures suivantes ont une échéance dans les 3 prochains jours:
            </p>
            <ul className="text-xs text-yellow-700 list-disc pl-5">
              {almostDueInvoices.map(inv => (
                <li key={inv.id}>
                  {inv.number} - {inv.client} - Échéance: {inv.dueDate} - {inv.amount}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {overdueInvoices.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Factures en retard: {overdueInvoices.length}
            </h3>
            <p className="text-xs text-red-700 mb-1">
              Les factures suivantes ont dépassé leur date d'échéance:
            </p>
            <ul className="text-xs text-red-700 list-disc pl-5">
              {overdueInvoices.map(inv => (
                <li key={inv.id}>
                  {inv.number} - {inv.client} - Échéance: {inv.dueDate} - {inv.amount}
                </li>
              ))}
            </ul>
          </div>
        )}
        
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
            <InvoiceList 
              title="" 
              invoices={filteredInvoices} 
              onInvoiceUpdated={handleInvoiceUpdated}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={pendingInvoices}
              onInvoiceUpdated={handleInvoiceUpdated}
            />
          </TabsContent>
          
          <TabsContent value="paid" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={paidInvoices}
              onInvoiceUpdated={handleInvoiceUpdated}
            />
          </TabsContent>
          
          <TabsContent value="overdue" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={overdueInvoices}
              onInvoiceUpdated={handleInvoiceUpdated}
            />
          </TabsContent>
          
          <TabsContent value="draft" className="pt-6">
            <InvoiceList 
              title="" 
              invoices={draftInvoices}
              onInvoiceUpdated={handleInvoiceUpdated}
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
