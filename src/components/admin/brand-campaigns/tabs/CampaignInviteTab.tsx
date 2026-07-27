import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Send, Loader2, UserPlus, CheckCircle } from "lucide-react";

interface CampaignInviteTabProps {
  campaignId: string;
}

export const CampaignInviteTab = ({ campaignId }: CampaignInviteTabProps) => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch existing applications to know who's already invited/applied
  const { data: existingApps } = useQuery({
    queryKey: ["campaign-applications-ids", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_campaign_applications")
        .select("influencer_id, status")
        .eq("campaign_id", campaignId);
      if (error) throw error;
      return data;
    },
  });

  const existingMap = new Map(existingApps?.map(a => [a.influencer_id, a.status]) || []);

  // Search creators
  const { data: creators, isLoading: searching, isError, error: searchError } = useQuery({
    queryKey: ["admin-search-creators", search],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select(`
          id,
          total_followers,
          engagement_rate,
          content_niches,
          profiles (
            first_name,
            last_name,
            username,
            profile_photo_url
          )
        `)
        .limit(50);
      if (error) throw error;

      if (!search.trim()) return data;

      // Client-side filter for joined profile fields
      const q = search.toLowerCase();
      return data.filter(c => {
        const p = c.profiles as any;
        return (
          p?.first_name?.toLowerCase().includes(q) ||
          p?.last_name?.toLowerCase().includes(q) ||
          p?.username?.toLowerCase().includes(q) ||
          (c.content_niches as string[])?.some(n => n.toLowerCase().includes(q))
        );
      });
    },
    enabled: true,
  });

  const inviteMutation = useMutation({
    mutationFn: async (influencerId: string) => {
      const { error } = await supabase
        .from("brand_campaign_applications")
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: "invited",
        });
      if (error) throw error;

      // Fire-and-forget: send in-app notification + email
      supabase.functions
        .invoke("send-campaign-invitation", {
          body: { influencerId, campaignId },
        })
        .then(({ error: fnError }) => {
          if (fnError) console.warn("Campaign invitation notification failed:", fnError);
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-applications-ids", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-applications", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["admin-brand-campaigns"] });
      toast({ title: "Invitation sent" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search creators by name, username, or niche..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {searching ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive text-sm font-medium">Failed to load creators</p>
            <p className="text-muted-foreground text-xs mt-1">{searchError?.message}</p>
          </CardContent>
        </Card>
      ) : creators && creators.length > 0 ? (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {creators.map(creator => {
            const profile = creator.profiles as any;
            const existingStatus = existingMap.get(creator.id);
            const alreadyInvolved = !!existingStatus;

            return (
              <Card key={creator.id} className={alreadyInvolved ? "opacity-60" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.profile_photo_url} />
                    <AvatarFallback className="text-xs">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {profile?.username && <span>@{profile.username}</span>}
                      <span>{creator.total_followers?.toLocaleString() || 0} followers</span>
                      {creator.engagement_rate && <span>{creator.engagement_rate}% ER</span>}
                    </div>
                    {(creator.content_niches as string[])?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(creator.content_niches as string[]).slice(0, 3).map(n => (
                          <Badge key={n} variant="secondary" className="text-[10px] px-1.5 py-0">{n}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {alreadyInvolved ? (
                    <Badge variant="outline" className="text-xs capitalize gap-1 shrink-0">
                      <CheckCircle className="h-3 w-3" /> {existingStatus}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs h-8"
                      disabled={inviteMutation.isPending}
                      onClick={() => inviteMutation.mutate(creator.id)}
                    >
                      <Send className="h-3 w-3 mr-1" /> Invite
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "No creators found" : "Search for creators to invite"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
