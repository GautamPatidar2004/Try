import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail, Phone, ArrowRight, FileText } from "lucide-react";
import { SEO } from "@/components/SEO";

const HostApplicationSubmitted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green/5 to-blue-50 flex items-center justify-center p-4">
      <SEO 
        title="Application Submitted" 
        description="Your host application has been submitted successfully."
        noIndex={true}
      />
      <div className="w-full max-w-2xl animate-fade-in">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle className="w-12 h-12 text-brand-green" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-brand-green to-blue-600 bg-clip-text text-transparent">
                Application Submitted!
              </CardTitle>
              <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you for your interest in becoming a Hostfluencer host. We're excited to help you start your hosting journey!
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* What happens next section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">What happens next?</h3>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Review Process</h4>
                    <p className="text-blue-700">Our team will review your profile and application within 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Personal Contact</h4>
                    <p className="text-blue-700">We'll contact you to discuss your property and hosting goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Getting Started</h4>
                    <p className="text-blue-700">Once approved, we'll guide you through setting up your first property listing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-600 mt-1" />
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    By submitting your application, you confirm that you have read and agree to our{" "}
                    <a 
                      href="/terms-of-service" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-green hover:underline font-medium"
                    >
                      Terms of Service
                    </a>
                    {" "}and understand the platform's policies regarding host-creator collaborations.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact information */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                Need to reach us?
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <Mail className="w-5 h-5 text-brand-green" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-gray-600 text-sm">support@hostfluencer.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <Phone className="w-5 h-5 text-brand-green" />
                  <div>
                    <p className="font-medium text-gray-900">Available Hours</p>
                    <p className="text-gray-600 text-sm">Monday-Friday, 9AM-6PM PST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to action buttons */}
            <div className="space-y-4 pt-6">
              <Button 
                onClick={() => navigate('/marketplace')}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-white h-14 text-lg font-semibold rounded-xl group transition-all hover:shadow-lg"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="h-12 font-medium rounded-xl border-2 hover:bg-gray-50"
                >
                  View Profile
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="h-12 font-medium rounded-xl border-2 hover:bg-gray-50"
                >
                  Back to Home
                </Button>
              </div>
            </div>

            {/* Additional reassurance */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">
                We'll send you email updates about your application status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostApplicationSubmitted;
