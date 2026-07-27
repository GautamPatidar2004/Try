import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Building2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrandSetupStepProps {
  onComplete: () => void;
}

export const BrandSetupStep: React.FC<BrandSetupStepProps> = ({ onComplete }) => {
  const [brandData, setBrandData] = useState({
    company_name: '',
    brand_name: '',
    website: '',
    industry: '',
    description: '',
    budget_range: '',
    contact_email: '',
    contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setBrandData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      brandData.company_name.trim().length > 0 &&
      brandData.brand_name.trim().length > 0 &&
      brandData.industry.length > 0 &&
      brandData.description.trim().length >= 50 &&
      brandData.budget_range.length > 0 &&
      brandData.contact_email.trim().length > 0
    );
  };

  const handleComplete = async () => {
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert brand data into brands table
      const { error: brandError } = await supabase
        .from('brands')
        .upsert({
          user_id: user.id,
          company_name: brandData.company_name.trim(),
          brand_name: brandData.brand_name.trim(),
          website: brandData.website.trim() || null,
          industry: brandData.industry,
          description: brandData.description.trim(),
          budget_range: brandData.budget_range,
          contact_email: brandData.contact_email.trim(),
          contact_phone: brandData.contact_phone.trim() || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (brandError) throw brandError;

      // Update profile with brand user type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: 'brand',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Send welcome email (non-blocking)
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { user_id: user.id }
        });
      } catch (emailError) {
        console.error('Welcome email failed (non-blocking):', emailError);
      }

      toast({
        title: "🎉 Brand Profile Created!",
        description: "Welcome to the platform. Start connecting with creators!",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error creating brand profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create brand profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold">Welcome, Brand Partner! ✨</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Let's set up your brand profile to connect with amazing creators
        </p>
      </motion.div>

      {/* Brand Setup Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Brand Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-base font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                value={brandData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter your company name"
                className="text-base"
              />
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="brand_name" className="text-base font-medium">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand_name"
                value={brandData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Enter your brand name"
                className="text-base"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-base font-medium">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={brandData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourbrand.com"
                className="text-base"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-base font-medium">
                Industry <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={brandData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel & Tourism</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                  <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="health_wellness">Health & Wellness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Brand Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={brandData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your brand and what makes it special (minimum 50 characters)"
                className="min-h-[120px] text-base resize-none"
              />
              <p className={`text-sm ${
                brandData.description.length >= 50 ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {brandData.description.length}/50 characters minimum
              </p>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label htmlFor="budget_range" className="text-base font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Campaign Budget <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={brandData.budget_range} 
                onValueChange={(value) => handleInputChange('budget_range', value)}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_5k">Under $5,000</SelectItem>
                  <SelectItem value="5k_15k">$5,000 - $15,000</SelectItem>
                  <SelectItem value="15k_30k">$15,000 - $30,000</SelectItem>
                  <SelectItem value="30k_50k">$30,000 - $50,000</SelectItem>
                  <SelectItem value="50k_plus">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-base font-medium">
                Contact Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={brandData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contact@yourbrand.com"
                className="text-base"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-base font-medium">
                Contact Phone
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                value={brandData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="text-base"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Complete Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button 
          onClick={handleComplete}
          disabled={loading || !isFormValid()}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 text-lg py-6"
        >
          {loading ? "Setting up your brand..." : "🚀 Complete Brand Setup"}
        </Button>
      </motion.div>
    </div>
  );
};
