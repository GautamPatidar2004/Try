import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortfolioStepProps {
  portfolioUrls: string[];
  onChange: (urls: string[]) => void;
  userId: string;
}

export const PortfolioStep = ({ portfolioUrls, onChange, userId }: PortfolioStepProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/portfolio-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('media-kits').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('media-kits').getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
      onChange([...portfolioUrls, ...newUrls]);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(portfolioUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Portfolio</h3>
        <p className="text-sm text-muted-foreground">Showcase your best content samples to brands.</p>
      </div>

      {portfolioUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portfolioUrls.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
        <span className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB each</span>
        <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => e.target.files && uploadFiles(e.target.files)} disabled={uploading} />
      </label>
    </div>
  );
};
