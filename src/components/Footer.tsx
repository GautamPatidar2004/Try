
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          <div className="col-span-2">
            <img 
              src="/lovable-uploads/c7e9e925-4019-4cae-91db-cf1399918f0a.png" 
              alt="Hostfluencer" 
              className="h-10 md:h-12 mb-4"
            />
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500">Powered by</span>
              <a 
                href="https://myvoyager.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-voyager-blue text-white rounded text-xs font-medium hover:bg-voyager-blue/90 transition-colors"
              >
                Voyager
              </a>
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-sm md:text-base">
              The easiest way for property owners to build a professional content library. Trade empty nights for marketing assets you own forever.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <a href="https://x.com/hostfluencer" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-green transition-colors p-2 -m-2">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/hostfluencer/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-green transition-colors p-2 -m-2">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/hostfluencer" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-green transition-colors p-2 -m-2">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@hostfluencer.com" className="text-gray-400 hover:text-brand-green transition-colors p-2 -m-2">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">For Hosts</h4>
            <ul className="space-y-2 md:space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors py-2 block text-sm">List Property</a></li>
              <li><a href="#" className="hover:text-white transition-colors py-2 block text-sm">Find Creators</a></li>
              <li><a href="#" className="hover:text-white transition-colors py-2 block text-sm">Host Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">For Creators</h4>
            <ul className="space-y-2 md:space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors py-2 block text-sm">Browse Stays</a></li>
              <li><a href="/content-guidelines" className="hover:text-white transition-colors py-2 block text-sm">Content Guidelines</a></li>
              <li><a href="/creator-resources" className="hover:text-white transition-colors py-2 block text-sm">Creator Resources</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-1 text-gray-400 grid grid-cols-2 md:grid-cols-1 gap-x-4">
              <li><a href="/about-us" className="hover:text-white transition-colors py-2 block text-sm">About Us</a></li>
              <li><a href="/terms-of-service" className="hover:text-white transition-colors py-2 block text-sm">Terms of Service</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition-colors py-2 block text-sm">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors py-2 block text-sm">Cookie Policy</a></li>
              <li><a href="/help" className="hover:text-white transition-colors py-2 block text-sm">Help & Support</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors py-2 block text-sm">Blog</a></li>
              <li><a href="https://hostfluencerx.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors py-2 block text-sm">HostfluencerX</a></li>
              <li><a href="/sitemap.xml" className="hover:text-white transition-colors py-2 block text-sm">Sitemap</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
              © 2025 Hostfluencer, a Voyager company. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://myvoyager.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -m-2"
              >
                <div className="w-5 h-5 bg-voyager-blue rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
                <span className="text-sm">Visit Voyager</span>
              </a>
            </div>
          </div>
          <p className="text-gray-400 text-xs md:text-sm text-center">
            Made by <img src="/lovable-uploads/f6345ab9-57f4-49a0-acde-a9f6322960de.png" alt="H" className="w-4 h-4 mx-1 inline" /> for hosts and creators worldwide • Part of the Voyager travel ecosystem
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
