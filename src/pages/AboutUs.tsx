import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Building2, Users, Target, Heart, Sparkles, TrendingUp, Globe, Award } from "lucide-react";
import { SEO, generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/SEO";

const AboutUs = () => {
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "About Us", url: "/about-us" }
      ])
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Us - Hostfluencer by Voyager"
        description="Learn about Hostfluencer, the premier marketplace transforming hospitality marketing by connecting hosts with content creators for authentic collaborations."
        canonical="/about-us"
        keywords="hostfluencer about, travel tech company, hospitality content platform, voyager ecosystem"
        schema={combinedSchema}
      />
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-green/20 via-voyager-blue/10 to-background py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-brand-green/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-voyager-blue/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-full mb-6 animate-scale-in">
                <Sparkles className="w-4 h-4 text-brand-green" />
                <span className="text-sm font-medium text-brand-green">Transforming Hospitality Marketing</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-green via-voyager-blue to-brand-green bg-clip-text text-transparent">
                About Hostfluencer
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connecting Airbnb hosts with content creators to transform hospitality marketing through authentic collaborations.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-voyager-blue/10 rounded-full">
                  <Target className="w-4 h-4 text-voyager-blue" />
                  <span className="text-sm font-medium text-voyager-blue">Our Mission</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Building the Future of <span className="text-brand-green">Hospitality Content</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At Hostfluencer, we believe in the power of authentic storytelling. Our mission is to bridge the gap between exceptional accommodation providers and talented content creators, creating mutually beneficial partnerships that showcase unique stays to engaged audiences worldwide.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're revolutionizing how hospitality brands connect with their audience through genuine, creator-driven content that resonates and converts.
                </p>
                <div className="pt-4">
                  <a 
                    href="/marketplace" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-green to-voyager-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Explore Opportunities
                    <TrendingUp className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/5 p-8 rounded-2xl border border-brand-green/20 hover:border-brand-green/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-green to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">For Hosts</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get authentic marketing content that showcases your property's unique story.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-voyager-blue/10 to-voyager-blue/5 p-8 rounded-2xl border border-voyager-blue/20 hover:border-voyager-blue/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group mt-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-voyager-blue to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">For Creators</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Access amazing stays and monetize your content creation skills.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/5 p-8 rounded-2xl border border-brand-green/20 hover:border-brand-green/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-green to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">Our Approach</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Data-driven matching algorithm ensures perfect collaborations.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-voyager-blue/10 to-voyager-blue/5 p-8 rounded-2xl border border-voyager-blue/20 hover:border-voyager-blue/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group mt-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-voyager-blue to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3">Our Values</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Authenticity, transparency, and mutual success drive everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-full mb-4">
                <Award className="w-4 h-4 text-brand-green" />
                <span className="text-sm font-medium text-brand-green">Our Impact</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">Platform Achievements</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Empowering thousands of hosts and creators across the globe
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group animate-fade-in hover:scale-110 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-green/20 to-brand-green/10 rounded-2xl mb-4 group-hover:shadow-lg transition-shadow duration-300">
                  <Building2 className="w-10 h-10 text-brand-green" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-brand-green to-green-600 bg-clip-text text-transparent mb-2">10+</div>
                <div className="text-muted-foreground font-medium">Active Hosts</div>
              </div>
              
              <div className="text-center group animate-fade-in hover:scale-110 transition-transform duration-300 animation-delay-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-voyager-blue/20 to-voyager-blue/10 rounded-2xl mb-4 group-hover:shadow-lg transition-shadow duration-300">
                  <Users className="w-10 h-10 text-voyager-blue" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-voyager-blue to-blue-600 bg-clip-text text-transparent mb-2">100+</div>
                <div className="text-muted-foreground font-medium">Content Creators</div>
              </div>
              
              <div className="text-center group animate-fade-in hover:scale-110 transition-transform duration-300 animation-delay-200">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-green/20 to-brand-green/10 rounded-2xl mb-4 group-hover:shadow-lg transition-shadow duration-300">
                  <Sparkles className="w-10 h-10 text-brand-green" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-brand-green to-green-600 bg-clip-text text-transparent mb-2">10+</div>
                <div className="text-muted-foreground font-medium">Collaborations</div>
              </div>
              
              <div className="text-center group animate-fade-in hover:scale-110 transition-transform duration-300 animation-delay-300">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-voyager-blue/20 to-voyager-blue/10 rounded-2xl mb-4 group-hover:shadow-lg transition-shadow duration-300">
                  <Globe className="w-10 h-10 text-voyager-blue" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-voyager-blue to-blue-600 bg-clip-text text-transparent mb-2">10+</div>
                <div className="text-muted-foreground font-medium">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Voyager Partnership Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-voyager-blue/5 to-transparent"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-voyager-blue/10 to-voyager-blue/5 rounded-3xl p-12 md:p-16 border border-voyager-blue/20 shadow-2xl animate-fade-in">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <span className="text-sm text-muted-foreground font-medium">Powered by</span>
                  <div className="px-6 py-3 bg-voyager-blue text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    Voyager
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Part of the <span className="bg-gradient-to-r from-voyager-blue to-blue-600 bg-clip-text text-transparent">Voyager Ecosystem</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Hostfluencer is proudly part of Voyager, an innovative travel technology company building the future of connected travel experiences. As part of the Voyager ecosystem, we leverage cutting-edge AI and marketplace technology to create seamless connections between hosts and creators.
                </p>
              </div>
              
              <div className="flex justify-center">
                <a 
                  href="https://myvoyager.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-voyager-blue text-white rounded-xl font-semibold hover:bg-voyager-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-voyager-blue text-lg font-bold">V</span>
                  </div>
                  Learn More About Voyager
                  <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-green via-voyager-blue to-brand-green"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Join Our Community</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of hosts and creators building authentic partnerships that drive real results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/marketplace" 
                className="group px-8 py-4 bg-white text-brand-green rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Browse Opportunities
                <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <a 
                href="/auth" 
                className="group px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Get Started Today
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
