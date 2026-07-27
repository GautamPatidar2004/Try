import { useState, useEffect, useMemo } from "react";
import { X, Search, AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichBlogEditor } from "./RichBlogEditor";
import type { BlogPost } from "./useBlogData";

interface BlogPostEditorProps {
  post?: BlogPost | null;
  open: boolean;
  onClose: () => void;
  onSave: (post: Partial<BlogPost>) => void;
  isSaving: boolean;
}

const CATEGORIES = [
  { value: "travel-tips", label: "Travel Tips" },
  { value: "creator-guides", label: "Creator Guides" },
  { value: "host-insights", label: "Host Insights" },
  { value: "industry-news", label: "Industry News" },
  { value: "success-stories", label: "Success Stories" },
];

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// SEO helper functions
const getTitleStatus = (length: number) => {
  if (length === 0) return { status: "empty", color: "text-muted-foreground" };
  if (length < 30) return { status: "too-short", color: "text-yellow-600" };
  if (length <= 60) return { status: "optimal", color: "text-green-600" };
  return { status: "too-long", color: "text-red-600" };
};

const getDescriptionStatus = (length: number) => {
  if (length === 0) return { status: "empty", color: "text-muted-foreground" };
  if (length < 120) return { status: "too-short", color: "text-yellow-600" };
  if (length <= 160) return { status: "optimal", color: "text-green-600" };
  return { status: "too-long", color: "text-red-600" };
};

export const BlogPostEditor = ({
  post,
  open,
  onClose,
  onSave,
  isSaving,
}: BlogPostEditorProps) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    category: "",
    tags: "",
    meta_title: "",
    meta_description: "",
    featured: false,
    status: "draft",
  });
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        featured_image_url: post.featured_image_url || "",
        category: post.category || "",
        tags: post.tags?.join(", ") || "",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        featured: post.featured || false,
        status: post.status || "draft",
      });
      setAutoSlug(false);
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featured_image_url: "",
        category: "",
        tags: "",
        meta_title: "",
        meta_description: "",
        featured: false,
        status: "draft",
      });
      setAutoSlug(true);
    }
  }, [post, open]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = () => {
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      tags: tags.length > 0 ? tags : null,
      reading_time_minutes: calculateReadingTime(formData.content),
      category: formData.category || null,
      featured_image_url: formData.featured_image_url || null,
      excerpt: formData.excerpt || null,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
    });
  };

  // SEO analysis
  const seoAnalysis = useMemo(() => {
    const metaTitle = formData.meta_title || formData.title;
    const metaDescription = formData.meta_description || formData.excerpt;
    const titleStatus = getTitleStatus(metaTitle.length);
    const descriptionStatus = getDescriptionStatus(metaDescription.length);
    
    const issues: string[] = [];
    const passes: string[] = [];

    // Title checks
    if (metaTitle.length === 0) {
      issues.push("Add a title for your post");
    } else if (metaTitle.length < 30) {
      issues.push("Title is too short (aim for 30-60 characters)");
    } else if (metaTitle.length > 60) {
      issues.push("Title may be truncated in search results (max 60 characters)");
    } else {
      passes.push("Title length is optimal");
    }

    // Description checks
    if (metaDescription.length === 0) {
      issues.push("Add a meta description or excerpt");
    } else if (metaDescription.length < 120) {
      issues.push("Description is too short (aim for 120-160 characters)");
    } else if (metaDescription.length > 160) {
      issues.push("Description may be truncated in search results");
    } else {
      passes.push("Description length is optimal");
    }

    // Image check
    if (formData.featured_image_url) {
      passes.push("Featured image is set");
    } else {
      issues.push("Add a featured image for better social sharing");
    }

    // Tags check
    if (formData.tags.trim()) {
      passes.push("Keywords/tags are set");
    } else {
      issues.push("Add tags for better keyword targeting");
    }

    // Category check
    if (formData.category) {
      passes.push("Category is selected");
    } else {
      issues.push("Select a category for better organization");
    }

    return { titleStatus, descriptionStatus, issues, passes };
  }, [formData]);

  // Google search preview
  const searchPreview = useMemo(() => {
    const title = formData.meta_title || formData.title || "Your Post Title";
    const description = formData.meta_description || formData.excerpt || "Your post description will appear here...";
    const url = `hostfluencer.com/blog/${formData.slug || "your-post-slug"}`;
    
    return {
      title: title.length > 60 ? title.substring(0, 57) + "..." : title,
      description: description.length > 160 ? description.substring(0, 157) + "..." : description,
      url,
    };
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{post ? "Edit Post" : "Create New Post"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Title & Slug */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
                <p className={`text-xs ${seoAnalysis.titleStatus.color}`}>
                  {formData.title.length}/60 characters
                  {formData.title.length > 0 && formData.title.length <= 60 && " ✓"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags / Keywords (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="airbnb tips, host guide, vacation rental"
                />
                <p className="text-xs text-muted-foreground">
                  These become meta keywords for SEO
                </p>
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured_image_url">Featured Image URL</Label>
              <Input
                id="featured_image_url"
                value={formData.featured_image_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, featured_image_url: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px for optimal social sharing
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt / Summary</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief summary of the post (used for previews and as fallback meta description)..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {formData.excerpt.length}/160 characters (used if no meta description set)
              </p>
            </div>

            {/* Content with Rich Editor */}
            <div className="space-y-2">
              <Label>Content *</Label>
              <RichBlogEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Start writing your blog post... Use the toolbar above to format text, add headers, lists, and more."
              />
              <p className="text-xs text-muted-foreground mt-2">
                Word count: {formData.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length} • 
                Reading time: ~{calculateReadingTime(formData.content.replace(/<[^>]*>/g, ' '))} min
              </p>
            </div>

            {/* SEO Fields with Preview */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <h3 className="font-medium">SEO Settings</h3>
              </div>

              {/* Google Search Preview */}
              <div className="p-4 bg-background rounded border">
                <p className="text-xs text-muted-foreground mb-2">Google Search Preview:</p>
                <div className="space-y-1">
                  <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                    {searchPreview.title} | Hostfluencer Blog
                  </p>
                  <p className="text-[#006621] text-sm">{searchPreview.url}</p>
                  <p className="text-sm text-[#545454] line-clamp-2">
                    {searchPreview.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title (optional)</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                    }
                    placeholder="Custom SEO title (defaults to post title)"
                  />
                  <p className={`text-xs ${seoAnalysis.titleStatus.color}`}>
                    {(formData.meta_title || formData.title).length}/60 characters
                    {seoAnalysis.titleStatus.status === "optimal" && " ✓ Optimal"}
                    {seoAnalysis.titleStatus.status === "too-short" && " ⚠ Too short"}
                    {seoAnalysis.titleStatus.status === "too-long" && " ⚠ Too long"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description (optional)</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, meta_description: e.target.value }))
                    }
                    placeholder="Custom SEO description (defaults to excerpt)"
                    rows={2}
                  />
                  <p className={`text-xs ${seoAnalysis.descriptionStatus.color}`}>
                    {(formData.meta_description || formData.excerpt).length}/160 characters
                    {seoAnalysis.descriptionStatus.status === "optimal" && " ✓ Optimal"}
                    {seoAnalysis.descriptionStatus.status === "too-short" && " ⚠ Too short"}
                    {seoAnalysis.descriptionStatus.status === "too-long" && " ⚠ Too long"}
                  </p>
                </div>
              </div>

              {/* SEO Checklist */}
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                {seoAnalysis.passes.length > 0 && (
                  <div className="space-y-1">
                    {seoAnalysis.passes.map((pass, i) => (
                      <div key={i} className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{pass}</span>
                      </div>
                    ))}
                  </div>
                )}
                {seoAnalysis.issues.length > 0 && (
                  <div className="space-y-1">
                    {seoAnalysis.issues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked }))
                  }
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="publish"
                  checked={formData.status === "published"}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: checked ? "published" : "draft",
                    }))
                  }
                />
                <Label htmlFor="publish">Publish immediately</Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.slug || !formData.content || isSaving}
          >
            {isSaving ? "Saving..." : post ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
