import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MediaKit {
  id: string;
  influencer_id: string;
  title: string;
  pdf_url: string;
  stats_snapshot: any;
  top_content: any;
  collaboration_examples: any;
  rate_card: any;
  bio: string;
  is_public: boolean;
  last_generated_at: string;
  created_at: string;
  updated_at: string;
  builder_config?: any;
}

// Extended config for the multi-step builder
export interface MediaKitConfig {
  bio: string;
  deliverables: string[];
  featuredPhotos?: string[];
  coverPhotoUrl?: string;
  profilePhotoUrl?: string;
  tagline?: string;
  location?: string;
  languages?: string[];
  specialties?: string[];
  services?: { platform: string; serviceType: string; price: string; description: string }[];
  brandCollabs?: { brandName: string; description: string }[];
}

export const useMediaKit = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaKits = [], isLoading, error, refetch } = useQuery({
    queryKey: ['mediaKits', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_kits')
        .select('*')
        .eq('influencer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaKit[];
    },
    enabled: !!userId,
  });

  const { mutateAsync: generateMediaKit, isPending: isGenerating } = useMutation({
    mutationFn: async (config: MediaKitConfig) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('generate-media-kit-pdf', {
        body: {
          influencerId: userId,
          bio: config.bio,
          deliverables: config.deliverables,
          featuredPhotos: config.featuredPhotos,
          coverPhotoUrl: config.coverPhotoUrl,
          profilePhotoUrl: config.profilePhotoUrl,
          tagline: config.tagline,
          location: config.location,
          languages: config.languages,
          specialties: config.specialties,
          services: config.services,
          brandCollabs: config.brandCollabs,
        },
        headers: session?.access_token 
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaKits', userId] });
      toast({
        title: 'Success!',
        description: 'Your media kit has been generated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate media kit',
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: updateMediaKit } = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MediaKit> }) => {
      const { data, error } = await supabase
        .from('media_kits')
        .update(updates)
        .eq('id', id)
        .eq('influencer_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaKits', userId] });
      toast({
        title: 'Updated',
        description: 'Media kit updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update media kit',
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: deleteMediaKit } = useMutation({
    mutationFn: async (id: string) => {
      const { data: mediaKit } = await supabase
        .from('media_kits')
        .select('pdf_url')
        .eq('id', id)
        .single();

      if (mediaKit?.pdf_url) {
        const urlParts = mediaKit.pdf_url.split('/media-kits/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('media-kits').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('media_kits')
        .delete()
        .eq('id', id)
        .eq('influencer_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaKits', userId] });
      toast({
        title: 'Deleted',
        description: 'Media kit deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete media kit',
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: togglePublic } = useMutation({
    mutationFn: async (id: string) => {
      const currentKit = mediaKits.find(kit => kit.id === id);
      if (!currentKit) throw new Error('Media kit not found');

      const { data, error } = await supabase
        .from('media_kits')
        .update({ is_public: !currentKit.is_public })
        .eq('id', id)
        .eq('influencer_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mediaKits', userId] });
      toast({
        title: data.is_public ? 'Made Public' : 'Made Private',
        description: data.is_public 
          ? 'Anyone with the link can now view this media kit.' 
          : 'This media kit is now private.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update visibility',
        variant: 'destructive',
      });
    },
  });

  return {
    mediaKits,
    isLoading,
    error,
    isGenerating,
    generateMediaKit,
    updateMediaKit,
    deleteMediaKit,
    togglePublic,
    refetch,
  };
};
