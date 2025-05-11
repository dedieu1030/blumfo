
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { useTranslation } from "react-i18next";

interface DashboardStatsProps {
  overdueInvoices: Invoice[];
}

export function DashboardStats({ overdueInvoices = [] }: DashboardStatsProps) {
  const { t } = useTranslation();

  // Calculate the total amount of overdue invoices
  const totalOverdueAmount = overdueInvoices.reduce((sum, invoice) => {
    // Extract the numeric value from the amount string (removing currency symbol and commas)
    const amountNumeric = parseFloat(invoice.amount.replace(/[€,$,\s]/g, '').replace(',', '.'));
    return !isNaN(amountNumeric) ? sum + amountNumeric : sum;
  }, 0);

  // Format the total overdue amount with the Euro symbol
  const formattedOverdueAmount = `${totalOverdueAmount.toFixed(2)} €`;

  const stats = [
    {
      title: t("totalBilledThisMonth", "Total facturé ce mois"),
      value: "3,450 €",
      change: "+12%",
      increasing: true
    },
    {
      title: t("totalPaid", "Total payé"),
      value: "2,100 €",
      change: "+8%",
      increasing: true
    },
    {
      title: t("pending", "En attente"),
      value: "1,350 €",
      change: "+24%",
      increasing: true
    },
    {
      title: t("overdueInvoices", "Factures impayées"),
      value: formattedOverdueAmount,
      secondaryValue: `${overdueInvoices.length} ${t("invoices", "factures")}`,
      change: overdueInvoices.length > 0 ? "+100%" : "0%",
      increasing: overdueInvoices.length > 0
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.secondaryValue && (
              <p className="text-xs text-muted-foreground">{stat.secondaryValue}</p>
            )}
            <p className={`text-xs flex items-center ${
              stat.increasing ? "text-success" : "text-destructive"
            }`}>
              {stat.increasing ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {stat.change} {t("sinceLastMonth", "depuis le mois dernier")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;
