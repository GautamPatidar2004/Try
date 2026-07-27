import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface BrandCampaignApplicationModalProps {
  campaignTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => void;
  isSubmitting?: boolean;
}

export interface ApplicationFormData {
  cover_letter: string;
  proposed_content_ideas: string;
  portfolio_urls: string[];
  previous_brand_work: string[];
  agreed_to_terms: boolean;
}

export const BrandCampaignApplicationModal = ({
  campaignTitle,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: BrandCampaignApplicationModalProps) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_letter: '',
    proposed_content_ideas: '',
    portfolio_urls: [''],
    previous_brand_work: [''],
    agreed_to_terms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty URLs
    const cleanedData = {
      ...formData,
      portfolio_urls: formData.portfolio_urls.filter(url => url.trim()),
      previous_brand_work: formData.previous_brand_work.filter(work => work.trim()),
    };
    
    onSubmit(cleanedData);
  };

  const addPortfolioUrl = () => {
    setFormData({
      ...formData,
      portfolio_urls: [...formData.portfolio_urls, ''],
    });
  };

  const removePortfolioUrl = (index: number) => {
    setFormData({
      ...formData,
      portfolio_urls: formData.portfolio_urls.filter((_, i) => i !== index),
    });
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    const updated = [...formData.portfolio_urls];
    updated[index] = value;
    setFormData({ ...formData, portfolio_urls: updated });
  };

  const addBrandWork = () => {
    setFormData({
      ...formData,
      previous_brand_work: [...formData.previous_brand_work, ''],
    });
  };

  const removeBrandWork = (index: number) => {
    setFormData({
      ...formData,
      previous_brand_work: formData.previous_brand_work.filter((_, i) => i !== index),
    });
  };

  const updateBrandWork = (index: number, value: string) => {
    const updated = [...formData.previous_brand_work];
    updated[index] = value;
    setFormData({ ...formData, previous_brand_work: updated });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply to Campaign</DialogTitle>
          <p className="text-muted-foreground">{campaignTitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="cover_letter">
              Cover Letter <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cover_letter"
              placeholder="Tell the brand why you're a great fit for this campaign..."
              value={formData.cover_letter}
              onChange={(e) =>
                setFormData({ ...formData, cover_letter: e.target.value })
              }
              required
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Explain your unique value and why you're excited about this collaboration
            </p>
          </div>

          {/* Content Ideas */}
          <div className="space-y-2">
            <Label htmlFor="content_ideas">
              Proposed Content Ideas <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content_ideas"
              placeholder="Share your creative vision and content concepts..."
              value={formData.proposed_content_ideas}
              onChange={(e) =>
                setFormData({ ...formData, proposed_content_ideas: e.target.value })
              }
              required
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Outline specific content ideas that align with the campaign goals
            </p>
          </div>

          {/* Portfolio URLs */}
          <div className="space-y-2">
            <Label>Portfolio Links</Label>
            {formData.portfolio_urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://instagram.com/post/..."
                  value={url}
                  onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                />
                {formData.portfolio_urls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePortfolioUrl(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPortfolioUrl}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Link
            </Button>
          </div>

          {/* Previous Brand Work */}
          <div className="space-y-2">
            <Label>Previous Brand Collaborations</Label>
            {formData.previous_brand_work.map((work, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="e.g., Nike - Campaign 2023"
                  value={work}
                  onChange={(e) => updateBrandWork(index, e.target.value)}
                />
                {formData.previous_brand_work.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBrandWork(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBrandWork}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand Work
            </Button>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreed_to_terms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, agreed_to_terms: checked as boolean })
              }
              required
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the campaign terms and conditions
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.agreed_to_terms}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
