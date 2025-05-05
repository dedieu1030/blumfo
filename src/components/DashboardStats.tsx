
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export function DashboardStats() {
  const stats = [
    {
      title: "Total facturé ce mois",
      value: "3,450 €",
      change: "+12%",
      increasing: true
    },
    {
      title: "Total payé",
      value: "2,100 €",
      change: "+8%",
      increasing: true
    },
    {
      title: "En attente",
      value: "1,350 €",
      change: "+24%",
      increasing: true
    },
    {
      title: "Commissions",
      value: "17.25 €",
      change: "+12%",
      increasing: true
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
            <p className={`text-xs flex items-center ${
              stat.increasing ? "text-success" : "text-destructive"
            }`}>
              {stat.increasing ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {stat.change} depuis le mois dernier
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;
