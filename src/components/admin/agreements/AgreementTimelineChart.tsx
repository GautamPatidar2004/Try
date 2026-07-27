import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format, subDays } from "date-fns";

interface AgreementTimelineChartProps {
  agreements: any[];
}

export const AgreementTimelineChart = ({ agreements }: AgreementTimelineChartProps) => {
  const getLast30DaysData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = agreements.filter(a => 
        format(new Date(a.created_at), 'yyyy-MM-dd') === dateStr
      ).length;
      
      data.push({
        date: format(date, 'MMM dd'),
        agreements: count,
      });
    }
    return data;
  };

  const chartData = getLast30DaysData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agreements Created (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="agreements" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
