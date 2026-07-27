 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Globe, MapPin, Users, Home, TrendingUp } from "lucide-react";
 import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
 
 interface LocationData {
   location: string;
   users: number;
   hosts: number;
   creators: number;
   properties: number;
 }
 
 const COLORS = [
   'hsl(var(--primary))',
   'hsl(var(--chart-1))',
   'hsl(var(--chart-2))',
   'hsl(var(--chart-3))',
   'hsl(var(--chart-4))'
 ];
 
 const normalizeLocation = (location: string): string => {
   return location
     .trim()
     .split(',')[0]  // Take first part (city)
     .replace(/\s+/g, ' ')  // Normalize spaces
     .trim();
 };
 
 export const EnhancedGeographicMetrics = () => {
   const { data, isLoading } = useQuery({
     queryKey: ['enhanced-geographic-data'],
     queryFn: async () => {
       // Fetch profiles with user type
       const { data: profiles } = await supabase
         .from('profiles')
         .select('location, user_type');
 
       // Fetch properties
       const { data: properties } = await supabase
         .from('properties')
         .select('location');
 
       // Aggregate by normalized location
       const locationMap = new Map<string, LocationData>();
 
       profiles?.forEach(p => {
         if (p.location) {
           const normalizedLoc = normalizeLocation(p.location);
           const existing = locationMap.get(normalizedLoc) || {
             location: normalizedLoc,
             users: 0,
             hosts: 0,
             creators: 0,
             properties: 0
           };
           existing.users++;
           if (p.user_type === 'host') existing.hosts++;
           if (p.user_type === 'influencer') existing.creators++;
           locationMap.set(normalizedLoc, existing);
         }
       });
 
       properties?.forEach(p => {
         if (p.location) {
           const normalizedLoc = normalizeLocation(p.location);
           const existing = locationMap.get(normalizedLoc) || {
             location: normalizedLoc,
             users: 0,
             hosts: 0,
             creators: 0,
             properties: 0
           };
           existing.properties++;
           locationMap.set(normalizedLoc, existing);
         }
       });
 
       const locations = Array.from(locationMap.values())
         .sort((a, b) => b.users - a.users);
 
       // Calculate totals
       const totalUsers = locations.reduce((sum, l) => sum + l.users, 0);
       const totalHosts = locations.reduce((sum, l) => sum + l.hosts, 0);
       const totalCreators = locations.reduce((sum, l) => sum + l.creators, 0);
       const totalProperties = locations.reduce((sum, l) => sum + l.properties, 0);
 
       return {
         locations,
         topLocations: locations.slice(0, 10),
         totalLocations: locations.length,
         totalUsers,
         totalHosts,
         totalCreators,
         totalProperties
       };
     }
   });
 
   if (isLoading) {
     return <div className="text-center py-8">Loading geographic data...</div>;
   }
 
   if (!data) return null;
 
   const userTypeData = [
     { name: 'Hosts', value: data.totalHosts, color: 'hsl(var(--chart-1))' },
     { name: 'Creators', value: data.totalCreators, color: 'hsl(var(--chart-2))' },
     { name: 'Other', value: data.totalUsers - data.totalHosts - data.totalCreators, color: 'hsl(var(--muted))' }
   ].filter(d => d.value > 0);
 
   return (
     <div className="space-y-6">
       {/* Summary Stats */}
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
             <Globe className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{data.totalLocations}</div>
             <p className="text-xs text-muted-foreground">Unique cities/regions</p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Users with Location</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
               {data.totalHosts} hosts · {data.totalCreators} creators
             </p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Top Location</CardTitle>
             <MapPin className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold truncate">
               {data.topLocations[0]?.location || 'N/A'}
             </div>
             <p className="text-xs text-muted-foreground">
               {data.topLocations[0]?.users || 0} users
             </p>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
             <Home className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{data.totalProperties}</div>
             <p className="text-xs text-muted-foreground">Across all locations</p>
           </CardContent>
         </Card>
       </div>
 
       <div className="grid gap-4 md:grid-cols-2">
         {/* Top Locations Bar Chart */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <TrendingUp className="w-5 h-5" />
               Top Locations by Users
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.topLocations} layout="vertical">
                   <XAxis type="number" />
                   <YAxis 
                     type="category" 
                     dataKey="location" 
                     width={100}
                     tick={{ fontSize: 12 }}
                   />
                   <Tooltip 
                     formatter={(value: number, name: string) => [value, name === 'users' ? 'Total Users' : name]}
                     contentStyle={{ 
                       backgroundColor: 'hsl(var(--background))',
                       border: '1px solid hsl(var(--border))'
                     }}
                   />
                   <Bar dataKey="users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
 
         {/* User Type Distribution by Location */}
         <Card>
           <CardHeader>
             <CardTitle>User Type Distribution</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={userTypeData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={90}
                     paddingAngle={2}
                     dataKey="value"
                   >
                     {userTypeData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 mt-4">
               {userTypeData.map((entry) => (
                 <div key={entry.name} className="flex items-center gap-2">
                   <div 
                     className="w-3 h-3 rounded-full" 
                     style={{ backgroundColor: entry.color }}
                   />
                   <span className="text-sm">{entry.name}: {entry.value}</span>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Detailed Location List */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Globe className="w-5 h-5" />
             All Locations
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-3 max-h-[400px] overflow-y-auto">
             {data.topLocations.map((location, idx) => (
               <div 
                 key={location.location} 
                 className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                     {idx + 1}
                   </Badge>
                   <div>
                     <p className="font-medium">{location.location}</p>
                     <p className="text-xs text-muted-foreground">
                       {location.hosts} hosts · {location.creators} creators · {location.properties} properties
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-bold">{location.users}</p>
                   <p className="text-xs text-muted-foreground">users</p>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };