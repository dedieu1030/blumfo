
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { useTranslation } from "react-i18next";
import { CurrencyFormat, PercentageFormat } from "@/components/ui/number-format";

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

  // Data for dashboard stats - in a real application these would come from API calls
  const thisMonthTotal = 3450;
  const totalPaid = 2100;
  const totalPending = 1350;

  // Calculate percentages - in a real application these would be calculated from historical data
  const thisMonthPercentage = 12;
  const paidPercentage = 8;
  const pendingPercentage = 24;
  const overduePercentage = overdueInvoices.length > 0 ? 100 : 0;

  const stats = [
    {
      title: t("totalBilledThisMonth", "Total facturé ce mois"),
      value: thisMonthTotal,
      change: thisMonthPercentage,
      increasing: true
    },
    {
      title: t("totalPaid", "Total payé"),
      value: totalPaid,
      change: paidPercentage,
      increasing: true
    },
    {
      title: t("pending", "En attente"),
      value: totalPending,
      change: pendingPercentage,
      increasing: true
    },
    {
      title: t("overdueInvoices", "Factures impayées"),
      value: totalOverdueAmount,
      secondaryValue: `${overdueInvoices.length} ${t("invoices", "factures")}`,
      change: overduePercentage,
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
            <div className="text-2xl font-bold">
              <CurrencyFormat value={stat.value} options={{ minimumFractionDigits: 0 }} />
            </div>
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
              <PercentageFormat 
                value={stat.change / 100} 
                options={{ 
                  signDisplay: "always", 
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }} 
              /> {t("sinceLastMonth", "depuis le mois dernier")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;
