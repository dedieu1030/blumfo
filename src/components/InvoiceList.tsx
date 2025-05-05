
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "./InvoiceStatus";
import { Download, Send, Copy } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
}

interface InvoiceListProps {
  title: string;
  invoices: Invoice[];
  limit?: number;
  showViewAll?: boolean;
}

export function InvoiceList({ title, invoices, limit, showViewAll = false }: InvoiceListProps) {
  const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {showViewAll && (
          <Button variant="link" className="text-violet">
            Voir toutes
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <InvoiceStatus status={invoice.status} />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default InvoiceList;
