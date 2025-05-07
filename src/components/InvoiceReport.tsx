
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { InvoiceReportChart } from "./InvoiceReportChart";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
}

interface InvoiceReportProps {
  startDate: Date;
  endDate: Date;
  invoices: Invoice[];
}

export function InvoiceReport({ startDate, endDate, invoices }: InvoiceReportProps) {
  // Filter invoices by the selected date range
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date.split("/").reverse().join("-"));
    return (
      invoiceDate >= startDate &&
      invoiceDate <= endDate
    );
  });

  // Calculate statistics
  const paidInvoices = filteredInvoices.filter(invoice => invoice.status === "paid");
  const pendingInvoices = filteredInvoices.filter(invoice => invoice.status === "pending");
  const overdueInvoices = filteredInvoices.filter(invoice => invoice.status === "overdue");

  // Calculate total amounts
  const getTotalAmount = (invoicesList: Invoice[]) => {
    return invoicesList.reduce((total, invoice) => {
      const amount = parseFloat(invoice.amount.replace(/[^\d.,]/g, '').replace(',', '.'));
      return total + amount;
    }, 0);
  };

  const totalPaidAmount = getTotalAmount(paidInvoices);
  const totalPendingAmount = getTotalAmount(pendingInvoices);
  const totalOverdueAmount = getTotalAmount(overdueInvoices);
  const totalRevenue = totalPaidAmount + totalPendingAmount + totalOverdueAmount;

  // Calculate tax amounts (assuming 20% VAT for this example)
  const taxRate = 0.20;
  const totalTaxPaid = totalPaidAmount * taxRate;
  const totalTaxPending = totalPendingAmount * taxRate;
  const totalTaxOverdue = totalOverdueAmount * taxRate;

  // Group invoices by client for top clients report
  const getClientTotals = () => {
    const clientTotals: Record<string, number> = {};
    filteredInvoices.forEach(invoice => {
      const amount = parseFloat(invoice.amount.replace(/[^\d.,]/g, '').replace(',', '.'));
      if (clientTotals[invoice.client]) {
        clientTotals[invoice.client] += amount;
      } else {
        clientTotals[invoice.client] = amount;
      }
    });
    
    return Object.entries(clientTotals)
      .map(([client, amount]) => ({ client, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };
  
  // Generate monthly data for the chart
  const getMonthlyData = () => {
    // Determine how many months to show (up to 6)
    const months = [];
    let currentMonth = endOfMonth(endDate);
    const startMonth = startOfMonth(startDate);
    
    // Generate up to 6 months of data
    while (currentMonth >= startMonth && months.length < 6) {
      months.unshift({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
        name: format(currentMonth, "MMM yyyy", { locale: fr })
      });
      currentMonth = endOfMonth(subMonths(currentMonth, 1));
    }
    
    // Generate data for each month
    return months.map(month => {
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date.split("/").reverse().join("-"));
        return isWithinInterval(invoiceDate, { start: month.start, end: month.end });
      });
      
      const paid = getTotalAmount(monthInvoices.filter(inv => inv.status === "paid"));
      const pending = getTotalAmount(monthInvoices.filter(inv => inv.status === "pending"));
      const overdue = getTotalAmount(monthInvoices.filter(inv => inv.status === "overdue"));
      
      return {
        name: month.name,
        paid,
        pending,
        overdue
      };
    });
  };

  const topClients = getClientTotals();
  const monthlyData = getMonthlyData();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 bg-muted/30 p-4 rounded-md">
          <h3 className="text-sm font-medium">Résumé des revenus</h3>
          <p className="text-sm text-muted-foreground">
            Factures totales: <span className="font-medium text-foreground">{filteredInvoices.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Montant total: <span className="font-medium text-foreground">{totalRevenue.toFixed(2)} €</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Montant payé: <span className="font-medium text-green-600">{totalPaidAmount.toFixed(2)} €</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Montant en attente: <span className="font-medium text-yellow-600">{totalPendingAmount.toFixed(2)} €</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Montant en retard: <span className="font-medium text-red-600">{totalOverdueAmount.toFixed(2)} €</span>
          </p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-md">
          <h3 className="text-sm font-medium">Résumé des taxes (TVA)</h3>
          <p className="text-sm text-muted-foreground">
            TVA collectée: <span className="font-medium text-foreground">{totalTaxPaid.toFixed(2)} €</span>
          </p>
          <p className="text-sm text-muted-foreground">
            TVA à percevoir: <span className="font-medium text-foreground">{totalTaxPending.toFixed(2)} €</span>
          </p>
          <p className="text-sm text-muted-foreground">
            TVA en retard: <span className="font-medium text-foreground">{totalTaxOverdue.toFixed(2)} €</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Total TVA sur la période: <span className="font-medium text-foreground">
              {(totalTaxPaid + totalTaxPending + totalTaxOverdue).toFixed(2)} €
            </span>
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Evolution mensuelle des revenus</h3>
        <InvoiceReportChart data={monthlyData} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Top Clients</h3>
        <div className="bg-muted/30 p-4 rounded-md">
          {topClients.length > 0 ? (
            <ul className="space-y-2">
              {topClients.map((client, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <span>{client.client}</span>
                  <span className="font-medium">{client.amount.toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun client sur la période</p>
          )}
        </div>
      </div>
    </div>
  );
}
