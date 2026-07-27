
-- Create user profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('host', 'influencer')),
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  location TEXT,
  profile_photo_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hosts table for host-specific data
CREATE TABLE public.hosts (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  response_rate INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  preferred_collaboration_types TEXT[] DEFAULT '{}',
  min_follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create influencers table for influencer-specific data
CREATE TABLE public.influencers (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  content_niches TEXT[] DEFAULT '{}',
  rate_range_min INTEGER,
  rate_range_max INTEGER,
  collaboration_preferences TEXT[] DEFAULT '{}',
  total_followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table for host listings
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 1,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[] DEFAULT '{}',
  content_requirements TEXT[] DEFAULT '{}',
  collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('free_stay', 'discount', 'paid')),
  discount_percentage INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property images table
CREATE TABLE public.property_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social accounts table for influencer social media connections
CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  username TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  profile_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(influencer_id, platform)
);

-- Create applications table for influencer applications to properties
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  proposal_message TEXT,
  proposed_dates_start DATE,
  proposed_dates_end DATE,
  content_deliverables TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, influencer_id)
);

-- Create messages table for communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for hosts
CREATE POLICY "Anyone can view host profiles" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Hosts can update their own data" ON public.hosts FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Hosts can insert their own data" ON public.hosts FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for influencers
CREATE POLICY "Anyone can view influencer profiles" ON public.influencers FOR SELECT USING (true);
CREATE POLICY "Influencers can update their own data" ON public.influencers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Influencers can insert their own data" ON public.influencers FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for properties
CREATE POLICY "Anyone can view active properties" ON public.properties FOR SELECT USING (is_active = true);
CREATE POLICY "Hosts can manage their own properties" ON public.properties FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.hosts WHERE id = host_id)
);

-- Create RLS policies for property images
CREATE POLICY "Anyone can view property images" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Property owners can manage images" ON public.property_images FOR ALL USING (
  auth.uid() IN (
    SELECT h.id FROM public.hosts h 
    JOIN public.properties p ON h.id = p.host_id 
    WHERE p.id = property_id
  )
);

-- Create RLS policies for social accounts
CREATE POLICY "Anyone can view social accounts" ON public.social_accounts FOR SELECT USING (true);
CREATE POLICY "Influencers can manage their own social accounts" ON public.social_accounts FOR ALL USING (auth.uid() = influencer_id);

-- Create RLS policies for applications
CREATE POLICY "Users can view applications they're involved in" ON public.applications FOR SELECT USING (
  auth.uid() = influencer_id OR 
  auth.uid() IN (SELECT host_id FROM public.properties WHERE id = property_id)
);
CREATE POLICY "Influencers can create applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = influencer_id);
CREATE POLICY "Users can update applications they're involved in" ON public.applications FOR UPDATE USING (
  auth.uid() = influencer_id OR 
  auth.uid() IN (SELECT host_id FROM public.properties WHERE id = property_id)
);

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_properties_host_id ON public.properties(host_id);
CREATE INDEX idx_properties_active ON public.properties(is_active) WHERE is_active = true;
CREATE INDEX idx_applications_property_id ON public.applications(property_id);
CREATE INDEX idx_applications_influencer_id ON public.applications(influencer_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_messages_application_id ON public.messages(application_id);
CREATE INDEX idx_social_accounts_influencer_id ON public.social_accounts(influencer_id);
