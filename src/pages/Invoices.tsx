import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { InvoiceList } from "@/components/InvoiceList";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Filter, Calendar as CalendarIcon } from "lucide-react";
import { InvoiceReportDialog } from "@/components/InvoiceReportDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InvoicePaymentAlert } from "@/components/InvoicePaymentAlert";
import { differenceInDays, parseISO, isWithinInterval, startOfDay, endOfDay, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { fr, enUS, es } from "date-fns/locale";

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
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  
  // Nouveaux états pour les filtres de date
  const [dateFilterType, setDateFilterType] = useState<"none" | "issue" | "due">("none");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Fonction pour obtenir le bon locale pour le calendrier
  const getLocale = () => {
    const currentLang = i18n.language;
    if (currentLang === 'fr') return fr;
    if (currentLang === 'es') return es;
    return enUS;
  };
  
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
  
  // Fonction pour filtrer les factures par date
  const filterInvoicesByDate = (invoicesToFilter: any[]) => {
    if (dateFilterType === "none" || !startDate) {
      return invoicesToFilter;
    }
    
    return invoicesToFilter.filter(invoice => {
      const invoiceDate = parseISO(dateFilterType === "issue" ? invoice.date : invoice.dueDate);
      
      if (startDate && !endDate) {
        // Si seulement la date de début est définie, filtrer pour ce jour précis
        return isWithinInterval(invoiceDate, {
          start: startOfDay(startDate),
          end: endOfDay(startDate)
        });
      } else if (startDate && endDate) {
        // Si les deux dates sont définies, filtrer dans l'intervalle
        return isWithinInterval(invoiceDate, {
          start: startOfDay(startDate),
          end: endOfDay(endDate)
        });
      }
      
      return true;
    });
  };
  
  // Filter invoices by search term and date
  const filteredInvoices = filterInvoicesByDate(
    invoices.filter((invoice) => {
      const search = searchTerm.toLowerCase();
      return (
        invoice.number.toLowerCase().includes(search) ||
        invoice.client.toLowerCase().includes(search)
      );
    })
  );
  
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

  // Structure de données pour les options de filtre
  const filterOptions = [
    { value: "all", label: `${t("all")} (${filteredInvoices.length})` },
    { value: "pending", label: `${t("pendingStatus")} (${pendingInvoices.length})` },
    { value: "paid", label: `${t("paidStatus")} (${paidInvoices.length})` },
    { value: "overdue", label: `${t("overdueStatus")} (${overdueInvoices.length})` },
    { value: "needs-verification", label: `${t("toVerify", "À vérifier")} (${needsVerificationInvoices.length})` },
    { value: "near-due", label: `${t("nearDue", "Échéance proche")} (${nearDueInvoices.length})` },
    { value: "draft", label: `${t("draftStatus")} (${draftInvoices.length})` }
  ];
  
  // Réinitialiser les dates
  const handleResetDates = () => {
    setDateFilterType("none");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Formater l'affichage des dates
  const formatDateRange = () => {
    if (dateFilterType === "none") return t("selectDates", "Filtrer par date");
    
    if (startDate && !endDate) {
      return `${dateFilterType === "issue" ? t("issueDate") : t("dueDate")}: ${format(startDate, "dd/MM/yyyy")}`;
    }
    
    if (startDate && endDate) {
      return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
    }
    
    return t("selectDates", "Filtrer par date");
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
          
          <div className="flex gap-2">
            {/* Filtre de date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none gap-2 justify-between"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{formatDateRange()}</span>
                    <span className="sm:hidden">{dateFilterType !== "none" ? "Filtres" : t("dates", "Dates")}</span>
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="end">
                <div className="p-4 border-b">
                  <div className="space-y-2">
                    <h4 className="font-medium">{t("filterByDate", "Filtrer par date")}</h4>
                    <Select 
                      value={dateFilterType} 
                      onValueChange={(value) => setDateFilterType(value as "none" | "issue" | "due")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectDateType", "Sélectionner un type de date")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="issue">{t("issueDate", "Date d'émission")}</SelectItem>
                        <SelectItem value="due">{t("dueDate", "Date d'échéance")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {dateFilterType !== "none" && (
                    <div className="mt-4">
                      <div className="grid gap-2">
                        <div>
                          <p className="text-sm mb-1">{startDate && endDate ? t("dateRange", "Période") : t("selectDate", "Sélectionner une date")}</p>
                          <Calendar
                            mode="range"
                            selected={{
                              from: startDate,
                              to: endDate,
                            }}
                            onSelect={(range) => {
                              setStartDate(range?.from);
                              setEndDate(range?.to);
                            }}
                            locale={getLocale()}
                            className="rounded-md border pointer-events-auto"
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleResetDates}
                          >
                            {t("reset", "Réinitialiser")}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => document.body.click()} // Ferme le popover
                          >
                            {t("apply", "Appliquer")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={() => setIsReportDialogOpen(true)}
              className="gap-2"
              disabled={isLoading}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t("generateReport", "Générer un rapport")}</span>
              <span className="sm:hidden">{t("report", "Rapport")}</span>
            </Button>
          </div>
        </div>
        
        {/* Version mobile: utilisation d'un Select au lieu des tabs horizontales */}
        {isMobile ? (
          <div className="mb-4">
            <Select 
              value={activeTab} 
              onValueChange={setActiveTab}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t("filterInvoices", "Filtrer les factures")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          // Version desktop : Tabs horizontales classiques
          <Tabs 
            defaultValue={activeTab === "needs-verification" ? "needs-verification" : "all"} 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              {filterOptions.map(option => (
                <TabsTrigger 
                  key={option.value}
                  value={option.value} 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
                  disabled={isLoading}
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        
        {/* Contenu des tabs - même pour mobile et desktop */}
        <div className="pt-2">
          {activeTab === "all" && (
            <InvoiceList 
              title="" 
              invoices={filteredInvoices} 
              onInvoiceStatusChanged={handleInvoiceStatusChange}
            />
          )}
          
          {activeTab === "pending" && (
            <InvoiceList 
              title="" 
              invoices={pendingInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          )}
          
          {activeTab === "paid" && (
            <InvoiceList 
              title="" 
              invoices={paidInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          )}
          
          {activeTab === "overdue" && (
            <InvoiceList 
              title="" 
              invoices={overdueInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          )}
          
          {activeTab === "needs-verification" && (
            <InvoiceList 
              title="" 
              invoices={needsVerificationInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange} 
            />
          )}
          
          {activeTab === "near-due" && (
            <InvoiceList 
              title="" 
              invoices={nearDueInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange}
            />
          )}
          
          {activeTab === "draft" && (
            <InvoiceList 
              title="" 
              invoices={draftInvoices}
              onInvoiceStatusChanged={handleInvoiceStatusChange}
            />
          )}
        </div>
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
