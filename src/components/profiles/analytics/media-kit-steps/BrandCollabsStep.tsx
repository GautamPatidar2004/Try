import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Building2 } from 'lucide-react';
import { useState } from 'react';

export interface BrandCollab {
  brandName: string;
  description: string;
}

interface BrandCollabsStepProps {
  collabs: BrandCollab[];
  onChange: (collabs: BrandCollab[]) => void;
}

export const BrandCollabsStep = ({ collabs, onChange }: BrandCollabsStepProps) => {
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');

  const addCollab = () => {
    if (brandName.trim()) {
      onChange([...collabs, { brandName: brandName.trim(), description: description.trim() }]);
      setBrandName('');
      setDescription('');
    }
  };

  const removeCollab = (index: number) => {
    onChange(collabs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Brand Collaborations</h3>
        <p className="text-sm text-muted-foreground">Showcase past brand partnerships to build credibility.</p>
      </div>

      {collabs.length > 0 && (
        <div className="space-y-2">
          {collabs.map((collab, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg group">
              <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{collab.brandName}</p>
                {collab.description && <p className="text-xs text-muted-foreground truncate">{collab.description}</p>}
              </div>
              <button
                onClick={() => removeCollab(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 p-4 border border-border rounded-lg">
        <div className="space-y-1">
          <Label className="text-xs">Brand Name</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Airbnb, Nike..." />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description (optional)</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Sponsored Instagram campaign" />
        </div>
        <Button variant="outline" onClick={addCollab} disabled={!brandName.trim()} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>
    </div>
  );
};
