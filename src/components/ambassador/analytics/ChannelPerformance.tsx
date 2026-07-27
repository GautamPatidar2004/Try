import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelStats, DeviceStats } from "@/hooks/useAmbassadorAnalytics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Instagram, Mail, Youtube, Twitter, Globe, Smartphone, Monitor, Tablet } from "lucide-react";

interface ChannelPerformanceProps {
  channelStats: ChannelStats[];
  deviceStats: DeviceStats[];
  totalClicks: number;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <span className="text-sm font-bold">TT</span>,
  email: <Mail className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  direct: <Globe className="h-4 w-4" />,
  other: <Globe className="h-4 w-4" />,
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="h-4 w-4" />,
  desktop: <Monitor className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
};

const DEVICE_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export const ChannelPerformance = ({ channelStats, deviceStats, totalClicks }: ChannelPerformanceProps) => {
  const chartData = channelStats.map(stat => ({
    name: stat.channel.charAt(0).toUpperCase() + stat.channel.slice(1),
    clicks: stat.clicks,
    conversions: stat.conversions,
    rate: stat.conversionRate,
    color: stat.color,
  }));

  const deviceChartData = deviceStats.map(stat => ({
    name: stat.device.charAt(0).toUpperCase() + stat.device.slice(1),
    value: stat.count,
    percentage: stat.percentage,
  }));

  if (totalClicks === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No channel data yet</h3>
          <p className="text-muted-foreground text-center mt-2">
            Share your referral link to start seeing channel performance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Clicks by Channel */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Clicks by Channel</CardTitle>
          <CardDescription>Traffic sources for your referral links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name === 'clicks' ? 'Clicks' : 'Conversions']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate by Channel */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Conversion Rate by Channel</CardTitle>
          <CardDescription>Which channels convert best</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelStats.slice(0, 5).map((stat) => (
              <div key={stat.channel} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {CHANNEL_ICONS[stat.channel]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{stat.channel}</span>
                    <span className="text-sm text-muted-foreground">
                      {stat.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(stat.conversionRate * 5, 100)}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-[60px]">
                  <span className="text-sm font-medium">{stat.conversions}</span>
                  <span className="text-xs text-muted-foreground">/{stat.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>Where your audience accesses your links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {deviceChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} clicks`, 'Clicks']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {deviceStats.map((stat, index) => (
                <div key={stat.device} className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] + '20' }}
                  >
                    {DEVICE_ICONS[stat.device]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{stat.device}</p>
                    <p className="text-sm text-muted-foreground">{stat.count} clicks</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {stat.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
