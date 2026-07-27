import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import { MediaKitConfig } from '@/hooks/useMediaKit';

interface MediaKitConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: MediaKitConfig) => Promise<void>;
  isGenerating: boolean;
  defaultBio?: string;
}

const DEFAULT_DELIVERABLES = [
  '2–3 vertical short-form videos (walkthrough, amenities, lifestyle POV)',
  '5–8 short clips or photos for listing use',
  '3–6 Instagram stories tagging the property',
  'Content usage rights for organic reposting',
];

export const MediaKitConfigDialog = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  defaultBio,
}: MediaKitConfigDialogProps) => {
  const [bio, setBio] = useState(defaultBio || '');
  const [deliverables, setDeliverables] = useState<string[]>(DEFAULT_DELIVERABLES);
  const [newDeliverable, setNewDeliverable] = useState('');

  const handleGenerate = async () => {
    await onGenerate({
      bio,
      deliverables: deliverables.filter(d => d.trim() !== ''),
    });
    onOpenChange(false);
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDeliverable();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Your Media Kit</DialogTitle>
          <DialogDescription>
            Customize the content of your standardized media kit. Your stats and profile info will be pulled automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* About Me Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">About Me</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="Write a short bio that will appear in your media kit..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/300 characters
            </p>
          </div>

          {/* Deliverables Section */}
          <div className="space-y-3">
            <Label>Your Deliverables</Label>
            <p className="text-sm text-muted-foreground">
              List the content you typically provide for collaborations
            </p>
            
            <div className="space-y-2">
              {deliverables.map((deliverable, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted rounded-lg group"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span className="flex-1 text-sm">{deliverable}</span>
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a deliverable..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addDeliverable}
                disabled={!newDeliverable.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What's included automatically:</p>
            <ul className="space-y-1">
              <li>• Your profile photo and name</li>
              <li>• Instagram follower count and engagement rate</li>
              <li>• Reach and impression metrics (if connected)</li>
              <li>• Your social media handles</li>
            </ul>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || deliverables.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate Media Kit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
