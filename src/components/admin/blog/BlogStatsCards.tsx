 import { FileText, Eye, Send, FilePen } from "lucide-react";
 import { Card, CardContent } from "@/components/ui/card";
 import type { BlogStats } from "./useBlogData";
 
 interface BlogStatsCardsProps {
   stats: BlogStats;
 }
 
 export const BlogStatsCards = ({ stats }: BlogStatsCardsProps) => {
   const cards = [
     { label: "Total Posts", value: stats.total, icon: FileText, color: "text-blue-500" },
     { label: "Published", value: stats.published, icon: Send, color: "text-green-500" },
     { label: "Drafts", value: stats.drafts, icon: FilePen, color: "text-yellow-500" },
     { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-purple-500" },
   ];
 
   return (
     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
       {cards.map((card) => (
         <Card key={card.label}>
           <CardContent className="flex items-center gap-4 p-6">
             <div className={`p-3 rounded-full bg-muted ${card.color}`}>
               <card.icon className="h-5 w-5" />
             </div>
             <div>
               <p className="text-sm text-muted-foreground">{card.label}</p>
               <p className="text-2xl font-bold">{card.value}</p>
             </div>
           </CardContent>
         </Card>
       ))}
     </div>
   );
 };