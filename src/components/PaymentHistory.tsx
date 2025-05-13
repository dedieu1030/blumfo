
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarIcon, CreditCard, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getPaymentHistory } from "@/services/paymentService";
import { Icons } from "@/components/ui/icon";
import { CurrencyFormat } from "@/components/ui/number-format";

interface PaymentHistoryProps {
  clientId?: string;
  invoiceId?: string;
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
  payment_methods?: {
    id: string;
    name: string;
    code: string;
    icon?: string;
  };
}

export function PaymentHistory({ clientId, invoiceId }: PaymentHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function fetchPayments() {
      setIsLoading(true);
      const result = await getPaymentHistory({ clientId, invoiceId });
      setPayments(result);
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
      const IconComponent = Icons[method.payment_methods.icon as keyof typeof Icons];
      return IconComponent ? <IconComponent className="h-4 w-4 mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />;
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
