
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Calendar,
  Clock,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { format } from 'date-fns';
import { InvoiceStatus } from "@/components/InvoiceStatus";
import { InvoiceActions } from "@/components/InvoiceActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Invoice } from "@/types/invoice";

interface InvoiceMobileCardProps {
  invoice: Invoice;
}

export function InvoiceMobileCard({ invoice }: InvoiceMobileCardProps) {
  const navigate = useNavigate();
  
  // Fonctions d'assistance pour gérer les différents formats de noms de client
  const getClientName = (invoice: Invoice) => {
    if (typeof invoice.client === 'string') {
      return invoice.client;
    } else if (invoice.client && invoice.client.client_name) {
      return invoice.client.client_name;
    } else if (invoice.client_name) {
      return invoice.client_name;
    }
    return "Client inconnu";
  };
  
  // Gérer les formats de date possibles
  const getIssueDate = (invoice: Invoice) => {
    return invoice.issue_date || invoice.date || "";
  };
  
  const getDueDate = (invoice: Invoice) => {
    return invoice.dueDate || invoice.due_date || "";
  };
  
  const getAmount = (invoice: Invoice) => {
    if (typeof invoice.amount === 'string') {
      return invoice.amount;
    } else if (invoice.total_amount) {
      return invoice.total_amount.toString();
    }
    return "0";
  };
  
  // Ouvrir les détails de la facture
  const handleOpenInvoice = () => {
    navigate(`/invoices/${invoice.id}`);
  };

  // Détermine l'icône de statut à afficher
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'unpaid':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'draft':
        return <FileSpreadsheet className="h-5 w-5 text-gray-500" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatAmount = (amountStr: string) => {
    if (!amountStr) return "0,00 €";
    const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-3">
          {/* En-tête avec n° de facture et actions */}
          <div className="flex justify-between items-center">
            <div className="font-medium">{invoice.invoice_number || invoice.number}</div>
            <div className="flex items-center">
              <InvoiceStatus status={invoice.status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <InvoiceActions invoice={invoice} isDropdown={true} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Informations client */}
          <div className="text-sm">
            <span className="text-muted-foreground">Client:</span>{" "}
            <span className="font-medium">{getClientName(invoice)}</span>
          </div>
          
          {/* Montant et statut (version mobile compact) */}
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">{formatAmount(getAmount(invoice))}</div>
          </div>
          
          {/* Dates */}
          <div className="flex flex-col space-y-1 text-xs">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Émise le: {getIssueDate(invoice) ? format(new Date(getIssueDate(invoice)), 'dd/MM/yyyy') : 'N/A'}</span>
            </div>
            
            {getDueDate(invoice) && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Échéance: {format(new Date(getDueDate(invoice)), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>
          
          {/* Bouton pour voir les détails */}
          <Button 
            variant="outline"
            className="w-full mt-2"
            size="sm"
            onClick={handleOpenInvoice}
          >
            Voir les détails
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
