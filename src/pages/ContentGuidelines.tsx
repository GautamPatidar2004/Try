import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Printer, Camera, FileText, Shield, CheckCircle, Award, Users } from "lucide-react";
import Footer from "@/components/Footer";

const ContentGuidelines = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hostfluencer – Content Guidelines</h1>
              <p className="text-gray-600">For Travel Influencers & Content Creators</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="hidden md:flex">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#section-1" className="text-brand-green hover:underline flex items-center gap-2">
                <Camera className="w-4 h-4" />
                1. Deliverables & Content Types
              </a>
              <a href="#section-2" className="text-brand-green hover:underline flex items-center gap-2">
                <FileText className="w-4 h-4" />
                2. Content Guidelines
              </a>
              <a href="#section-3" className="text-brand-green hover:underline flex items-center gap-2">
                <Shield className="w-4 h-4" />
                3. Compliance & Disclosures
              </a>
              <a href="#section-4" className="text-brand-green hover:underline flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                4. Approval & Review Process
              </a>
              <a href="#section-5" className="text-brand-green hover:underline flex items-center gap-2">
                <Award className="w-4 h-4" />
                5. Quality Standards
              </a>
              <a href="#section-6" className="text-brand-green hover:underline flex items-center gap-2">
                <Users className="w-4 h-4" />
                6. Rights & Usage
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Content Guidelines */}
        <Card>
          <CardContent className="p-8 prose prose-gray max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <p className="text-lg leading-relaxed mb-6">
                  Welcome to Hostfluencer! These content guidelines help ensure successful collaborations between hosts and travel influencers. Following these standards creates authentic, high-quality content that benefits both parties and their audiences.
                </p>
                <p className="leading-relaxed">
                  By participating in collaborations through our platform, you agree to follow these guidelines and maintain the professional standards expected by our community.
                </p>
              </div>

              {/* Section 1 - Deliverables */}
              <section id="section-1">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-bold text-gray-900">1. DELIVERABLES & CONTENT TYPES</h2>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Default Templates</h3>
                <p className="leading-relaxed mb-4">Standard collaborations typically include:</p>
                <div className="bg-brand-green/5 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>1 Instagram Feed Post</strong> - High-quality image with engaging caption</li>
                    <li><strong>3 Instagram Stories</strong> - Behind-the-scenes content, property highlights, or experiences</li>
                    <li><strong>1 TikTok/Reel</strong> - Short-form video showcasing the property or experience (15-60 seconds)</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Optional Extras</h3>
                <p className="leading-relaxed mb-2">Additional content may be requested for enhanced collaborations:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Blog Article:</strong> In-depth travel guide or review (800+ words)</li>
                  <li><strong>YouTube Vlog:</strong> Property tour or travel experience (5-15 minutes)</li>
                  <li><strong>Carousel Photos:</strong> Multiple high-resolution images for Instagram</li>
                  <li><strong>Affiliate/Promo Code Integration:</strong> Custom booking codes with tracking</li>
                  <li><strong>Pinterest Boards:</strong> Curated travel inspiration content</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 UGC Delivery</h3>
                <p className="leading-relaxed mb-2">User-Generated Content (UGC) requirements:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>High-resolution photos and videos delivered directly to hosts</li>
                  <li>Raw footage available for host's future marketing use</li>
                  <li>Minimum resolution: 1080p for photos, 4K preferred for videos</li>
                  <li>Files delivered via cloud storage (Google Drive, Dropbox, WeTransfer)</li>
                </ul>
              </section>

              {/* Section 2 - Content Guidelines */}
              <section id="section-2">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-bold text-gray-900">2. CONTENT GUIDELINES</h2>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Property Feature Requirements</h3>
                <p className="leading-relaxed mb-4">Content must highlight key property features as specified by the host:</p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2">Examples of features to showcase:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Infinity pool or unique amenities</li>
                    <li>Spa facilities or wellness features</li>
                    <li>Scenic views or location advantages</li>
                    <li>Unique architecture or design elements</li>
                    <li>Local experiences or activities</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Location & Hashtag Requirements</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Use property-specific location tags when available</li>
                  <li>Include destination hashtags provided by host</li>
                  <li>Tag the property's official social media accounts</li>
                  <li>Use relevant travel and lifestyle hashtags</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Prohibited Themes</h3>
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-red-800 mb-2">Avoid the following content:</p>
                  <ul className="list-disc pl-6 space-y-1 text-red-700">
                    <li>Political statements or controversial topics</li>
                    <li>Off-brand content that doesn't align with property values</li>
                    <li>Negative commentary about the destination or property</li>
                    <li>Content that may offend cultural sensitivities</li>
                    <li>Promotion of competing properties or services</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.4 Privacy & Respect</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Respect off-limit areas as designated by the host</li>
                  <li>Avoid featuring other guests without consent</li>
                  <li>Follow property rules and local regulations</li>
                  <li>Be mindful of noise levels and staff during content creation</li>
                </ul>
              </section>

              {/* Section 3 - Compliance */}
              <section id="section-3">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-bold text-gray-900">3. COMPLIANCE & DISCLOSURES</h2>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Mandatory Disclosures</h3>
                <p className="leading-relaxed mb-4">All sponsored content must include clear disclosure:</p>
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2">Required disclosure options:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><code className="bg-gray-100 px-1 rounded">#ad</code> or <code className="bg-gray-100 px-1 rounded">#sponsored</code></li>
                    <li><code className="bg-gray-100 px-1 rounded">#hosted</code> for complimentary stays</li>
                    <li>"Thanks to [Property Name] for hosting me"</li>
                    <li>"Paid partnership with [Property Name]"</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Disclosure Placement</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Instagram Posts:</strong> Include disclosure in the first 3 lines of caption</li>
                  <li><strong>Stories:</strong> Use Instagram's "Paid Partnership" feature or text overlay</li>
                  <li><strong>TikTok/Reels:</strong> Include in caption and consider on-screen text</li>
                  <li><strong>Blog Posts:</strong> Disclosure at the beginning of the article</li>
                  <li><strong>YouTube:</strong> Verbal disclosure in first 30 seconds + description</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Legal Compliance</h3>
                <p className="leading-relaxed mb-4">Content must comply with:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>FTC guidelines for sponsored content</li>
                  <li>Platform-specific advertising policies</li>
                  <li>Local advertising standards and regulations</li>
                  <li>International disclosure requirements where applicable</li>
                </ul>
              </section>

              {/* Section 4 - Approval & Review */}
              <section id="section-4">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-bold text-gray-900">4. APPROVAL & REVIEW PROCESS</h2>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Content Requiring Approval</h3>
                <p className="leading-relaxed mb-2">Hosts may request draft approval for:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Blog Articles:</strong> Full drafts 48 hours before publication</li>
                  <li><strong>YouTube Videos:</strong> Script or rough cut for review</li>
                  <li><strong>Major Campaigns:</strong> Multi-platform content strategies</li>
                  <li><strong>Brand-sensitive Content:</strong> Luxury properties or exclusive experiences</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Quick Social Posts</h3>
                <p className="leading-relaxed mb-4">The following typically don't require pre-approval:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Instagram Stories (standard travel content)</li>
                  <li>Feed posts following agreed guidelines</li>
                  <li>TikToks/Reels showcasing property features</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Submission & Tracking</h3>
                <p className="leading-relaxed mb-2">After publication, influencers must:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Submit content links through the Hostfluencer platform</li>
                  <li>Upload screenshots or files as proof of delivery</li>
                  <li>Enable automatic detection via hashtags and tags</li>
                  <li>Provide analytics and engagement metrics when requested</li>
                </ul>
              </section>

              {/* Section 5 - Quality Standards */}
              <section id="section-5">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-bold text-gray-900">5. QUALITY STANDARDS</h2>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Visual Quality Requirements</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2">Photography Standards:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>High-resolution, well-lit, and properly composed images</li>
                    <li>Professional editing with consistent aesthetic</li>
                    <li>Clear focus and appropriate exposure</li>
                    <li>Authentic representation of the property and experience</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Content Standards</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Writing:</strong> Clear, engaging, and grammatically correct</li>
                  <li><strong>Storytelling:</strong> Authentic experiences with personal insights</li>
                  <li><strong>Engagement:</strong> Content that encourages audience interaction</li>
                  <li><strong>Value:</strong> Helpful information for potential guests</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Prohibited Content</h3>
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-red-800 mb-2">Unacceptable content includes:</p>
                  <ul className="list-disc pl-6 space-y-1 text-red-700">
                    <li>Profanity or inappropriate language</li>
                    <li>Risqué or inappropriate imagery</li>
                    <li>Off-brand tones that don't match property values</li>
                    <li>Low-quality, blurry, or poorly composed visuals</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.4 Performance Consequences</h3>
                <p className="leading-relaxed mb-2">Influencers who consistently underdeliver may face:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Lower tier status affecting future collaboration opportunities</li>
                  <li>Reduced priority in host selection processes</li>
                  <li>Required additional approval steps for future content</li>
                  <li>Potential removal from the platform for severe violations</li>
                </ul>
              </section>

              {/* Section 6 - Rights & Usage */}
              <section id="section-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-bold text-gray-900">6. RIGHTS & USAGE</h2>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Content Usage Rights</h3>
                <p className="leading-relaxed mb-4">Usage rights are established upfront in collaboration contracts:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Standard Rights:</strong> Host may share/repost content with proper credit</li>
                  <li><strong>Extended Rights:</strong> Use in marketing materials, websites, and advertisements</li>
                  <li><strong>Exclusive Rights:</strong> Commercial usage with additional compensation</li>
                  <li><strong>Time Limits:</strong> Usage rights duration specified in agreements</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Content Retention Requirements</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2">Influencers must maintain content for agreed periods:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Instagram Posts:</strong> Minimum 6 months (unless specified otherwise)</li>
                    <li><strong>Stories:</strong> Standard 24-hour duration</li>
                    <li><strong>Blog Articles:</strong> Permanent (or minimum 12 months)</li>
                    <li><strong>YouTube Videos:</strong> Minimum 12 months</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Analytics & Reporting</h3>
                <p className="leading-relaxed mb-2">Metric tracking and reporting requirements:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Automatic metric pull where platform APIs allow</li>
                  <li>Manual reporting of impressions, likes, comments, and clicks</li>
                  <li>Booking attribution tracking through special codes/links</li>
                  <li>Quarterly performance reports for ongoing partnerships</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">6.4 Mutual Reviews</h3>
                <p className="leading-relaxed mb-4">After collaboration completion:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Both hosts and influencers leave mutual reviews</li>
                  <li>Reviews contribute to reputation and tier status</li>
                  <li>Honest feedback helps improve future collaborations</li>
                  <li>Reviews are visible to platform users for transparency</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Questions or Support?</h3>
                <p className="leading-relaxed mb-4">
                  If you have questions about these content guidelines or need clarification on specific requirements, please contact our support team:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:creators@hostfluencer.com" className="text-brand-green hover:underline">
                    creators@hostfluencer.com
                  </a>
                  <a href="/help" className="text-brand-green hover:underline">
                    Help & Support Center
                  </a>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Back to Top Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={scrollToTop} 
            variant="outline"
            className="shadow-lg"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContentGuidelines;