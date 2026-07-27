import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram } from "lucide-react";
import { useMonthlyRequirements } from "@/hooks/useMonthlyRequirements";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const MonthlyRequirementsWidget = () => {
  const { progress, submitContent, submitting } = useMonthlyRequirements();
  const [contentUrl, setContentUrl] = useState("");
  const [contentType, setContentType] = useState<'story' | 'post'>('story');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!contentUrl) return;
    submitContent({ type: contentType, url: contentUrl });
    setContentUrl("");
    setOpen(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Monthly Requirements
        </h3>
        {progress.isComplete && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            Complete ✓
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Instagram Stories</span>
            <span className="font-medium">{progress.stories} / {progress.storiesTarget}</span>
          </div>
          <Progress value={(progress.stories / progress.storiesTarget) * 100} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Feed Posts</span>
            <span className="font-medium">{progress.posts} / {progress.postsTarget}</span>
          </div>
          <Progress value={(progress.posts / progress.postsTarget) * 100} />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Submit Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Content</DialogTitle>
              <DialogDescription>
                Enter the URL of your Instagram story or post
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as 'story' | 'post')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="story" id="story" />
                    <Label htmlFor="story">Instagram Story</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="post" id="post" />
                    <Label htmlFor="post">Feed Post</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Content URL</Label>
                <Input
                  id="url"
                  placeholder="https://instagram.com/..."
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} disabled={submitting || !contentUrl} className="w-full">
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-xs text-muted-foreground">
          Requirements reset on the 1st of each month
        </p>
      </div>
    </Card>
  );
};
