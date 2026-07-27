 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export interface HostContent {
   id: string;
   media_url: string;
   media_type: string;
   caption: string | null;
   hashtags: string[] | null;
   host_approval_status: string | null;
   delivery_status: string | null;
   created_at: string;
   property_title: string;
   property_id: string;
   creator_name: string;
   creator_id: string;
   creator_avatar: string | null;
   likes_count: number;
   views_count: number;
   comments_count: number;
   shares_count: number;
   social_post_url: string | null;
   social_platform: string | null;
 }
 
 export const useHostContent = (hostId: string | undefined) => {
   const [content, setContent] = useState<HostContent[]>([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState<"all" | "pending" | "approved" | "revision_requested">("all");
 
   const fetchContent = async () => {
     if (!hostId) return;
 
     try {
       setLoading(true);
 
       // First get the host's properties
       const { data: properties, error: propsError } = await supabase
         .from("properties")
         .select("id, title")
         .eq("host_id", hostId);
 
       if (propsError) throw propsError;
       if (!properties || properties.length === 0) {
         setContent([]);
         return;
       }
 
       const propertyIds = properties.map((p) => p.id);
       const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p.title]));
 
       // Get applications for these properties
       const { data: applications, error: appsError } = await supabase
         .from("applications")
         .select("id, property_id, influencer_id")
         .in("property_id", propertyIds);
 
       if (appsError) throw appsError;
       if (!applications || applications.length === 0) {
         setContent([]);
         return;
       }
 
       const applicationIds = applications.map((a) => a.id);
       const appMap = Object.fromEntries(
         applications.map((a) => [a.id, { property_id: a.property_id, influencer_id: a.influencer_id }])
       );
 
       // Get content posts linked to these applications
       const { data: contentPosts, error: contentError } = await supabase
         .from("content_posts")
         .select("*")
         .in("application_id", applicationIds)
         .order("created_at", { ascending: false });
 
       if (contentError) throw contentError;
       if (!contentPosts || contentPosts.length === 0) {
         setContent([]);
         return;
       }
 
       // Get creator profiles
       const creatorIds = [...new Set(contentPosts.map((c) => c.influencer_id))];
       const { data: profiles, error: profilesError } = await supabase
         .from("profiles")
         .select("id, first_name, last_name")
         .in("id", creatorIds);
 
       if (profilesError) throw profilesError;
 
       const profileMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = Object.fromEntries(
         (profiles || []).map((p) => [p.id, { id: p.id, first_name: p.first_name, last_name: p.last_name }])
       );
 
       // Combine all data
       const enrichedContent: HostContent[] = contentPosts.map((post) => {
         const appInfo = appMap[post.application_id || ""];
         const profile = profileMap[post.influencer_id];
         return {
           id: post.id,
           media_url: post.media_url,
           media_type: post.media_type,
           caption: post.caption,
           hashtags: post.hashtags,
           host_approval_status: post.host_approval_status,
           delivery_status: post.delivery_status,
           created_at: post.created_at,
           property_title: appInfo ? propertyMap[appInfo.property_id] || "Unknown Property" : "Unknown Property",
           property_id: appInfo?.property_id || "",
           creator_name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown Creator" : "Unknown Creator",
           creator_id: post.influencer_id,
           creator_avatar: null,
           likes_count: post.likes_count || 0,
           views_count: post.views_count || 0,
           comments_count: post.comments_count || 0,
           shares_count: post.shares_count || 0,
           social_post_url: post.social_post_url || null,
           social_platform: post.social_platform || null,
         };
       });
 
       setContent(enrichedContent);
     } catch (error) {
       console.error("Error fetching host content:", error);
       toast.error("Failed to load content");
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     fetchContent();
   }, [hostId]);
 
   const filteredContent = filter === "all" 
     ? content 
     : content.filter((c) => c.host_approval_status === filter);
 
   const approveContent = async (contentId: string) => {
     try {
       const { error } = await supabase
         .from("content_posts")
         .update({
           host_approval_status: "approved",
           delivery_status: "published",
         })
         .eq("id", contentId);
 
       if (error) throw error;
       toast.success("Content approved!");
       fetchContent();
     } catch (error) {
       console.error("Error approving content:", error);
       toast.error("Failed to approve content");
     }
   };
 
   const requestRevision = async (contentId: string) => {
     try {
       const { error } = await supabase
         .from("content_posts")
         .update({
           host_approval_status: "revision_requested",
         })
         .eq("id", contentId);
 
       if (error) throw error;
       toast.success("Revision requested");
       fetchContent();
     } catch (error) {
       console.error("Error requesting revision:", error);
       toast.error("Failed to request revision");
     }
   };
 
   const pendingCount = content.filter((c) => c.host_approval_status === "pending").length;
 
   return {
     content: filteredContent,
     allContent: content,
     loading,
     filter,
     setFilter,
     approveContent,
     requestRevision,
     pendingCount,
     refetch: fetchContent,
   };
 };