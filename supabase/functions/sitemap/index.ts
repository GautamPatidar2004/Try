import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_URL = 'https://hostfluencer.com'

// Static pages with their SEO priority and change frequency
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/for-hosts', priority: '0.9', changefreq: 'weekly' },
  { path: '/for-creators', priority: '0.9', changefreq: 'weekly' },
  { path: '/for-brands', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/marketplace', priority: '0.8', changefreq: 'daily' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/about-us', priority: '0.7', changefreq: 'monthly' },
  
  { path: '/help', priority: '0.6', changefreq: 'monthly' },
  { path: '/ambassador-program', priority: '0.6', changefreq: 'monthly' },
  { path: '/creator-resources', priority: '0.6', changefreq: 'monthly' },
  { path: '/content-guidelines', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
  { path: '/raffle-rules', priority: '0.3', changefreq: 'yearly' },
  // SEO landing pages
  { path: '/ugc-for-airbnb-hosts', priority: '0.8', changefreq: 'monthly' },
  { path: '/ugc-for-vacation-rentals', priority: '0.8', changefreq: 'monthly' },
  { path: '/influencer-stays-for-hosts', priority: '0.8', changefreq: 'monthly' },
]

// Brand SEO page data for dynamic URL generation
const brandIndustries = ['hotels', 'restaurants', 'real-estate', 'spas', 'fitness-studios', 'event-venues', 'tour-operators']
const brandPlatforms = ['instagram', 'tiktok', 'youtube']
const brandLocations = ['miami', 'los-angeles', 'new-york', 'austin', 'denver', 'nashville', 'san-francisco', 'chicago', 'seattle', 'san-diego', 'scottsdale', 'las-vegas', 'new-orleans', 'orlando', 'hawaii']

// Location mapping for fuzzy matching database values to slugs
const locationMappings: Record<string, string[]> = {
  'miami': ['miami'],
  'los-angeles': ['los angeles', 'la,'],
  'new-york': ['new york', 'nyc'],
  'austin': ['austin'],
  'denver': ['denver'],
  'nashville': ['nashville'],
  'san-francisco': ['san francisco'],
  'chicago': ['chicago'],
  'seattle': ['seattle'],
  'san-diego': ['san diego'],
  'scottsdale': ['scottsdale'],
  'las-vegas': ['las vegas', 'vegas'],
  'new-orleans': ['new orleans', 'nola'],
  'orlando': ['orlando'],
  'hawaii': ['hawaii', 'honolulu', 'maui', 'oahu']
}

// Map a database location string to a slug
function mapLocationToSlug(location: string | null): string | null {
  if (!location) return null
  // Trim and lowercase for matching
  const lowerLocation = location.toLowerCase().trim()
  
  for (const [slug, patterns] of Object.entries(locationMappings)) {
    for (const pattern of patterns) {
      if (lowerLocation.includes(pattern)) {
        return slug
      }
    }
  }
  return null
}

// Get all influencer data for inventory calculations
async function getInfluencerInventory(supabase: SupabaseClient): Promise<{
  locationCounts: Map<string, number>;
  platformLocationCounts: Map<string, number>;
}> {
  // First, get all influencer IDs with their platform URLs
  const { data: influencers, error: infError } = await supabase
    .from('influencers')
    .select('id, instagram_url, tiktok_url, youtube_url')

  if (infError) {
    console.error('Error fetching influencers:', infError)
    return { locationCounts: new Map(), platformLocationCounts: new Map() }
  }

  console.log(`Found ${influencers?.length || 0} total influencers`)

  if (!influencers || influencers.length === 0) {
    return { locationCounts: new Map(), platformLocationCounts: new Map() }
  }

  // Get profiles for these influencers
  const influencerIds = influencers.map(i => i.id)
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, location, user_type')
    .in('id', influencerIds)
    .eq('user_type', 'influencer')
    .not('location', 'is', null)

  if (profError) {
    console.error('Error fetching profiles:', profError)
    return { locationCounts: new Map(), platformLocationCounts: new Map() }
  }

  console.log(`Found ${profiles?.length || 0} influencer profiles with locations`)

  // Create a lookup from influencer ID to profile
  const profileMap = new Map<string, { location: string }>()
  for (const profile of profiles || []) {
    profileMap.set(profile.id, { location: profile.location })
  }

  // Count creators per location and per platform+location
  const locationCounts = new Map<string, number>()
  const platformLocationCounts = new Map<string, number>()

  for (const influencer of influencers) {
    const profile = profileMap.get(influencer.id)
    if (!profile) continue

    const locationSlug = mapLocationToSlug(profile.location)
    if (!locationSlug) continue

    // Count by location
    locationCounts.set(locationSlug, (locationCounts.get(locationSlug) || 0) + 1)

    // Count by platform + location
    if (influencer.instagram_url) {
      const key = `instagram:${locationSlug}`
      platformLocationCounts.set(key, (platformLocationCounts.get(key) || 0) + 1)
    }
    if (influencer.tiktok_url) {
      const key = `tiktok:${locationSlug}`
      platformLocationCounts.set(key, (platformLocationCounts.get(key) || 0) + 1)
    }
    if (influencer.youtube_url) {
      const key = `youtube:${locationSlug}`
      platformLocationCounts.set(key, (platformLocationCounts.get(key) || 0) + 1)
    }
  }

  console.log('Location inventory:', Object.fromEntries(locationCounts))
  console.log('Platform+Location inventory:', Object.fromEntries(platformLocationCounts))

  return { locationCounts, platformLocationCounts }
}

// Generate all brand SEO page URLs with inventory filtering
async function generateBrandPages(
  supabase: SupabaseClient,
  minInventory: number = 6
): Promise<{ path: string; priority: string; changefreq: string }[]> {
  const pages: { path: string; priority: string; changefreq: string }[] = []
  
  // Fetch inventory data
  const { locationCounts, platformLocationCounts } = await getInfluencerInventory(supabase)
  
  let industryOnlyCount = 0
  let industryPlatformCount = 0
  let industryLocationCount = 0
  let industryPlatformLocationCount = 0
  
  // Track which locations qualify
  const qualifyingLocations: string[] = []
  const qualifyingPlatformLocations: string[] = []
  
  for (const industry of brandIndustries) {
    // Always include industry-only pages
    pages.push({ path: `/brands/${industry}`, priority: '0.8', changefreq: 'monthly' })
    industryOnlyCount++
    
    // Always include industry + platform pages
    for (const platform of brandPlatforms) {
      pages.push({ path: `/brands/${industry}/${platform}`, priority: '0.7', changefreq: 'monthly' })
      industryPlatformCount++
      
      // Industry + Platform + Location: only if >= minInventory
      for (const location of brandLocations) {
        const key = `${platform}:${location}`
        const count = platformLocationCounts.get(key) || 0
        if (count >= minInventory) {
          pages.push({ path: `/brands/${industry}/${platform}/${location}`, priority: '0.6', changefreq: 'monthly' })
          industryPlatformLocationCount++
          if (!qualifyingPlatformLocations.includes(key)) {
            qualifyingPlatformLocations.push(key)
          }
        }
      }
    }
    
    // Industry + Location: only if >= minInventory
    for (const location of brandLocations) {
      const count = locationCounts.get(location) || 0
      if (count >= minInventory) {
        pages.push({ path: `/brands/${industry}/${location}`, priority: '0.7', changefreq: 'monthly' })
        industryLocationCount++
        if (!qualifyingLocations.includes(location)) {
          qualifyingLocations.push(location)
        }
      }
    }
  }
  
  // Log detailed counts per pattern
  console.log('=== Brand SEO URL Generation ===')
  console.log(`  - Industry only: ${industryOnlyCount}`)
  console.log(`  - Industry + Platform: ${industryPlatformCount}`)
  console.log(`  - Industry + Location (inventory >= ${minInventory}): ${industryLocationCount}`)
  console.log(`    Qualifying locations: ${qualifyingLocations.join(', ') || 'none'}`)
  console.log(`  - Industry + Platform + Location (inventory >= ${minInventory}): ${industryPlatformLocationCount}`)
  console.log(`    Qualifying combos: ${qualifyingPlatformLocations.join(', ') || 'none'}`)
  console.log(`  - Total Brand Pages: ${pages.length}`)
  console.log('================================')
  
  return pages
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Generating dynamic sitemap...')

    // Create Supabase client with service role for internal data access
    // This is safe as sitemap is a public, read-only endpoint
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch published blog posts
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
    }

    console.log(`Found ${blogPosts?.length || 0} published blog posts`)

    // Generate brand pages with inventory filtering
    const brandPages = await generateBrandPages(supabase, 6)

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Add static pages
    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`
    }

    // Add dynamic brand SEO pages
    for (const page of brandPages) {
      xml += `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`
    }

    // Add dynamic blog posts
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at || post.published_at
        const formattedDate = lastmod ? new Date(lastmod).toISOString().split('T')[0] : ''
        
        xml += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>${formattedDate ? `
    <lastmod>${formattedDate}</lastmod>` : ''}
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>`
      }
    }

    xml += `
</urlset>`

    const totalUrls = staticPages.length + brandPages.length + (blogPosts?.length || 0)
    console.log(`Sitemap generated successfully with ${totalUrls} total URLs`)
    console.log(`  - Static pages: ${staticPages.length}`)
    console.log(`  - Brand SEO pages: ${brandPages.length}`)
    console.log(`  - Blog posts: ${blogPosts?.length || 0}`)

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
