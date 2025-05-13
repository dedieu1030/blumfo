
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; 
import { Loader2, CalendarIcon, CreditCard, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getPaymentHistory } from "@/services/paymentService";
import { Icon } from "@/components/ui/icon";
import { CurrencyFormat } from "@/components/ui/number-format";

interface PaymentHistoryProps {
  clientId?: string;
  invoiceId?: string;
  showSummary?: boolean;
}

interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_date: string;
  created_at: string;
  transaction_reference: string;
  payment_reference: string;
  is_partial: boolean;
  payment_methods?: {
    id: string;
    name: string;
    code: string;
    icon?: string;
  };
}

interface InvoiceSummary {
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  isFullyPaid: boolean;
  paymentProgress: number;
}

export function PaymentHistory({ clientId, invoiceId, showSummary = true }: PaymentHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      setIsLoading(true);
      const result = await getPaymentHistory({ clientId, invoiceId });
      setPayments(result.payments || []);
      
      // Si les données de facture sont disponibles, calculer le résumé
      if (result.invoice) {
        const invoice = result.invoice;
        const totalAmount = invoice.total_amount || 0;
        const amountPaid = invoice.amount_paid || 0;
        const amountDue = invoice.amount_due || (totalAmount - amountPaid);
        const isFullyPaid = amountPaid >= totalAmount;
        const paymentProgress = totalAmount > 0 ? Math.min(100, (amountPaid / totalAmount) * 100) : 0;
        
        setInvoiceSummary({
          totalAmount,
          amountPaid,
          amountDue,
          currency: invoice.currency || 'EUR',
          isFullyPaid,
          paymentProgress
        });
      }
      
      setIsLoading(false);
    }

    fetchPayments();
  }, [clientId, invoiceId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Payé</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Échoué</Badge>;
      default:
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" /> {status}</Badge>;
    }
  };

  const getMethodIcon = (method: Payment) => {
    if (method.payment_methods?.icon) {
      return <Icon name={method.payment_methods.icon as any} className="h-4 w-4 mr-2" />;
    }
    return <CreditCard className="h-4 w-4 mr-2" />;
  };

  const getMethodName = (method: Payment) => {
    return method.payment_methods?.name || method.payment_method || "Inconnu";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des paiements</CardTitle>
        <CardDescription>Historique des transactions liées à cette facture</CardDescription>
      </CardHeader>
      <CardContent>
        {showSummary && invoiceSummary && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-lg font-semibold">
                  <CurrencyFormat 
                    value={invoiceSummary.totalAmount} 
                    options={{ currency: invoiceSummary.currency }}
                  />
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant payé</p>
                <p className="text-lg font-semibold text-green-600">
                  <CurrencyFormat 
                    value={invoiceSummary.amountPaid} 
                    options={{ currency: invoiceSummary.currency }}
                  />
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant restant</p>
                <p className={`text-lg font-semibold ${invoiceSummary.isFullyPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  <CurrencyFormat 
                    value={invoiceSummary.amountDue} 
                    options={{ currency: invoiceSummary.currency }}
                  />
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>Progrès du paiement</span>
                <span>{Math.round(invoiceSummary.paymentProgress)}%</span>
              </div>
              <Progress value={invoiceSummary.paymentProgress} className="h-2" />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {payment.payment_date 
                            ? format(new Date(payment.payment_date), "Pp", { locale: fr })
                            : format(new Date(payment.created_at), "Pp", { locale: fr })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getMethodIcon(payment)}
                        <span>{getMethodName(payment)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CurrencyFormat 
                        value={payment.amount} 
                        options={{ currency: payment.currency }} 
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {payment.payment_reference || payment.transaction_reference || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.is_partial ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                          Partiel
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Complet
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {showSummary && invoiceSummary && (
        <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
          {invoiceSummary.isFullyPaid ? (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" /> 
              Cette facture est entièrement payée
            </div>
          ) : (
            <div>
              Montant restant à payer : <span className="font-semibold">
                <CurrencyFormat 
                  value={invoiceSummary.amountDue} 
                  options={{ currency: invoiceSummary.currency }}
                />
              </span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
