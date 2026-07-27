import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Star } from "lucide-react";

interface RatingDistributionChartProps {
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const RatingDistributionChart = ({ distribution }: RatingDistributionChartProps) => {
  const data = [
    { rating: '5 ★', count: distribution[5], fill: 'hsl(var(--chart-1))' },
    { rating: '4 ★', count: distribution[4], fill: 'hsl(var(--chart-2))' },
    { rating: '3 ★', count: distribution[3], fill: 'hsl(var(--chart-3))' },
    { rating: '2 ★', count: distribution[2], fill: 'hsl(var(--chart-4))' },
    { rating: '1 ★', count: distribution[1], fill: 'hsl(var(--chart-5))' }
  ];

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Rating Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="rating" 
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [
                `${value} reviews (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                'Count'
              ]}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
