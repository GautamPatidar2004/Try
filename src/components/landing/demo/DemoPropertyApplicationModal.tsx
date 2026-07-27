import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface Props {
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const DemoPropertyApplicationModal = ({ propertyTitle, isOpen, onClose, onSubmit }: Props) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [contentIdeas, setContentIdeas] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply to Stay</DialogTitle>
          <p className="text-muted-foreground">{propertyTitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cover_letter">
              Cover Letter <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cover_letter"
              placeholder="Tell the host why you'd be a great guest and creator..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Preferred Start Date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Preferred End Date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ideas">
              Proposed Content Ideas <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="ideas"
              placeholder="Reels, photo set, blog post, story takeover..."
              value={contentIdeas}
              onChange={(e) => setContentIdeas(e.target.value)}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the collaboration terms
            </Label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!agreed} className="flex-1">
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
