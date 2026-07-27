import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle ,} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Video, CheckCircle, Clock, FileText, ExternalLink,  AlertCircle, Heart, Eye, MessageCircle, Share2, Play, } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface BrandContentManagerProps {
  profile: any;
}

const BrandContentManager = ({ profile }: BrandContentManagerProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  // const { data: content, isLoading } = useQuery({
  //   queryKey: ['brand-content', profile?.id],
  //   queryFn: async () => {
  //     // Get all campaigns for this brand
  //     const { data: campaigns } = await supabase
  //       .from('brand_campaigns')
  //       .select('id, campaign_title')
  //       .eq('created_by', profile?.id);

  //     if (!campaigns || campaigns.length === 0) return [];

  //     const campaignIds = campaigns.map(c => c.id);

  //     // Get accepted applications to find collaborating creators
  //     const { data: acceptedApps } = await supabase
  //       .from('brand_campaign_applications')
  //       .select('influencer_id, campaign_id')
  //       .in('campaign_id', campaignIds)
  //       .eq('status', 'accepted');

  //     if (!acceptedApps || acceptedApps.length === 0) return [];

  //     const influencerIds = acceptedApps.map(a => a.influencer_id);

  //     // Get content posts from these creators
  //     const { data: posts, error } = await supabase
  //       .from('content_posts')
  //       .select('*')
  //       .in('influencer_id', influencerIds)
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;

  //     // Fetch profiles for creators
  //     const { data: profiles } = await supabase
  //       .from('profiles')
  //       .select('id, first_name, last_name, profile_photo_url')
  //       .in('id', influencerIds);

  //     return posts?.map(post => ({
  //       ...post,
  //       profile: profiles?.find(p => p.id === post.influencer_id),
  //       campaign_title: campaigns.find(c => {
  //         const app = acceptedApps.find(a => a.influencer_id === post.influencer_id);
  //         return app?.campaign_id === c.id;
  //       })?.campaign_title || 'Campaign'
  //     })) || [];
  //   },
  //   enabled: !!profile?.id,
  // });
  const { data: content, isLoading } = useQuery({
    queryKey: ["brand-content", profile?.id],
  
    queryFn: async () => {
  
      if (!profile?.id) return [];
  
  
      // 1. Get all campaigns created by this brand
      const { data: campaigns, error: campaignError } = await supabase
        .from("brand_campaigns")
        .select(`
          id,
          campaign_title
        `)
        .eq("created_by", profile.id);
  
  
      if (campaignError) throw campaignError;
  
      if (!campaigns?.length) return [];
  
  
      const campaignIds = campaigns.map(
        campaign => campaign.id
      );
  
 
      // 2. Get applications for those campaigns
      const { data: applications, error: appError } = await supabase
        .from("brand_campaign_applications")
        .select(`
          id,
          campaign_id,
          influencer_id,
          status
        `)
        .in("campaign_id", campaignIds);
  
  
      if (appError) throw appError;
  
      if (!applications?.length) return [];
 
      // 3. Get content using brand_campaign_application_id
      const applicationIds = applications
      .filter(a => a.status === "accepted")
      .map(a => a.id);
      const { data } = await supabase
      .from("content_posts")
      .select("*");
    
    
    
    const { data: posts, error } = await ( supabase  as any)
    .from("content_posts")
    .select("*")
    .in("brand_campaign_application_id", applicationIds)
    .order("created_at", { ascending: false });
  
 
  if (error) throw error;
  
  
  
      if (!posts?.length) return [];
  
  
  
      // 4. Get influencer profiles
      const influencerIds = [
        ...new Set(
          applications.map(
            app => app.influencer_id
          )
        )
      ];
  
  
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          profile_photo_url
        `)
        .in(
          "id",
          influencerIds
        );
  
  
      if (profileError) throw profileError;
  
  
  
      // 5. Merge campaign + application + profile + post
      const formattedContent = posts.map(post => {
  
  
        const application = applications.find(
          app =>
            app.id === post.brand_campaign_application_id
        );
  
  
        const campaign = campaigns.find(
          campaign =>
            campaign.id === application?.campaign_id
        );
  
  
        const creatorProfile = profiles?.find(
          profile =>
            profile.id === application?.influencer_id
        );
  
  
  
        return {
          ...post,
  
          campaign_title:
            campaign?.campaign_title || "Campaign",
  
  
          campaign_id:
            campaign?.id,
  
  
          application_id:
            application?.id,
  
  
          application_status:
            application?.status,
  
  
          influencer_id:
            application?.influencer_id,
  
  
          profile:
            creatorProfile
        };
  
      });
  
  
  
      return formattedContent;
  
    },
  
  
    enabled: !!profile?.id,
  });

  const filteredContent = content?.filter(item => {

    if (activeTab === "all") {
      return true;
    }
  
  
    if (activeTab === "pending") {
  
      return (
        item.host_approval_status === "pending"
      );
  
    }
  
  
    if (activeTab === "approved") {
  
      return (
        item.host_approval_status === "approved"
      );
  
    }
  
  
    return true;
  
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  const handleApprove = async (postId: string) => {
    const { error } = await supabase
      .from("content_posts")
      .update({
        host_approval_status: "approved",
      })
      .eq("id", postId);
  
    if (error) {
      console.error("Approval failed:", error);
      return;
    }
  
  
  };
  const getStatusBadge = () => {
   
    switch (content[0].host_approval_status) {
      case "approved":
        return (
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "revision_requested":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-3 w-3 mr-1" />
            Revision Requested
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-accent-foreground border-accent bg-accent/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Management</h2>
        <p className="text-muted-foreground">Review and manage creator content submissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-muted-foreground text-center">
                  Content from your creator collaborations will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => (
                <Card key={item.id} className="overflow-hidden group cursor-pointer"
  onClick={() => setSelectedItem(item)} >
                  <div className="relative aspect-square bg-muted">
                  {item.media_url ? (
      item.media_type === 'video' ? (
        <div className="w-full h-full">
          <video
            src={item.media_url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors pointer-events-none">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      ) : (
        <img 
          src={item.media_url} 
          alt={item.caption || 'Content'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      )
    ) : (
      <div className="absolute inset-0 flex items-center justify-center">
        <Image className="w-12 h-12 text-muted-foreground" />
      </div>
    )}
                             {/* ✅ Metrics Overlay - content → item fix kiya */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{item.likes_count || 0}</span>  {/* ✅ item */}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{item.views_count || 0}</span>  {/* ✅ item */}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{item.comments_count || 0}</span>  {/* ✅ item */}
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>{item.shares_count || 0}</span>  {/* ✅ item */}
          </div>
        </div>
      </div>
    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {item.host_approval_status === 'approved' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {item.profile?.first_name} {item.profile?.last_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.media_type}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.caption || 'No caption'}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.likes_count || 0} likes</span>
                        <span>•</span>
                        <span>{item.views_count || 0} views</span>
                      </div>
                         {/* Status & Date */}
           <div className="flex items-center justify-between">
             {getStatusBadge()}
             {/* <span className="text-xs text-muted-foreground">
               {format(new Date(content.created_at), "MMM d, yyyy")}
             </span> */}
            </div>  
                      <div className="flex gap-2 mt-3">
                        {item.host_approval_status !== 'approved' && (
                          <Button size="sm" className="flex-1"
                          onClick={(e) =>  { e.stopPropagation();  handleApprove(item.id)
                          }
                          }>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {item.media_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.media_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* Preview Dialog */}
{selectedItem && (
  <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {selectedItem.campaign_title}
          <span className="text-muted-foreground font-normal">
            by {selectedItem.profile?.first_name} {selectedItem.profile?.last_name}
          </span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Media */}
        <div className="rounded-lg overflow-hidden bg-muted">
          {selectedItem.media_type === 'video' ? (
            <video
              src={selectedItem.media_url}
              controls
              autoPlay
              className="w-full max-h-[60vh] object-contain"
            />
          ) : (
            <img
              src={selectedItem.media_url}
              alt={selectedItem.caption || "Content"}
              className="w-full max-h-[60vh] object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {selectedItem.caption && (
          <div>
            <p className="text-sm font-medium mb-1">Caption</p>
            <p className="text-sm text-muted-foreground">{selectedItem.caption}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span>{selectedItem.likes_count || 0} likes</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>{selectedItem.views_count || 0} views</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <span>{selectedItem.comments_count || 0} comments</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4 text-purple-500" />
            <span>{selectedItem.shares_count || 0} shares</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {selectedItem.host_approval_status !== "approved" && (
            <Button onClick={() => {
              handleApprove(selectedItem.id);
              setSelectedItem(null);
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Content
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(selectedItem.media_url, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Original
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}
    </div>
  );
};

export default BrandContentManager;