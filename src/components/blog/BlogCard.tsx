import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  views_count: number;
  author?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
}

export const BlogCard = ({ post, variant = "default" }: BlogCardProps) => {
  const authorName = post.author
    ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim() || "Hostfluencer Team"
    : "Hostfluencer Team";

  // Generate descriptive alt text for SEO
  const imageAlt = post.category
    ? `${post.title} - ${post.category.replace("-", " ")} article featured image`
    : `${post.title} - blog article featured image`;

  if (variant === "featured") {
    return (
      <Link to={`/blog/${post.slug}`} className="block group">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-[16/10] md:aspect-auto relative overflow-hidden">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={imageAlt}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            <CardContent className="p-6 md:p-8 flex flex-col justify-center">
              {post.category && (
                <Badge variant="secondary" className="w-fit mb-3">
                  {post.category.replace("-", " ")}
                </Badge>
              )}
              <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{authorName}</span>
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {format(new Date(post.published_at), "MMM d, yyyy")}
                  </time>
                )}
                {post.reading_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{post.reading_time_minutes} min read</span>
                  </span>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/blog/${post.slug}`} className="flex gap-3 group">
        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={imageAlt}
            loading="lazy"
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h4>
          {post.published_at && (
            <time dateTime={post.published_at} className="text-xs text-muted-foreground mt-1 block">
              {format(new Date(post.published_at), "MMM d, yyyy")}
            </time>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="aspect-[16/10] relative overflow-hidden">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={imageAlt}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {post.category && (
            <Badge variant="secondary" className="mb-2">
              {post.category.replace("-", " ")}
            </Badge>
          )}
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), "MMM d")}
                </time>
              )}
              {post.reading_time_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>{post.reading_time_minutes} min</span>
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>{post.views_count}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
