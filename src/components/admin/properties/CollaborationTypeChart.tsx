import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CollaborationData {
  name: string;
  count: number;
}

interface CollaborationTypeChartProps {
  data: CollaborationData[];
}

const CollaborationTypeChart = ({ data }: CollaborationTypeChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Types</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.replace('_', ' ')}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value, 'Properties']}
              labelFormatter={(label) => label.replace('_', ' ')}
            />
            <Legend />
            <Bar dataKey="count" fill="hsl(var(--primary))" name="Properties" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CollaborationTypeChart;
