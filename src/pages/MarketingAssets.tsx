import { useAmbassador } from "@/hooks/useAmbassador";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Image, FileText, QrCode, Mail, BarChart, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AssetCard } from "@/components/ambassador/AssetCard";
import { QRCodeGenerator } from "@/components/ambassador/QRCodeGenerator";
import { SEO } from "@/components/SEO";

export default function MarketingAssets() {
  const { ambassador, isLoading, isAmbassador } = useAmbassador();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAmbassador) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Ambassador Access Required</CardTitle>
            <CardDescription>
              You need to be an active ambassador to access marketing assets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/ambassador-program')} className="w-full">
              Join Ambassador Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Marketing Assets" 
        description="Download ambassador marketing assets, badges, social media templates, and promotional materials."
        noIndex={true}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile?tab=ambassador')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Marketing Assets</h1>
          <p className="text-muted-foreground text-lg">
            Download promotional materials to share your referral link and grow your network
          </p>
        </div>

        {/* Tabs for different asset categories */}
        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="badges" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR Codes</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="graphics" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Graphics</span>
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Brand</span>
            </TabsTrigger>
          </TabsList>

          {/* Badges & Logos */}
          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ambassador Badges</CardTitle>
                <CardDescription>
                  Official Hostfluencer Ambassador badges for your profiles and websites
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AssetCard
                  title="Ambassador Badge PNG"
                  description="Transparent background, perfect for websites"
                  format="PNG"
                  size="512x512px"
                  icon="🏆"
                  onDownload={() => {
                    // Generate SVG badge and download as PNG
                    const svg = generateBadgeSVG(ambassador?.referral_code || "AMBASSADOR");
                    downloadSVGAsPNG(svg, "ambassador-badge.png", 512, 512);
                  }}
                />
                <AssetCard
                  title="Ambassador Badge SVG"
                  description="Scalable vector, perfect for printing"
                  format="SVG"
                  size="Scalable"
                  icon="🎨"
                  onDownload={() => {
                    const svg = generateBadgeSVG(ambassador?.referral_code || "AMBASSADOR");
                    downloadSVG(svg, "ambassador-badge.svg");
                  }}
                />
                <AssetCard
                  title="Square Profile Badge"
                  description="Perfect for Instagram profile pictures"
                  format="PNG"
                  size="1080x1080px"
                  icon="📱"
                  onDownload={() => {
                    const svg = generateSquareBadgeSVG(ambassador?.referral_code || "AMBASSADOR");
                    downloadSVGAsPNG(svg, "ambassador-square-badge.png", 1080, 1080);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Templates */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Templates</CardTitle>
                <CardDescription>
                  Ready-to-use templates for Instagram, Facebook, and LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <AssetCard
                  title="Instagram Story Template"
                  description="Share your ambassador link with followers"
                  format="PNG"
                  size="1080x1920px"
                  icon="📸"
                  onDownload={() => {
                    const svg = generateInstagramStorySVG(ambassador?.referral_code || "AMBASSADOR");
                    downloadSVGAsPNG(svg, "instagram-story.png", 1080, 1920);
                  }}
                />
                <AssetCard
                  title="Instagram Post Template"
                  description="Feed post announcing your partnership"
                  format="PNG"
                  size="1080x1080px"
                  icon="📷"
                  onDownload={() => {
                    const svg = generateInstagramPostSVG(ambassador?.referral_code || "AMBASSADOR");
                    downloadSVGAsPNG(svg, "instagram-post.png", 1080, 1080);
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pre-written Captions</CardTitle>
                <CardDescription>Copy and paste these captions for your posts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Instagram Story Caption:</p>
                  <p className="text-sm mb-3">
                    "🏆 Proud Hostfluencer Ambassador! Use my link to join and start monetizing your content: [YOUR LINK] ✨"
                  </p>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText("🏆 Proud Hostfluencer Ambassador! Use my link to join and start monetizing your content: [YOUR LINK] ✨");
                  }}>
                    Copy Caption
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Feed Post Caption:</p>
                  <p className="text-sm mb-3">
                    "Exciting news! 🎉 I'm now a Hostfluencer Ambassador! If you're a creator looking to monetize your content through authentic collaborations, use my referral link and let's grow together! 🚀 #HostfluencerAmbassador #ContentCreator"
                  </p>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText("Exciting news! 🎉 I'm now a Hostfluencer Ambassador! If you're a creator looking to monetize your content through authentic collaborations, use my referral link and let's grow together! 🚀 #HostfluencerAmbassador #ContentCreator");
                  }}>
                    Copy Caption
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Code Generator */}
          <TabsContent value="qr" className="space-y-4">
            <QRCodeGenerator />
          </TabsContent>

          {/* Email Signatures */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Signature Templates</CardTitle>
                <CardDescription>
                  Add your ambassador status to your email signature
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">HTML Email Signature:</p>
                  <div className="text-sm mb-3 p-3 bg-background rounded border">
                    <p className="font-semibold">Your Name</p>
                    <p className="text-muted-foreground">Hostfluencer Ambassador</p>
                    <p className="text-xs text-primary mt-2">Join Hostfluencer: {window.location.origin}?ref={ambassador?.referral_code}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const html = `<p style="margin:0;font-weight:600;">Your Name</p><p style="margin:0;color:#666;">Hostfluencer Ambassador</p><p style="margin:8px 0 0 0;font-size:12px;color:#10b981;">Join Hostfluencer: ${window.location.origin}?ref=${ambassador?.referral_code}</p>`;
                    navigator.clipboard.writeText(html);
                  }}>
                    Copy HTML
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotional Graphics */}
          <TabsContent value="graphics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promotional Graphics</CardTitle>
                <CardDescription>
                  Infographics and statistics to share earning opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <AssetCard
                  title="Earning Methods Infographic"
                  description="Visual breakdown of all earning opportunities"
                  format="PNG"
                  size="1080x1350px"
                  icon="💰"
                  onDownload={() => {
                    const svg = generateEarningInfographicSVG();
                    downloadSVGAsPNG(svg, "earning-methods.png", 1080, 1350);
                  }}
                />
                <AssetCard
                  title="Program Benefits Card"
                  description="Key benefits of the ambassador program"
                  format="PNG"
                  size="1080x1080px"
                  icon="⭐"
                  onDownload={() => {
                    const svg = generateBenefitsCardSVG();
                    downloadSVGAsPNG(svg, "program-benefits.png", 1080, 1080);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Guidelines */}
          <TabsContent value="brand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brand Guidelines</CardTitle>
                <CardDescription>
                  Official Hostfluencer brand colors, fonts, and usage guidelines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Color Palette</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(142,76%,36%)]"></div>
                      <p className="text-xs font-medium">Primary Green</p>
                      <p className="text-xs text-muted-foreground">#10b981</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(160,84%,39%)]"></div>
                      <p className="text-xs font-medium">Accent Teal</p>
                      <p className="text-xs text-muted-foreground">#14b8a6</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(217,91%,60%)]"></div>
                      <p className="text-xs font-medium">Accent Blue</p>
                      <p className="text-xs text-muted-foreground">#3b82f6</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(45,93%,47%)]"></div>
                      <p className="text-xs font-medium">Accent Gold</p>
                      <p className="text-xs text-muted-foreground">#eab308</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Usage Guidelines</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Use official ambassador badges on your profiles</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Share templates with your referral code</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Use brand colors when creating custom graphics</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Don't modify or alter official logos</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Don't make false earnings claims</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper functions for SVG generation and download
function generateBadgeSVG(code: string): string {
  return `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="256" cy="256" r="240" fill="url(#grad1)" />
    <circle cx="256" cy="256" r="220" fill="white" />
    <text x="256" y="220" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#10b981" text-anchor="middle">🏆</text>
    <text x="256" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1f2937" text-anchor="middle">AMBASSADOR</text>
    <text x="256" y="310" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">${code}</text>
    <text x="256" y="350" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#10b981" text-anchor="middle">Hostfluencer</text>
  </svg>`;
}

function generateSquareBadgeSVG(code: string): string {
  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#f9fafb"/>
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="540" cy="540" r="400" fill="url(#grad2)" />
    <circle cx="540" cy="540" r="360" fill="white" />
    <text x="540" y="480" font-family="Arial, sans-serif" font-size="120" text-anchor="middle">🏆</text>
    <text x="540" y="590" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#1f2937" text-anchor="middle">AMBASSADOR</text>
    <text x="540" y="650" font-family="Arial, sans-serif" font-size="36" font-weight="600" fill="#10b981" text-anchor="middle">Hostfluencer</text>
  </svg>`;
}

function generateInstagramStorySVG(code: string): string {
  return `<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#bgGrad)" />
    <circle cx="540" cy="700" r="200" fill="white" opacity="0.2" />
    <text x="540" y="640" font-family="Arial, sans-serif" font-size="150" text-anchor="middle">🏆</text>
    <text x="540" y="900" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">I'M A</text>
    <text x="540" y="980" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">HOSTFLUENCER</text>
    <text x="540" y="1060" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">AMBASSADOR!</text>
    <text x="540" y="1200" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle">Join me on Hostfluencer</text>
    <text x="540" y="1260" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.9" text-anchor="middle">Use code: ${code}</text>
    <rect x="340" y="1320" width="400" height="80" rx="40" fill="white" />
    <text x="540" y="1373" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#10b981" text-anchor="middle">SWIPE UP</text>
  </svg>`;
}

function generateInstagramPostSVG(code: string): string {
  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="postGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:0.1" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#postGrad)" />
    <circle cx="540" cy="400" r="150" fill="#10b981" />
    <text x="540" y="430" font-family="Arial, sans-serif" font-size="100" text-anchor="middle">🏆</text>
    <text x="540" y="600" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#1f2937" text-anchor="middle">AMBASSADOR</text>
    <text x="540" y="670" font-family="Arial, sans-serif" font-size="48" font-weight="600" fill="#10b981" text-anchor="middle">Hostfluencer</text>
    <rect x="240" y="740" width="600" height="2" fill="#e5e7eb" />
    <text x="540" y="820" font-family="Arial, sans-serif" font-size="32" fill="#6b7280" text-anchor="middle">Join with my code:</text>
    <text x="540" y="880" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#10b981" text-anchor="middle">${code}</text>
  </svg>`;
}

function generateEarningInfographicSVG(): string {
  return `<svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" fill="white" />
    <text x="540" y="100" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#1f2937" text-anchor="middle">Earn as an Ambassador</text>
    <circle cx="270" cy="400" r="120" fill="#10b981" opacity="0.1" />
    <text x="270" y="390" font-family="Arial, sans-serif" font-size="72" text-anchor="middle">💰</text>
    <text x="270" y="520" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#10b981" text-anchor="middle">20%</text>
    <text x="270" y="570" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">Recurring</text>
    <text x="270" y="600" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">Commission</text>
    <circle cx="810" cy="400" r="120" fill="#14b8a6" opacity="0.1" />
    <text x="810" y="390" font-family="Arial, sans-serif" font-size="72" text-anchor="middle">🤝</text>
    <text x="810" y="520" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#14b8a6" text-anchor="middle">$500</text>
    <text x="810" y="570" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">Brand Collab</text>
    <text x="810" y="600" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">Bonus</text>
    <circle cx="540" cy="850" r="120" fill="#3b82f6" opacity="0.1" />
    <text x="540" y="840" font-family="Arial, sans-serif" font-size="72" text-anchor="middle">🏆</text>
    <text x="540" y="970" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#3b82f6" text-anchor="middle">$100</text>
    <text x="540" y="1020" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">Content</text>
    <text x="540" y="1050" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">Bonus</text>
    <text x="540" y="1200" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="#10b981" text-anchor="middle">Start earning today!</text>
  </svg>`;
}

function generateBenefitsCardSVG(): string {
  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="benefitsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#benefitsGrad)" />
    <text x="540" y="150" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">Ambassador Perks</text>
    <text x="120" y="350" font-family="Arial, sans-serif" font-size="48" fill="white">✓</text>
    <text x="200" y="350" font-family="Arial, sans-serif" font-size="36" fill="white">20% recurring commission</text>
    <text x="120" y="470" font-family="Arial, sans-serif" font-size="48" fill="white">✓</text>
    <text x="200" y="470" font-family="Arial, sans-serif" font-size="36" fill="white">Exclusive bonuses</text>
    <text x="120" y="590" font-family="Arial, sans-serif" font-size="48" fill="white">✓</text>
    <text x="200" y="590" font-family="Arial, sans-serif" font-size="36" fill="white">Marketing support</text>
    <text x="120" y="710" font-family="Arial, sans-serif" font-size="48" fill="white">✓</text>
    <text x="200" y="710" font-family="Arial, sans-serif" font-size="36" fill="white">Priority support</text>
    <text x="120" y="830" font-family="Arial, sans-serif" font-size="48" fill="white">✓</text>
    <text x="200" y="830" font-family="Arial, sans-serif" font-size="36" fill="white">Ambassador badge</text>
    <rect x="240" y="900" width="600" height="100" rx="50" fill="white" />
    <text x="540" y="963" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#10b981" text-anchor="middle">JOIN TODAY</text>
  </svg>`;
}

function downloadSVG(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadSVGAsPNG(svg: string, filename: string, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = document.createElement('img');
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  img.src = url;
}
