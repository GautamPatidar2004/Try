import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, MousePointerClick, Eye, X, UserPlus, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { format, subDays } from "date-fns";

type EventType =
  | "shown"
  | "dismissed"
  | "cta_clicked"
  | "auth_landed"
  | "signup_completed"
  | "onboarding_completed";

interface PopupEvent {
  id: string;
  event_type: EventType;
  session_id: string;
  cta_user_type: "creator" | "host" | null;
  user_id: string | null;
  path: string | null;
  created_at: string;
}

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "All time", value: "all" },
];

export const PopupAnalytics = () => {
  const [range, setRange] = useState("30");

  const since = useMemo(() => {
    if (range === "all") return null;
    return subDays(new Date(), Number(range)).toISOString();
  }, [range]);

  const { data: events, isLoading } = useQuery({
    queryKey: ["popup-events", range],
    queryFn: async () => {
      let q = supabase
        .from("popup_events")
        .select("id,event_type,session_id,cta_user_type,user_id,path,created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (since) q = q.gte("created_at", since);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as PopupEvent[];
    },
  });

  const stats = useMemo(() => {
    const e = events || [];
    const count = (t: EventType) => e.filter((x) => x.event_type === t).length;
    const ctaCreator = e.filter((x) => x.event_type === "cta_clicked" && x.cta_user_type === "creator").length;
    const ctaHost = e.filter((x) => x.event_type === "cta_clicked" && x.cta_user_type === "host").length;
    const shown = count("shown");
    const dismissed = count("dismissed");
    const ctaClicked = count("cta_clicked");
    const authLanded = count("auth_landed");
    const signups = count("signup_completed");

    // Per-session funnel attribution
    const bySession = new Map<string, Set<EventType>>();
    const sessionType = new Map<string, "creator" | "host" | null>();
    for (const ev of e) {
      if (!bySession.has(ev.session_id)) bySession.set(ev.session_id, new Set());
      bySession.get(ev.session_id)!.add(ev.event_type);
      if (ev.cta_user_type) sessionType.set(ev.session_id, ev.cta_user_type);
    }
    const sessions = Array.from(bySession.entries());
    const sessionsWithClick = sessions.filter(([, set]) => set.has("cta_clicked"));
    const sessionsSignedUp = sessionsWithClick.filter(([, set]) => set.has("signup_completed"));
    const clickToSignup = sessionsWithClick.length
      ? Math.round((sessionsSignedUp.length / sessionsWithClick.length) * 100)
      : 0;
    const shownToClick = shown ? Math.round((ctaClicked / shown) * 100) : 0;

    // CTA split conversion
    const ctaSplit = (["creator", "host"] as const).map((t) => {
      const clicks = sessions.filter(([sid, set]) => set.has("cta_clicked") && sessionType.get(sid) === t).length;
      const signups = sessions.filter(([sid, set]) => set.has("cta_clicked") && set.has("signup_completed") && sessionType.get(sid) === t).length;
      return {
        userType: t,
        clicks,
        signups,
        conversion: clicks ? Math.round((signups / clicks) * 100) : 0,
      };
    });

    // Time series
    const byDay = new Map<string, Record<string, number>>();
    for (const ev of e) {
      const day = format(new Date(ev.created_at), "MMM d");
      const row = byDay.get(day) || { date: 0 as never };
      row[ev.event_type] = ((row[ev.event_type] as number) || 0) + 1;
      byDay.set(day, row);
    }
    const series = Array.from(byDay.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .reverse();

    const funnel = [
      { step: "Shown", value: shown },
      { step: "CTA Clicked", value: ctaClicked },
      { step: "Auth Landed", value: authLanded },
      { step: "Signup Completed", value: signups },
    ];

    return { shown, dismissed, ctaClicked, ctaCreator, ctaHost, signups, shownToClick, clickToSignup, ctaSplit, series, funnel };
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Pop-up Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Landing-page signup pop-up — clicks, dismissals, and downstream signups.
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Eye} label="Shown" value={stats.shown} />
        <StatCard icon={MousePointerClick} label="CTA Clicks" value={stats.ctaClicked} sub={`${stats.shownToClick}% of shown`} />
        <StatCard icon={X} label="Dismissed" value={stats.dismissed} />
        <StatCard icon={UserPlus} label="Signups" value={stats.signups} />
        <StatCard icon={CheckCircle2} label="Click → Signup" value={`${stats.clickToSignup}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.funnel} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="step" width={130} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTA Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.ctaSplit.map((row) => (
              <div key={row.userType} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{row.userType === "creator" ? "I'm a Creator" : "I'm a Host / Brand"}</span>
                  <span className="text-muted-foreground">
                    {row.clicks} clicks · {row.signups} signups · <Badge variant="secondary">{row.conversion}%</Badge>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(100, row.conversion)}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.ctaSplit.every((r) => r.clicks === 0) && (
              <p className="text-sm text-muted-foreground">No CTA clicks in this range yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="shown" stroke="hsl(var(--muted-foreground))" />
              <Line type="monotone" dataKey="cta_clicked" stroke="hsl(var(--primary))" />
              <Line type="monotone" dataKey="signup_completed" stroke="hsl(var(--hostfluencer-green))" />
              <Line type="monotone" dataKey="dismissed" stroke="hsl(var(--destructive))" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">CTA</th>
                  <th className="py-2 pr-4">Session</th>
                  <th className="py-2 pr-4">Path</th>
                  <th className="py-2 pr-4">User</th>
                </tr>
              </thead>
              <tbody>
                {(events || []).slice(0, 50).map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{format(new Date(e.created_at), "MMM d, HH:mm")}</td>
                    <td className="py-2 pr-4"><Badge variant="outline">{e.event_type}</Badge></td>
                    <td className="py-2 pr-4">{e.cta_user_type || "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{e.session_id.slice(0, 10)}…</td>
                    <td className="py-2 pr-4 text-muted-foreground">{e.path || "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{e.user_id ? `${e.user_id.slice(0, 8)}…` : "—"}</td>
                  </tr>
                ))}
                {!events?.length && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">No events recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardContent>
  </Card>
);

export default PopupAnalytics;