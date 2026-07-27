import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import PDFDocument from "npm:pdfkit@0.15.0";
import { Buffer } from "node:buffer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COLORS = {
  black: '#1A1A1A',
  teal: '#2DD4BF',
  white: '#FFFFFF',
  gray: '#9CA3AF',
  lightGray: '#374151',
  darkCard: '#2A2A2A',
};

interface ServiceItem {
  platform: string;
  serviceType: string;
  price: string;
  description: string;
}

interface BrandCollab {
  brandName: string;
  description: string;
}

interface MediaKitRequest {
  influencerId: string;
  bio: string;
  deliverables: string[];
  featuredPhotos?: string[];
  coverPhotoUrl?: string;
  profilePhotoUrl?: string;
  tagline?: string;
  location?: string;
  languages?: string[];
  specialties?: string[];
  services?: ServiceItem[];
  brandCollabs?: BrandCollab[];
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function extractInstagramHandle(url: string | null): string {
  if (!url) return '';
  const match = url.match(/instagram\.com\/([^/?]+)/);
  return match ? `@${match[1]}` : '';
}

async function fetchImageBuffer(url: string | null | undefined): Promise<Buffer | null> {
  try {
    if (!url) return null;
    console.log('Fetching image:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Image fetch failed:', response.status, url);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    console.error('Failed to fetch image:', url, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting media kit generation...');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized: No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized: Invalid token');

    const request: MediaKitRequest = await req.json();
    console.log('Generating media kit for:', request.influencerId);

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*, influencers(*)')
      .eq('id', request.influencerId)
      .single();

    if (!profile) throw new Error('Profile not found');

    const influencer = profile.influencers || {};
    const creatorName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Creator';
    const instagramHandle = extractInstagramHandle(influencer.instagram_url);
    const email = profile.email || '';

    const { data: analyticsData } = await supabaseClient
      .from('external_analytics')
      .select('metrics')
      .eq('influencer_id', request.influencerId)
      .eq('platform', 'instagram')
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const metrics = (analyticsData?.metrics as Record<string, any>) || {};
    
    const stats = {
      followers: influencer.total_followers || 0,
      engagementRate: influencer.engagement_rate || 0,
      totalReach: metrics.reach || Math.round((influencer.total_followers || 0) * 8),
      impressions: metrics.impressions || Math.round((influencer.total_followers || 0) * 12),
      nonFollowerReach: metrics.reach_non_followers_percent || 65,
      weeklyReach: metrics.weekly_reach || Math.round((influencer.total_followers || 0) * 3),
    };

    // Fetch images in parallel
    const [coverImageBuffer, profileImageBuffer] = await Promise.all([
      fetchImageBuffer(request.coverPhotoUrl),
      fetchImageBuffer(request.profilePhotoUrl || profile.profile_photo_url),
    ]);

    const pdfBuffer = await generateStandardizedPDF(
      creatorName,
      instagramHandle,
      email,
      coverImageBuffer,
      profileImageBuffer,
      request.bio || profile.bio || '',
      request.deliverables,
      stats,
      request.tagline,
      request.location,
      request.languages,
      request.specialties,
      request.services,
      request.brandCollabs
    );

    const fileName = `${request.influencerId}/media-kit-${Date.now()}.pdf`;
    const { error: uploadError } = await supabaseClient.storage
      .from('media-kits')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) throw new Error(`Failed to upload PDF: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseClient.storage
      .from('media-kits')
      .getPublicUrl(fileName);

    const { data: mediaKit, error: dbError } = await supabaseClient
      .from('media_kits')
      .insert({
        influencer_id: request.influencerId,
        title: `${creatorName}'s Media Kit`,
        pdf_url: publicUrl,
        stats_snapshot: stats,
        bio: request.bio || profile.bio || '',
        rate_card: { 
          deliverables: request.deliverables,
          services: request.services || [],
          brandCollabs: request.brandCollabs || [],
        },
        builder_config: {
          tagline: request.tagline,
          location: request.location,
          languages: request.languages,
          specialties: request.specialties,
          coverPhotoUrl: request.coverPhotoUrl,
          profilePhotoUrl: request.profilePhotoUrl,
        },
        last_generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw new Error(`Failed to save media kit: ${dbError.message}`);

    console.log('Media kit generated successfully:', mediaKit.id);

    return new Response(
      JSON.stringify({ success: true, mediaKit, downloadUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating media kit:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate media kit' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateStandardizedPDF(
  creatorName: string,
  instagramHandle: string,
  email: string,
  coverImageBuffer: Buffer | null,
  profileImageBuffer: Buffer | null,
  bio: string,
  deliverables: string[],
  stats: {
    followers: number;
    engagementRate: number;
    totalReach: number;
    impressions: number;
    nonFollowerReach: number;
    weeklyReach: number;
  },
  tagline?: string,
  location?: string,
  languages?: string[],
  specialties?: string[],
  services?: ServiceItem[],
  brandCollabs?: BrandCollab[]
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        bufferPages: true
      });

      const chunks: Uint8Array[] = [];
      doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      doc.on('end', () => {
        const result = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
        resolve(result);
      });
      doc.on('error', reject);

      // ============= PAGE 1: COVER =============
      doc.rect(0, 0, 612, 792).fill(COLORS.black);

      // Left side - cover/profile image or placeholder
      if (coverImageBuffer || profileImageBuffer) {
        const imgBuf = coverImageBuffer || profileImageBuffer;
        try {
          doc.image(imgBuf!, 0, 0, { width: 280, height: 500, cover: [280, 500] });
          // Dark overlay for text readability
          doc.rect(0, 0, 280, 500).fillOpacity(0.2).fill(COLORS.black).fillOpacity(1);
        } catch (e) {
          console.error('Failed to render cover image:', e);
          doc.rect(0, 0, 280, 500).fillOpacity(0.3).fill('#333333').fillOpacity(1);
        }
      } else {
        doc.rect(0, 0, 280, 500).fillOpacity(0.3).fill('#333333').fillOpacity(1);
      }

      // "MEDIA KIT 2026" vertical text
      doc.save();
      doc.rotate(-90, { origin: [30, 400] });
      doc.fontSize(12).fillColor(COLORS.teal).font('Helvetica-Bold')
         .text('MEDIA KIT 2026', -100, 400 - 30, { characterSpacing: 2 });
      doc.restore();

      // Creator name - right side
      const nameParts = creatorName.toUpperCase().split(' ');
      let nameY = 80;
      doc.fontSize(56).fillColor(COLORS.white).font('Helvetica-Bold');
      nameParts.forEach((part, index) => {
        doc.fillColor(index === 0 ? COLORS.white : COLORS.teal);
        doc.text(part, 300, nameY, { width: 280 });
        nameY += 70;
      });

      // Tagline
      doc.fontSize(14).fillColor(COLORS.gray).font('Helvetica')
         .text('HOSTFLUENCER', 300, nameY + 20, { characterSpacing: 3 });

      doc.fontSize(24).fillColor(COLORS.white).font('Helvetica-Bold')
         .text((tagline || 'CONTENT CREATOR').toUpperCase(), 300, nameY + 50);

      // Location & specialties
      if (location || (specialties && specialties.length > 0)) {
        let infoY = nameY + 90;
        if (location) {
          doc.fontSize(11).fillColor(COLORS.gray).font('Helvetica')
             .text(location, 300, infoY);
          infoY += 18;
        }
        if (specialties && specialties.length > 0) {
          doc.fontSize(11).fillColor(COLORS.teal).font('Helvetica')
             .text(specialties.join(' • '), 300, infoY, { width: 280 });
        }
      }

      // Stats row at bottom of page 1
      const statsY = 580;
      const statsX = 50;
      const colWidth = 512 / 4;

      doc.fontSize(14).fillColor(COLORS.teal).font('Helvetica-Bold')
         .text('STATS', statsX, statsY - 30, { characterSpacing: 2 });
      doc.moveTo(statsX, statsY - 10).lineTo(statsX + 60, statsY - 10).lineWidth(2).stroke(COLORS.teal);

      const statsData = [
        { label: 'Total Reach', value: formatNumber(stats.totalReach) },
        { label: 'Impressions', value: formatNumber(stats.impressions) },
        { label: 'Non-follower Reach', value: `${stats.nonFollowerReach}%` },
        { label: 'Weekly Reach', value: formatNumber(stats.weeklyReach) },
      ];

      statsData.forEach((stat, index) => {
        const x = statsX + (index * colWidth);
        doc.fontSize(32).fillColor(COLORS.white).font('Helvetica-Bold')
           .text(stat.value, x, statsY + 10, { width: colWidth - 10 });
        doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica')
           .text(stat.label.toUpperCase(), x, statsY + 50, { width: colWidth - 10 });
      });

      // Footer
      const footerY = 720;
      doc.fontSize(12).fillColor(COLORS.white).font('Helvetica').text(instagramHandle, statsX, footerY);
      doc.fontSize(12).fillColor(COLORS.gray).text(email, statsX, footerY + 18);

      // ============= PAGE 2: ABOUT + STATS + SERVICES =============
      doc.addPage();
      doc.rect(0, 0, 612, 792).fill(COLORS.black);

      // Top banner with image
      if (profileImageBuffer || coverImageBuffer) {
        const bannerImg = coverImageBuffer || profileImageBuffer;
        try {
          doc.image(bannerImg!, 30, 30, { width: 552, height: 200, cover: [552, 200] });
          doc.rect(30, 30, 552, 200).fillOpacity(0.15).fill(COLORS.black).fillOpacity(1);
        } catch (e) {
          console.error('Failed to render banner image:', e);
          doc.rect(30, 30, 552, 200).fillOpacity(0.3).fill('#333333').fillOpacity(1);
        }
      } else {
        doc.rect(30, 30, 552, 200).fillOpacity(0.3).fill('#333333').fillOpacity(1);
      }

      // Profile photo circle overlay on banner
      if (profileImageBuffer) {
        try {
          doc.save();
          doc.circle(100, 210, 40).clip();
          doc.image(profileImageBuffer, 60, 170, { width: 80, height: 80, cover: [80, 80] });
          doc.restore();
          // Circle border
          doc.circle(100, 210, 41).lineWidth(2).stroke(COLORS.teal);
        } catch (e) {
          console.error('Failed to render profile circle:', e);
        }
      }

      doc.fontSize(36).fillColor(COLORS.white).font('Helvetica-Bold')
         .text(creatorName.toUpperCase(), 50, 265);

      // About Me
      const aboutY = 315;
      doc.fontSize(16).fillColor(COLORS.teal).font('Helvetica-Bold').text('About Me', 50, aboutY);
      doc.fontSize(11).fillColor(COLORS.white).font('Helvetica')
         .text(bio || 'Travel and lifestyle content creator passionate about showcasing unique stays and experiences.', 50, aboutY + 28, { width: 320, lineGap: 4 });

      // Languages
      if (languages && languages.length > 0) {
        const langY = aboutY + 100;
        doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Bold').text('LANGUAGES', 50, langY);
        doc.fontSize(10).fillColor(COLORS.white).font('Helvetica')
           .text(languages.join(', '), 50, langY + 16);
      }

      // Stats sidebar
      const sidebarX = 420;
      const sidebarY = 315;
      const sidebarStats = [
        { label: 'Followers', value: formatNumber(stats.followers) },
        { label: 'Non-follower reach', value: `${stats.nonFollowerReach}%` },
        { label: 'Engagement rate', value: `${stats.engagementRate}%` },
        { label: 'Weekly reach', value: formatNumber(stats.weeklyReach) },
      ];

      sidebarStats.forEach((stat, index) => {
        const y = sidebarY + (index * 55);
        doc.fontSize(24).fillColor(COLORS.teal).font('Helvetica-Bold').text(stat.value, sidebarX, y);
        doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica').text(stat.label, sidebarX, y + 28);
      });

      // ============= SERVICES & RATES (enlarged) =============
      let servicesY = 540;
      doc.fontSize(20).fillColor(COLORS.teal).font('Helvetica-Bold').text('Services & Rates', 50, servicesY);
      doc.moveTo(50, servicesY + 26).lineTo(200, servicesY + 26).lineWidth(1.5).stroke(COLORS.teal);
      servicesY += 40;

      if (services && services.length > 0) {
        services.forEach((service) => {
          if (servicesY > 730) return; // Prevent overflow

          // Card background
          doc.roundedRect(50, servicesY - 4, 512, 38, 4).fill(COLORS.darkCard);

          // Service name
          doc.fontSize(13).fillColor(COLORS.white).font('Helvetica-Bold')
             .text(`${service.platform} — ${service.serviceType}`, 60, servicesY + 4, { width: 330 });

          // Price
          if (service.price) {
            doc.fontSize(14).fillColor(COLORS.teal).font('Helvetica-Bold')
               .text(service.price, 400, servicesY + 4, { width: 150, align: 'right' });
          }

          servicesY += 42;

          // Description below card
          if (service.description) {
            doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica')
               .text(service.description, 60, servicesY, { width: 490 });
            servicesY += 18;
          }
          servicesY += 6;
        });
      } else if (deliverables.length > 0) {
        // Fallback: show deliverables here if no services
        deliverables.forEach((item) => {
          if (servicesY > 730) return;
          doc.fontSize(13).fillColor(COLORS.white).font('Helvetica')
             .text(`• ${item}`, 60, servicesY, { width: 490, lineGap: 2 });
          servicesY += 28;
        });
      }

      // ============= PAGE 3: DELIVERABLES + BRAND COLLABS =============
      const hasDeliverables = services && services.length > 0 && deliverables.length > 0;
      const hasBrandCollabs = brandCollabs && brandCollabs.length > 0;

      if (hasDeliverables || hasBrandCollabs) {
        doc.addPage();
        doc.rect(0, 0, 612, 792).fill(COLORS.black);

        let yPos = 50;

        // Deliverables section (shown here when services were on page 2)
        if (hasDeliverables) {
          doc.fontSize(20).fillColor(COLORS.teal).font('Helvetica-Bold').text('Deliverables', 50, yPos);
          doc.moveTo(50, yPos + 26).lineTo(185, yPos + 26).lineWidth(1.5).stroke(COLORS.teal);
          yPos += 45;

          deliverables.forEach((item) => {
            if (yPos > 700) return;
            // Teal bullet
            doc.circle(62, yPos + 6, 4).fill(COLORS.teal);
            doc.fontSize(13).fillColor(COLORS.white).font('Helvetica')
               .text(item, 76, yPos, { width: 480, lineGap: 2 });
            yPos += 28;
          });
          yPos += 25;
        }

        // Brand Collaborations
        if (hasBrandCollabs) {
          doc.fontSize(20).fillColor(COLORS.teal).font('Helvetica-Bold').text('Brand Collaborations', 50, yPos);
          doc.moveTo(50, yPos + 26).lineTo(260, yPos + 26).lineWidth(1.5).stroke(COLORS.teal);
          yPos += 45;

          brandCollabs!.forEach((collab) => {
            if (yPos > 720) return;

            // Card background
            doc.roundedRect(50, yPos - 4, 512, collab.description ? 50 : 32, 4).fill(COLORS.darkCard);

            doc.fontSize(14).fillColor(COLORS.white).font('Helvetica-Bold')
               .text(collab.brandName, 60, yPos + 4);
            if (collab.description) {
              doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica')
                 .text(collab.description, 60, yPos + 22, { width: 490 });
            }
            yPos += collab.description ? 58 : 38;
          });
        }

        // Footer tagline
        doc.fontSize(9).fillColor(COLORS.gray).font('Helvetica')
           .text('Complimentary stay  •  No cash exchange  •  Clear deliverables  •  Mutually beneficial collaboration', 50, 740, { width: 512, align: 'center' });
      } else {
        // No page 3 - add footer to page 2
        doc.fontSize(9).fillColor(COLORS.gray).font('Helvetica')
           .text('Complimentary stay  •  No cash exchange  •  Clear deliverables  •  Mutually beneficial collaboration', 50, 740, { width: 512, align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
