import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { ArrowLeft, Clock, Eye, Calendar, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/BlogCard";
import { generateBlogPostSchema, generateBreadcrumbSchema } from "@/components/SEO";

const BASE_URL = "https://hostfluencer.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png`;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(first_name, last_name)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related-posts", post?.category, post?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id, title, slug, excerpt, featured_image_url, category,
          reading_time_minutes, published_at, views_count
        `)
        .eq("status", "published")
        .eq("category", post!.category)
        .neq("id", post!.id)
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!post?.category && !!post?.id,
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      supabase.rpc("increment_blog_post_views", { post_id: post.id });
    }
  }, [post?.id]);

  if (error) {
    navigate("/blog");
    return null;
  }

  const authorName = post?.author
    ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim() || "Hostfluencer Team"
    : "Hostfluencer Team";

  const shareUrl = `${BASE_URL}/blog/${slug}`;
  const shareText = post?.title || "";
  const wordCount = post?.content ? post.content.split(/\s+/).filter(Boolean).length : 0;

  // Generate structured data schemas
  const blogPostSchema = post
    ? generateBlogPostSchema({
        title: post.title,
        description: post.meta_description || post.excerpt || "",
        image: post.featured_image_url,
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at,
        authorName,
        url: shareUrl,
        tags: post.tags,
        category: post.category,
        wordCount,
      })
    : null;

  const breadcrumbSchema = post
    ? generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: post.title, url: `/blog/${slug}` },
      ])
    : null;

  return (
    <>
      {post && (
        <Helmet>
          {/* Primary Meta Tags */}
          <title>{post.meta_title || post.title} | Hostfluencer Blog</title>
          <meta
            name="description"
            content={post.meta_description || post.excerpt || "Read this article on Hostfluencer Blog"}
          />
          {post.tags && post.tags.length > 0 && (
            <meta name="keywords" content={post.tags.join(", ")} />
          )}
          <link rel="canonical" href={shareUrl} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.meta_title || post.title} />
          <meta property="og:description" content={post.meta_description || post.excerpt || ""} />
          <meta property="og:url" content={shareUrl} />
          <meta property="og:image" content={post.featured_image_url || DEFAULT_OG_IMAGE} />
          <meta property="og:site_name" content="Hostfluencer" />
          {post.published_at && (
            <meta property="article:published_time" content={post.published_at} />
          )}
          {post.updated_at && (
            <meta property="article:modified_time" content={post.updated_at} />
          )}
          {post.category && (
            <meta property="article:section" content={post.category.replace("-", " ")} />
          )}
          {post.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.meta_title || post.title} />
          <meta name="twitter:description" content={post.meta_description || post.excerpt || ""} />
          <meta name="twitter:image" content={post.featured_image_url || DEFAULT_OG_IMAGE} />

          {/* Structured Data */}
          {blogPostSchema && (
            <script type="application/ld+json">{JSON.stringify(blogPostSchema)}</script>
          )}
          {breadcrumbSchema && (
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
          )}
        </Helmet>
      )}

      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1">
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" itemScope itemType="https://schema.org/BlogPosting">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-foreground transition-colors">
                    Home
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                {post && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
                        {post.title}
                      </span>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {/* Back Button */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="aspect-[16/9] rounded-lg" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ) : post ? (
              <>
                {/* Header */}
                <header className="mb-8">
                  {post.category && (
                    <Badge variant="secondary" className="mb-4">
                      {post.category.replace("-", " ")}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" itemProp="headline">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <span className="font-medium text-foreground" itemProp="author" itemScope itemType="https://schema.org/Person">
                      <span itemProp="name">{authorName}</span>
                    </span>
                    {post.published_at && (
                      <time
                        dateTime={post.published_at}
                        className="flex items-center gap-1"
                        itemProp="datePublished"
                      >
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.published_at), "MMMM d, yyyy")}
                      </time>
                    )}
                    {post.reading_time_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.reading_time_minutes} min read
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views_count} views
                    </span>
                  </div>
                  {/* Hidden metadata for SEO */}
                  <meta itemProp="wordCount" content={String(wordCount)} />
                  {post.updated_at && (
                    <meta itemProp="dateModified" content={post.updated_at} />
                  )}
                </header>

                {/* Featured Image */}
                {post.featured_image_url && (
                  <figure className="mb-8">
                    <img
                      src={post.featured_image_url}
                      alt={`${post.title} - ${post.category?.replace("-", " ") || "blog"} article featured image`}
                      className="w-full aspect-[16/9] object-cover rounded-lg"
                      loading="eager"
                      itemProp="image"
                    />
                  </figure>
                )}

                {/* Content - supports both HTML and Markdown */}
                <div className="prose prose-lg max-w-none dark:prose-invert mb-8" itemProp="articleBody">
                  {post.content.startsWith("<") ? (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                  ) : (
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" itemProp="keywords">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Share */}
                <div className="border-t border-b py-6 mb-8">
                  <div className="flex items-center gap-4">
                    <span className="font-medium flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share this post
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Share on Twitter"
                      >
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Share on Facebook"
                      >
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Share on LinkedIn"
                      >
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <section aria-labelledby="related-posts-heading">
                    <h2 id="related-posts-heading" className="text-2xl font-bold mb-6">
                      Related Posts
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      {relatedPosts.map((relatedPost) => (
                        <BlogCard key={relatedPost.id} post={relatedPost} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : null}
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
