import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AgreementStatusChartProps {
  data: {
    active: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

const COLORS = {
  active: "hsl(var(--chart-1))",
  pending: "hsl(var(--chart-2))",
  completed: "hsl(var(--chart-3))",
  cancelled: "hsl(var(--chart-4))",
};

export const AgreementStatusChart = ({ data }: AgreementStatusChartProps) => {
  const chartData = [
    { name: "Active", value: data.active, color: COLORS.active },
    { name: "Pending", value: data.pending, color: COLORS.pending },
    { name: "Completed", value: data.completed, color: COLORS.completed },
    { name: "Cancelled", value: data.cancelled, color: COLORS.cancelled },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agreement Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
