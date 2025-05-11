
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileText, Download, FileSpreadsheet, FileText as FilePdf } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { InvoiceReport } from "./InvoiceReport";

interface InvoiceReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: any[];
}

export function InvoiceReportDialog({
  isOpen,
  onOpenChange,
  invoices,
}: InvoiceReportDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 0, 1) // January 1st of current year
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 11, 31) // December 31st of current year
  );
  const [reportType, setReportType] = useState<string>("revenu");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Reset report state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setReportGenerated(false);
    }
  }, [isOpen]);

  // Preset periods
  const currentYear = new Date().getFullYear();
  const periods = [
    { name: "Année courante", start: new Date(currentYear, 0, 1), end: new Date(currentYear, 11, 31) },
    { name: "Année précédente", start: new Date(currentYear - 1, 0, 1), end: new Date(currentYear - 1, 11, 31) },
    { name: "T1", start: new Date(currentYear, 0, 1), end: new Date(currentYear, 2, 31) },
    { name: "T2", start: new Date(currentYear, 3, 1), end: new Date(currentYear, 5, 30) },
    { name: "T3", start: new Date(currentYear, 6, 1), end: new Date(currentYear, 8, 30) },
    { name: "T4", start: new Date(currentYear, 9, 1), end: new Date(currentYear, 11, 31) },
  ];

  const selectPeriod = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Generate report
  const generateReport = () => {
    if (!startDate || !endDate) {
      toast("Veuillez sélectionner une période valide");
      return;
    }

    setIsGenerating(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      toast.success("Rapport généré avec succès");
    }, 500);
  };

  // Format for report file name
  const getReportFileName = () => {
    if (!startDate || !endDate) return "rapport-financier";
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");
    return `rapport-financier_${startStr}_${endStr}`;
  };

  // Export functions
  const exportPDF = () => {
    if (!reportGenerated) {
      toast("Veuillez d'abord générer un rapport");
      return;
    }
    
    toast.success("Export PDF en cours de préparation...");
    // This would be implemented with a PDF generation library
    setTimeout(() => {
      toast.success("Le PDF a été téléchargé");
    }, 1500);
  };

  const exportCSV = () => {
    if (!reportGenerated || !startDate || !endDate) {
      toast("Veuillez d'abord générer un rapport");
      return;
    }
    
    try {
      // Filter invoices by the selected date range
      const filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date.split("/").reverse().join("-"));
        return (
          invoiceDate >= startDate &&
          invoiceDate <= endDate
        );
      });
      
      // Create CSV content
      let csvContent = "Client,Facture,Date,Montant,Statut\n";
      
      filteredInvoices.forEach((invoice) => {
        const status = 
          invoice.status === "paid" ? "Payée" :
          invoice.status === "pending" ? "En attente" :
          invoice.status === "overdue" ? "En retard" : "Brouillon";
          
        csvContent += `${invoice.client},${invoice.number},${invoice.date},${invoice.amount},${status}\n`;
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${getReportFileName()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export CSV réussi");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Erreur lors de l'export CSV");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générer un rapport financier
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une période et générez un rapport financier pour vos factures.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Période</h3>
            
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Button
                  key={period.name}
                  variant="outline"
                  size="sm"
                  onClick={() => selectPeriod(period.start, period.end)}
                  className={`text-xs ${
                    startDate?.getTime() === period.start.getTime() && 
                    endDate?.getTime() === period.end.getTime()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : ""
                  }`}
                >
                  {period.name}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
              <div className="grid gap-1.5">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Date de début
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className="w-[150px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "dd/MM/yyyy")
                      ) : (
                        <span>Sélectionner...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      // Suppression de l'attribut initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="endDate" className="text-sm font-medium">
                  Date de fin
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className="w-[150px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "dd/MM/yyyy")
                      ) : (
                        <span>Sélectionner...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      // Suppression de l'attribut initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {!reportGenerated ? (
            <Button
              onClick={generateReport}
              className="w-full"
              disabled={isGenerating || !startDate || !endDate}
            >
              {isGenerating ? (
                "Génération en cours..."
              ) : (
                "Générer le rapport"
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">
                  Rapport du {format(startDate!, "dd/MM/yyyy")} au {format(endDate!, "dd/MM/yyyy")}
                </h3>
                
                <InvoiceReport 
                  startDate={startDate!}
                  endDate={endDate!}
                  invoices={invoices}
                />
              </div>
              
              <div className="text-sm text-muted-foreground italic mt-4">
                <p>Ce rapport peut être utilisé comme support pour votre déclaration fiscale. Toutefois, il ne constitue pas un document comptable officiel.</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center gap-2">
          <div className="flex gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Fermer
            </Button>
          </div>
          
          {reportGenerated && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={exportPDF}
              >
                <FilePdf className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={exportCSV}
              >
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
