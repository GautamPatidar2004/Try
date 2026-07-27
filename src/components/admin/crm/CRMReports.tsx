import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LIFECYCLE_STAGES } from "@/hooks/useCRMPipeline";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#ec4899"];

export const CRMReports = () => {
  const stageDistribution = useQuery({
    queryKey: ["crm-reports-stages"],
    queryFn: async () => {
      const results = [];
      for (const stage of LIFECYCLE_STAGES) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("lifecycle_stage", stage.id);
        results.push({ name: stage.label, value: count || 0 });
      }
      return results;
    },
  });

  const userTypeBreakdown = useQuery({
    queryKey: ["crm-reports-user-types"],
    queryFn: async () => {
      const types = ["influencer", "brand", "property", "restaurant"];
      const results = [];
      for (const t of types) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", t);
        results.push({ name: t, count: count || 0 });
      }
      return results;
    },
  });

  const funnelData = useQuery({
    queryKey: ["crm-reports-funnel"],
    queryFn: async () => {
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: profileComplete } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("lifecycle_stage", "profile_complete");
      const { count: active } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("lifecycle_stage", "active");
      const { count: booked } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "accepted");
      return [
        { name: "Signed Up", value: totalUsers || 0 },
        { name: "Profile Complete", value: (profileComplete || 0) + (active || 0) },
        { name: "Active", value: active || 0 },
        { name: "Booked", value: booked || 0 },
      ];
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">CRM Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            {funnelData.data && (
              <div className="space-y-3">
                {funnelData.data.map((step, i) => {
                  const maxVal = funnelData.data![0].value || 1;
                  const width = Math.max((step.value / maxVal) * 100, 10);
                  const rate = i > 0 ? Math.round((step.value / (funnelData.data![i - 1].value || 1)) * 100) : 100;
                  return (
                    <div key={step.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{step.name}</span>
                        <span className="text-muted-foreground">{step.value} {i > 0 && `(${rate}%)`}</span>
                      </div>
                      <div className="h-8 bg-muted rounded-md overflow-hidden">
                        <div
                          className="h-full rounded-md transition-all"
                          style={{ width: `${width}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Distribution Pie */}
        <Card>
          <CardHeader><CardTitle className="text-base">Stage Distribution</CardTitle></CardHeader>
          <CardContent>
            {stageDistribution.data && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stageDistribution.data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {stageDistribution.data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Type Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Users by Type</CardTitle></CardHeader>
          <CardContent>
            {userTypeBreakdown.data && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userTypeBreakdown.data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
