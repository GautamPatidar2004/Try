import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HeroProfileStepProps {
  data: {
    name: string;
    tagline: string;
    coverPhotoUrl: string;
    profilePhotoUrl: string;
  };
  onChange: (data: Partial<HeroProfileStepProps['data']>) => void;
  userId: string;
}

export const HeroProfileStep = ({ data, onChange, userId }: HeroProfileStepProps) => {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, type: 'cover' | 'profile') => {
    const setter = type === 'cover' ? setUploadingCover : setUploadingProfile;
    setter(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${type}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media-kits').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media-kits').getPublicUrl(path);
      onChange({ [type === 'cover' ? 'coverPhotoUrl' : 'profilePhotoUrl']: urlData.publicUrl });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setter(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Hero & Profile</h3>
        <p className="text-sm text-muted-foreground">Set up your cover image, profile photo, and professional title.</p>
      </div>

      {/* Cover Photo */}
      <div className="space-y-2">
        <Label>Cover Photo</Label>
        {data.coverPhotoUrl ? (
          <div className="relative rounded-lg overflow-hidden h-40">
            <img src={data.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => onChange({ coverPhotoUrl: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{uploadingCover ? 'Uploading...' : 'Click to upload cover photo'}</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'cover')} disabled={uploadingCover} />
          </label>
        )}
      </div>

      {/* Profile Photo */}
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          {data.profilePhotoUrl ? (
            <div className="relative">
              <img src={data.profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-1 -right-1 h-6 w-6"
                onClick={() => onChange({ profilePhotoUrl: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
              <User className="h-8 w-8 text-muted-foreground" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'profile')} disabled={uploadingProfile} />
            </label>
          )}
          <div className="text-sm text-muted-foreground">
            {uploadingProfile ? 'Uploading...' : 'Upload a professional headshot'}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="mk-name">Display Name</Label>
        <Input id="mk-name" value={data.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Your full name" />
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="mk-tagline">Professional Title / Tagline</Label>
        <Input id="mk-tagline" value={data.tagline} onChange={(e) => onChange({ tagline: e.target.value })} placeholder="e.g. Travel & Lifestyle Content Creator" />
      </div>
    </div>
  );
};
