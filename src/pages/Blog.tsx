import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO, generateBlogListSchema, generateBreadcrumbSchema } from "@/components/SEO";
import { SITE_CONFIG } from "@/config/site";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  views_count: number;
  featured: boolean;
  author?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const DEFAULT_OG_IMAGE = `${SITE_CONFIG.productionUrl}/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png`;

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id, title, slug, excerpt, featured_image_url, category, tags,
          reading_time_minutes, published_at, views_count, featured,
          author:profiles!blog_posts_author_id_fkey(first_name, last_name)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return (data || []) as BlogPost[];
    },
  });

  const featuredPost = useMemo(() => posts.find((p) => p.featured), [posts]);
  const regularPosts = useMemo(
    () => posts.filter((p) => !p.featured || p.id !== featuredPost?.id),
    [posts, featuredPost]
  );

  const filteredPosts = useMemo(
    () =>
      activeCategory
        ? regularPosts.filter((p) => p.category === activeCategory)
        : regularPosts,
    [regularPosts, activeCategory]
  );

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean) as string[])],
    [posts]
  );

  const allTags = useMemo(
    () => [...new Set(posts.flatMap((p) => p.tags || []))],
    [posts]
  );

  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);

  // Generate schemas for SEO
  const blogSchema = generateBlogListSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <SEO 
        title="Blog" 
        description="Expert tips, guides, and insights for property hosts and content creators. Learn how to maximize your collaborations and grow your audience."
        canonical="/blog"
        image={DEFAULT_OG_IMAGE}
        keywords="property hosting tips, content creator guides, UGC marketing, Airbnb host tips, influencer collaborations, travel content creation, vacation rental marketing, creator economy"
        schema={blogSchema}
      />

      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumb navigation */}
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/" className="hover:text-foreground transition-colors">
                      Home
                    </a>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <span className="text-foreground font-medium">Blog</span>
                  </li>
                </ol>
              </nav>

              <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Hostfluencer Blog
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Expert tips, guides, and insights for property hosts and content creators
                </p>
              </header>

              {/* Featured Post */}
              {isLoading ? (
                <Skeleton className="h-[400px] rounded-lg" />
              ) : (
                featuredPost && <BlogCard post={featuredPost} variant="featured" />
              )}
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Posts Grid */}
                <div className="lg:col-span-3">
                  {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[300px] rounded-lg" />
                      ))}
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No posts found</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                  <BlogSidebar
                    categories={categories}
                    activeCategory={activeCategory || undefined}
                    tags={allTags}
                    recentPosts={recentPosts}
                    onCategoryChange={setActiveCategory}
                  />
                </aside>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
