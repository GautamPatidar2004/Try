import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, AtSign } from "lucide-react";
import { CreatorPost } from "@/hooks/useCreatorPosts";

interface EditPostModalProps {
  post: CreatorPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (postId: string, updates: Partial<CreatorPost>) => void;
}

const EditPostModal = ({ post, open, onOpenChange, onSave }: EditPostModalProps) => {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mentions, setMentions] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setHashtags(post.hashtags?.join(" ") || "");
      setMentions(post.mentions?.join(" ") || "");
    }
  }, [post]);

  const handleSave = async () => {
    if (!post) return;

    setSaving(true);
    try {
      const updates: Partial<CreatorPost> = {
        caption: caption || null,
        hashtags: hashtags 
          ? hashtags.split(" ").filter(tag => tag.startsWith("#"))
          : null,
        mentions: mentions
          ? mentions.split(" ").filter(mention => mention.startsWith("@"))
          : null,
      };

      await onSave(post.id, updates);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!post) return null;

  const canEdit = post.delivery_status === 'draft' || post.host_approval_status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        {!canEdit ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Published posts cannot be edited. Create a new post instead.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Caption */}
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here..."
                rows={4}
                className="resize-none mt-1"
              />
            </div>

            {/* Hashtags */}
            <div>
              <Label htmlFor="hashtags" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Hashtags
              </Label>
              <Input
                id="hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#travel #luxury #vacation"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate hashtags with spaces. Must start with #
              </p>
            </div>

            {/* Mentions */}
            <div>
              <Label htmlFor="mentions" className="flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Mentions
              </Label>
              <Input
                id="mentions"
                value={mentions}
                onChange={(e) => setMentions(e.target.value)}
                placeholder="@property @host"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate mentions with spaces. Must start with @
              </p>
            </div>
          </div>
        )}

        {canEdit && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
