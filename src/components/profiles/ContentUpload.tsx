
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Video, Calendar, Hash, AtSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentUploadProps {
  influencerId: string;
  applications: any[];
}
type CollabType = "brand" | "host" | "";
const ContentUpload = ({ influencerId, applications }: ContentUploadProps) => {
  const [collabType, setCollabType] = useState<CollabType>("");
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mentions, setMentions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [socialUrl, setSocialUrl] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
const [selectedCampaign, setSelectedCampaign] = useState("");
  const { toast } = useToast();
  

  // // Filter approved applications that need content delivery
  // const approvedApplications = applications.filter(
  //   app => app.status === 'approved' && app.content_delivery_status !== 'delivered'
  // );
  const approvedApplications = applications.filter((app) => {
   
    if (app.applicationType === "brand") {
      return( app.status === "accepted" &&
       app.content_delivery_status !== "delivered"
      )
    }

    return (
      app.status === "approved" &&
      app.content_delivery_status !== "delivered"
    );
  });
  
  // Brand applications: from brand_campaign_applications (applicationType === "brand")
  const brandApplications = applications.filter(
    (app) =>
      app.applicationType === "brand" &&
      app.status === "accepted" &&
      app.content_delivery_status !== "delivered"
  );
  // Host applications: from applications table (no applicationType === "brand")
  const hostApplications = applications.filter(
    (app) =>
      app.applicationType !== "brand" &&
      app.status === "approved" &&
      app.status === "approved" &&
      app.content_delivery_status !== "delivered"
    
    );
    const pendingApplications =
    collabType === "brand"
      ? brandApplications
      : collabType === "host"
      ? hostApplications
      : [];

  // All pending for the bottom summary list
  const allPending = [...brandApplications, ...hostApplications];
  const handleCollabTypeChange = (type: CollabType) => {
    setCollabType(type);
    setSelectedApplication("");
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const client = supabase as any;
  const detectPlatform = (url: string) => {
    if (url.includes("instagram")) return "instagram";
    if (url.includes("tiktok")) return "tiktok";
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    if (url.includes("twitter") || url.includes("x.com")) return "twitter";
    return null;
  };

  const isValidSocialUrl = (url: string) =>
    ["instagram.com", "tiktok.com", "youtube.com", "youtu.be", "twitter.com", "x.com"].some(
      (d) => url.includes(d)
    );

  // ── Upload handler ─────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile || !selectedApplication || !socialUrl || !collabType) {
      toast({
        title: "Missing Information",
        description: "Please select a collaboration type, a collaboration, upload media, and add a social media URL.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidSocialUrl(socialUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Instagram, TikTok, YouTube, or Twitter/X URL.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const detectedPlatform = detectPlatform(socialUrl);
      const fileName = `stays/${Date.now()}-${selectedFile.name}`;
      const mediaType = selectedFile.type.startsWith("video/") ? "video" : "image";
      const deliveredAt = new Date().toISOString();

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("collaboration-content")
        .upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("collaboration-content")
        .getPublicUrl(fileName);
      const mediaUrl = publicData.publicUrl;

      if (collabType === "brand") {
        // ── Brand flow ──
        // selectedApplication = brand_campaign_applications.id
        const brandApp = brandApplications.find((a) => a.id === selectedApplication);
        if (!brandApp) throw new Error("Brand application not found");

        // Insert content post
        const { data: newPost,error: postError } = await client.from("content_posts").insert({
          influencer_id: influencerId,
    
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption || null,
          hashtags: hashtags
            ? hashtags.split(" ").filter((t: string) => t.startsWith("#"))
            : null,
          mentions: mentions
            ? mentions.split(" ").filter((m: string) => m.startsWith("@"))
            : null,
          delivery_status: "submitted",
          host_approval_status: "pending",
          social_post_url: socialUrl,
          social_platform: detectedPlatform,
          campaign_id: brandApp.campaign_id,
          brand_campaign_application_id: selectedApplication,
        })
        .select() 
       .single()
        if (postError) throw postError;
        if (socialUrl && newPost) {
          await supabase.functions.invoke("sync-post-analytics", {
            body: {
              postId: newPost.id,
              userId: influencerId,
              postUrl: socialUrl,
            },
          });
        }
        // Update brand_campaign_applications
        const { error: brandUpdateError } = await client
          .from("brand_campaign_applications")
          .update({
            content_delivery_status: "delivered",
            delivered_at: deliveredAt,
          })
          .eq("id", selectedApplication);
        if (brandUpdateError) throw brandUpdateError;

      } else {
        // ── Host flow ──
        // selectedApplication = applications.id
        const { data: appRow, error: appFetchError } = await supabase
          .from("applications")
          .select("property_id")
          .eq("id", selectedApplication)
          .single();
        if (appFetchError) throw appFetchError;

        // Insert content post
        const { data: newPost,error: postError } = await supabase.from("content_posts").insert({
          influencer_id: influencerId,
          application_id: selectedApplication,   // applications.id
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption || null,
          hashtags: hashtags
            ? hashtags.split(" ").filter((t: string) => t.startsWith("#"))
            : null,
          mentions: mentions
            ? mentions.split(" ").filter((m: string) => m.startsWith("@"))
            : null,
          delivery_status: "submitted",
          host_approval_status: "pending",
          social_post_url: socialUrl,
          social_platform: detectedPlatform,
          property_id: appRow?.property_id,
        })
        .select()  
       .single()
        if (postError) throw postError;
        if (socialUrl && newPost) {
          await supabase.functions.invoke("sync-post-analytics", {
            body: {
              postId: newPost.id,
              userId: influencerId,
              postUrl: socialUrl,
            },
          });
        }
        // Update applications
        const { error: appUpdateError } = await supabase
          .from("applications")
          .update({
            content_delivery_status: "delivered",
            delivered_at: deliveredAt,
          })
          .eq("id", selectedApplication);
        if (appUpdateError) throw appUpdateError;
      }

      toast({
        title: "Content Uploaded Successfully",
        description: "Your content has been submitted for approval.",
      });

      // Reset form
      setCollabType("");
      setSelectedApplication("");
      setSelectedFile(null);
      setCaption("");
      setHashtags("");
      setMentions("");
      setSocialUrl("");
    } catch (error) {
      console.error("Error uploading content:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'revision_requested':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-muted text-foreground';
    }
  };
  const getAppLabel = (app: any) => {
    if (app.applicationType === "brand") {
      return {
        title: app.campaign?.campaign_title ?? app.properties?.title ?? "Brand Campaign",
        subtitle: app.campaign?.brand_name ?? app.properties?.location ?? "",
      };
    }
    return {
      title: app.properties?.title ?? "Property",
      subtitle: app.properties?.location ?? "",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Content Delivery</h2>
        <Badge variant="outline" className="text-sm">
          {allPending.length} pending deliveries
        </Badge>
      </div>

      {allPending.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Content Deliveries Pending</h3>
            <p className="text-muted-foreground">You don't have any approved collaborations requiring content delivery at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Content Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Step 1 — Collaboration Type */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Collaboration Type
                </label>
                <select
                  value={collabType}
                  onChange={(e) => handleCollabTypeChange(e.target.value as CollabType)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  <option value="brand">Brand Campaign</option>
                  <option value="host">Property / Host Collaboration</option>
                </select>
              </div>

              {/* Step 2 — Specific Collaboration (filtered by type) */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Select Collaboration
                </label>
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  disabled={!collabType}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!collabType
                      ? "Select a collaboration type first..."
                      : collabType === "brand"
                      ? "Choose a brand campaign..."
                      : "Choose a property collaboration..."}
                  </option>

                  {collabType === "brand" &&
                    brandApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.campaign?.campaign_title ?? app.properties?.title} —{" "}
                        {app.campaign?.brand_name ?? app.properties?.location}
                      </option>
                    ))}

                  {collabType === "host" &&
                    hostApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.properties?.title} — {app.properties?.location}
                      </option>
                    ))}
                </select>
              </div>
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Upload Media
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-brand-green transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        {selectedFile.type.startsWith('video/') ? (
                          <Video className="w-8 h-8 text-brand-green" />
                        ) : (
                          <Image className="w-8 h-8 text-brand-green" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {selectedFile.name}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, MP4 up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                       Post URL
                </label>

                     <Input
                          value={socialUrl}
                          onChange={(e) => setSocialUrl(e.target.value)}
                         placeholder="https://instagram.com/reel/..."
                     />
                </div>
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Caption
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your caption here..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Hashtags and Mentions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-foreground/80 mb-2">
                    <Hash className="w-4 h-4" />
                    <span>Hashtags</span>
                  </label>
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#travel #luxury #vacation"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-foreground/80 mb-2">
                    <AtSign className="w-4 h-4" />
                    <span>Mentions</span>
                  </label>
                  <Input
                    value={mentions}
                    onChange={(e) => setMentions(e.target.value)}
                    placeholder="@property @host"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedApplication ||!collabType || uploading}
                className="w-full bg-brand-green hover:bg-brand-green/90"
              >
                {uploading ? "Uploading..." : "Submit Content"}
              </Button>
            </CardContent>
          </Card>

          {/* Pending Deliveries */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Pending Deliveries</h3>
            {allPending.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {app.properties?.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {app.properties?.location}
                      </p>
                      {app.content_deadline && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(app.content_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(app.content_delivery_status)}
                      <Badge className={getStatusColor(app.content_delivery_status)}>
                        {app.content_delivery_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContentUpload;
