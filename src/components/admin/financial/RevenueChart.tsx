import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; mrr: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const hasData = data && data.length > 0 && data.some(d => d.mrr > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>MRR Trends (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No subscription revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                domain={[0, 'auto']}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'MRR']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mrr" 
                stroke="hsl(var(--hostfluencer-green))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--hostfluencer-green))' }}
                name="Monthly MRR"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
