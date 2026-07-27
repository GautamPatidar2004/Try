import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Camera, MessageSquare, Instagram, BarChart3 } from "lucide-react";
import InfluencerProfileSettings from "./InfluencerProfileSettings";
import InfluencerSocialAccounts from "./InfluencerSocialAccounts";
import InfluencerApplications from "./InfluencerApplications";
import { SocialAnalyticsDashboard } from "./analytics/SocialAnalyticsDashboard";
import { useSearchParams } from "react-router-dom";

interface InfluencerProfileProps {
  profile: any;
  onProfileUpdated: () => void;
}

const InfluencerProfile = ({ profile, onProfileUpdated }: InfluencerProfileProps) => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");

  // Update tab when URL changes (e.g., after OAuth callback)
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const getInitials = () => {
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.profile_photo_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-muted-foreground">{profile.location}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">Content Creator</Badge>
                {profile.influencers?.[0]?.content_niches?.map((niche: string) => (
                  <Badge key={niche} variant="outline">{niche}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Followers</div>
            <div className="text-2xl font-bold text-primary">
              {formatFollowers(profile.influencers?.[0]?.total_followers || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              {profile.influencers?.[0]?.engagement_rate || 0}% engagement
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-4 text-muted-foreground">{profile.bio}</p>
        )}
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center space-x-2">
            <Instagram className="w-4 h-4" />
            <span>Social Media</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Applications</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('social')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Instagram className="w-5 h-5" />
                  <span>Social Accounts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-muted-foreground">Connected accounts</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analytics')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatFollowers(profile.influencers?.[0]?.total_followers || 0)}
                </div>
                <p className="text-muted-foreground">Total reach</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('applications')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Applications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-muted-foreground">Submitted</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social">
          <InfluencerSocialAccounts influencerId={profile.id} onUpdated={onProfileUpdated} />
        </TabsContent>

        <TabsContent value="analytics">
          <SocialAnalyticsDashboard userId={profile.id} />
        </TabsContent>

        <TabsContent value="applications">
          <InfluencerApplications influencerId={profile.id} />
        </TabsContent>

        <TabsContent value="settings">
          <InfluencerProfileSettings profile={profile} onProfileUpdated={onProfileUpdated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerProfile;
