import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface Post {
  created_at: string;
}

interface PostsTimelineChartProps {
  posts: Post[];
}

const PostsTimelineChart = ({ posts }: PostsTimelineChartProps) => {
  const getLast30DaysData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = posts.filter(post => 
        format(new Date(post.created_at), 'yyyy-MM-dd') === dateStr
      ).length;
      
      data.push({
        date: format(date, 'MMM dd'),
        posts: count
      });
    }
    return data;
  };

  const chartData = getLast30DaysData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts Timeline (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="posts" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PostsTimelineChart;
