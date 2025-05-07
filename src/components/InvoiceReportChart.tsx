
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface InvoiceReportChartProps {
  data: {
    name: string;
    paid: number;
    pending: number;
    overdue?: number;
  }[];
  height?: number;
}

export function InvoiceReportChart({ data, height = 300 }: InvoiceReportChartProps) {
  const config = {
    paid: {
      label: "Payées",
      color: "#4ade80", // green
    },
    pending: {
      label: "En attente",
      color: "#facc15", // yellow
    },
    overdue: {
      label: "En retard",
      color: "#f87171", // red
    },
  };

  return (
    <div className="w-full space-y-4">
      <ChartContainer
        config={config}
        className="aspect-auto h-[300px]"
      >
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            stackOffset="sign"
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} €`}
              fontSize={12}
              width={80}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`${value} €`, config[name as keyof typeof config]?.label || name]}
                />
              }
            />
            <Bar dataKey="paid" fill="var(--color-paid)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="overdue" fill="var(--color-overdue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
