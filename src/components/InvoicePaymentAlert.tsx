
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InvoicePaymentAlertProps {
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
}

// Calcule le nombre de jours entre aujourd'hui et la date d'échéance
const getDaysDifference = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate.split("/").reverse().join("-"));
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function InvoicePaymentAlert({ dueDate, status }: InvoicePaymentAlertProps) {
  // Si la facture est déjà payée ou en brouillon, pas d'alerte
  if (status === "paid" || status === "draft") {
    return null;
  }

  const daysDifference = getDaysDifference(dueDate);
  
  // Si la facture est en retard
  if (daysDifference < 0 || status === "overdue") {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Paiement en retard</AlertTitle>
        <AlertDescription>
          Cette facture a dépassé sa date d'échéance de {Math.abs(daysDifference)} jour(s).
          Veuillez confirmer si elle a été payée.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Si l'échéance approche (moins de 3 jours)
  if (daysDifference <= 3) {
    return (
      <Alert variant="warning" className="mt-2 bg-yellow-50 text-yellow-900 border-yellow-200">
        <Clock className="h-4 w-4" />
        <AlertTitle>Échéance proche</AlertTitle>
        <AlertDescription>
          Cette facture doit être payée dans {daysDifference} jour(s).
          Pensez à vérifier son statut prochainement.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
