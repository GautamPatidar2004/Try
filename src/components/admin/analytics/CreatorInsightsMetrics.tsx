 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { useCreatorInsights } from "@/hooks/useCreatorInsights";
 import { Users, Hash, Instagram, UserCheck } from "lucide-react";
 import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
 
 const NICHE_COLORS = [
   'hsl(var(--primary))',
   'hsl(var(--chart-1))',
   'hsl(var(--chart-2))',
   'hsl(var(--chart-3))',
   'hsl(var(--chart-4))',
   'hsl(var(--chart-5))',
   '#94a3b8',
   '#64748b',
   '#475569',
   '#334155'
 ];
 
 const PLATFORM_COLORS: Record<string, string> = {
   Instagram: '#E4405F',
   TikTok: '#000000',
   YouTube: '#FF0000',
   Twitter: '#1DA1F2'
 };
 
 export const CreatorInsightsMetrics = () => {
   const { data: insights, isLoading } = useCreatorInsights();
 
   if (isLoading) {
     return (
       <div className="space-y-4">
         <div className="grid gap-4 md:grid-cols-4">
           {[1, 2, 3, 4].map((i) => (
             <Card key={i} className="animate-pulse">
               <CardHeader className="pb-2">
                 <div className="h-4 bg-muted rounded w-24"></div>
               </CardHeader>
               <CardContent>
                 <div className="h-8 bg-muted rounded w-16"></div>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     );
   }
 
   if (!insights) return null;
 
   const formatFollowers = (num: number) => {
     if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
     if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
     return num.toString();
   };
 
   return (
     <div className="space-y-6">
       {/* Summary Cards */}
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{insights.totalCreators.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">Registered influencers</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Avg Niches</CardTitle>
             <Hash className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{insights.avgNichesPerCreator}</div>
             <p className="text-xs text-muted-foreground">Per creator</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Instagram Connected</CardTitle>
             <Instagram className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{insights.instagramConnected}%</div>
             <p className="text-xs text-muted-foreground">Of all creators</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Avg Followers</CardTitle>
             <UserCheck className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatFollowers(insights.avgFollowers)}</div>
             <p className="text-xs text-muted-foreground">Per creator</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Charts Row */}
       <div className="grid gap-4 md:grid-cols-2">
         {/* Niche Distribution Pie Chart */}
         <Card>
           <CardHeader>
             <CardTitle>Content Niche Distribution</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={insights.niches}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={2}
                     dataKey="count"
                     nameKey="niche"
                     label={({ niche, percentage }) => `${niche} (${percentage}%)`}
                     labelLine={false}
                   >
                     {insights.niches.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={NICHE_COLORS[index % NICHE_COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value: number, name: string) => [`${value} creators`, name]}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-4 flex flex-wrap gap-2">
               {insights.niches.slice(0, 5).map((niche, idx) => (
                 <div key={niche.niche} className="flex items-center gap-1 text-xs">
                   <div 
                     className="w-3 h-3 rounded-full" 
                     style={{ backgroundColor: NICHE_COLORS[idx] }}
                   />
                   <span>{niche.niche}: {niche.count}</span>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Platform Distribution */}
         <Card>
           <CardHeader>
             <CardTitle>Platform Distribution</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={insights.platforms} layout="vertical">
                   <XAxis type="number" />
                   <YAxis type="category" dataKey="platform" width={80} />
                   <Tooltip 
                     formatter={(value: number) => [`${value} creators`, 'Connected']}
                   />
                   <Bar 
                     dataKey="count" 
                     radius={[0, 4, 4, 0]}
                   >
                     {insights.platforms.map((entry) => (
                       <Cell 
                         key={entry.platform} 
                         fill={PLATFORM_COLORS[entry.platform] || 'hsl(var(--primary))'} 
                       />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-2">
               {insights.platforms.map(platform => (
                 <div key={platform.platform} className="flex items-center justify-between text-sm">
                   <span className="flex items-center gap-2">
                     <div 
                       className="w-3 h-3 rounded-full" 
                       style={{ backgroundColor: PLATFORM_COLORS[platform.platform] }}
                     />
                     {platform.platform}
                   </span>
                   <span className="font-medium">{platform.percentage}%</span>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Follower Distribution */}
       <Card>
         <CardHeader>
           <CardTitle>Follower Distribution</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {insights.followerBuckets.map((bucket, idx) => (
               <div key={bucket.bucket} className="space-y-2">
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <span className="font-medium capitalize">{bucket.bucket}</span>
                     <span className="text-sm text-muted-foreground">({bucket.range})</span>
                   </div>
                   <div className="text-right">
                     <span className="font-bold">{bucket.count}</span>
                     <span className="text-sm text-muted-foreground ml-2">({bucket.percentage}%)</span>
                   </div>
                 </div>
                 <div className="w-full bg-muted rounded-full h-3">
                   <div 
                     className="rounded-full h-3 transition-all"
                     style={{ 
                       width: `${bucket.percentage}%`,
                       backgroundColor: NICHE_COLORS[idx % NICHE_COLORS.length]
                     }}
                   />
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       {/* Engagement Tiers */}
       <div className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Engagement Rate Tiers</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={insights.engagementTiers}>
                   <XAxis dataKey="tier" />
                   <YAxis />
                   <Tooltip formatter={(value: number) => [`${value} creators`, 'Count']} />
                   <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
               <div>Low: 0-2%</div>
               <div>Medium: 2-5%</div>
               <div>High: 5-10%</div>
               <div>Elite: 10%+</div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle>Multi-Niche Distribution</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={insights.multiNicheDistribution}>
                   <XAxis 
                     dataKey="count" 
                     tickFormatter={(value) => `${value} niche${value !== 1 ? 's' : ''}`}
                   />
                   <YAxis />
                   <Tooltip 
                     formatter={(value: number) => [`${value} creators`, 'Count']}
                     labelFormatter={(label) => `${label} niche${label !== 1 ? 's' : ''}`}
                   />
                   <Bar dataKey="creators" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <p className="mt-4 text-sm text-muted-foreground text-center">
               How many niches creators typically have
             </p>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 };