import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface AudienceChartProps {
  type: 'gender' | 'age';
  data: Record<string, number>;
  title: string;
}

const GENDER_COLORS = {
  male: 'hsl(var(--primary))',
  female: 'hsl(var(--accent))',
  other: 'hsl(var(--muted))'
};

const AGE_COLOR = 'hsl(var(--primary))';

export const AudienceChart = ({ type, data, title }: AudienceChartProps) => {
  if (type === 'gender') {
    const chartData = Object.entries(data).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}%`}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={GENDER_COLORS[entry.name.toLowerCase() as keyof typeof GENDER_COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([name, value]) => ({
    age: name,
    percentage: value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentage" fill={AGE_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
