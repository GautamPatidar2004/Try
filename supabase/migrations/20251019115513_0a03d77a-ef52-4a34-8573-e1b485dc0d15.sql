-- Create Restaurant Owners Table
CREATE TABLE IF NOT EXISTS restaurant_owners (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_license_number TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'unverified')),
  verification_documents JSONB DEFAULT '[]'::jsonb,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  response_rate INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_collaborations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES restaurant_owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  cuisine_types TEXT[] NOT NULL DEFAULT '{}',
  dining_style TEXT NOT NULL,
  price_range TEXT NOT NULL,
  dietary_options TEXT[] DEFAULT '{}',
  ambiance TEXT[] DEFAULT '{}',
  meal_types TEXT[] NOT NULL DEFAULT '{}',
  
  seating_capacity INTEGER,
  has_outdoor_seating BOOLEAN DEFAULT false,
  has_private_dining BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  
  collaboration_types TEXT[] NOT NULL DEFAULT '{}',
  content_requirements TEXT[] DEFAULT '{}',
  min_follower_count INTEGER DEFAULT 0,
  paid_rate_min INTEGER,
  paid_rate_max INTEGER,
  currency TEXT DEFAULT 'usd',
  
  operating_hours JSONB DEFAULT '{}'::jsonb,
  booking_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  advance_booking_hours INTEGER DEFAULT 24,
  max_party_size INTEGER DEFAULT 6,
  
  is_active BOOLEAN DEFAULT true,
  admin_deactivated BOOLEAN DEFAULT false,
  admin_notes TEXT,
  featured BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(city, country);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active, admin_deactivated);

-- Create Restaurant Images Table
CREATE TABLE IF NOT EXISTS restaurant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'general',
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_primary ON restaurant_images(restaurant_id, is_primary);

-- Create Restaurant Menu Table
CREATE TABLE IF NOT EXISTS restaurant_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_signature_dish BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON restaurant_menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_category ON restaurant_menus(restaurant_id, category);

-- Create Restaurant Bookings Table
CREATE TABLE IF NOT EXISTS restaurant_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 1,
  meal_type TEXT NOT NULL,
  
  collaboration_type TEXT NOT NULL,
  content_deliverables TEXT[] DEFAULT '{}',
  content_deadline DATE,
  proposed_rate INTEGER,
  currency TEXT DEFAULT 'usd',
  
  proposal_message TEXT,
  special_requests TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed', 'cancelled', 'no_show')),
  decline_reason TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  
  content_delivery_status TEXT DEFAULT 'pending' CHECK (content_delivery_status IN ('pending', 'submitted', 'approved', 'revision_requested')),
  delivered_at TIMESTAMPTZ,
  approved_by_owner_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_booking_date CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT valid_party_size CHECK (party_size > 0 AND party_size <= 20)
);

CREATE INDEX IF NOT EXISTS idx_bookings_restaurant ON restaurant_bookings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_influencer ON restaurant_bookings(influencer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON restaurant_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON restaurant_bookings(booking_date, restaurant_id);

-- Create Restaurant Reviews Table
CREATE TABLE IF NOT EXISTS restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES restaurant_bookings(id) ON DELETE CASCADE UNIQUE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_type TEXT NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  food_quality INTEGER CHECK (food_quality >= 1 AND food_quality <= 5),
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  
  review_text TEXT,
  would_recommend BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON restaurant_reviews(booking_id);

-- Row-Level Security Policies
ALTER TABLE restaurant_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- Restaurant Owners Policies
CREATE POLICY "Restaurant owners can view their own data" ON restaurant_owners FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Restaurant owners can update their own data" ON restaurant_owners FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Restaurant owners can insert their own data" ON restaurant_owners FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all restaurant owners" ON restaurant_owners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Restaurants Policies
CREATE POLICY "Anyone can view active restaurants" ON restaurants FOR SELECT USING (is_active = true AND admin_deactivated = false);
CREATE POLICY "Restaurant owners can manage their restaurants" ON restaurants FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all restaurants" ON restaurants FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Restaurant Images Policies
CREATE POLICY "Anyone can view restaurant images" ON restaurant_images FOR SELECT USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_images.restaurant_id AND r.is_active = true));
CREATE POLICY "Restaurant owners can manage their images" ON restaurant_images FOR ALL USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_images.restaurant_id AND r.owner_id = auth.uid()));

-- Restaurant Menus Policies
CREATE POLICY "Anyone can view available menu items" ON restaurant_menus FOR SELECT USING (is_available = true AND EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_menus.restaurant_id AND r.is_active = true));
CREATE POLICY "Restaurant owners can manage their menus" ON restaurant_menus FOR ALL USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_menus.restaurant_id AND r.owner_id = auth.uid()));

-- Restaurant Bookings Policies
CREATE POLICY "Influencers can view their bookings" ON restaurant_bookings FOR SELECT USING (auth.uid() = influencer_id);
CREATE POLICY "Restaurant owners can view bookings for their restaurants" ON restaurant_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_bookings.restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "Influencers can create bookings" ON restaurant_bookings FOR INSERT WITH CHECK (auth.uid() = influencer_id);
CREATE POLICY "Influencers can update their pending bookings" ON restaurant_bookings FOR UPDATE USING (auth.uid() = influencer_id AND status = 'pending');
CREATE POLICY "Restaurant owners can update bookings for their restaurants" ON restaurant_bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_bookings.restaurant_id AND r.owner_id = auth.uid()));

-- Restaurant Reviews Policies
CREATE POLICY "Anyone can view reviews" ON restaurant_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their completed bookings" ON restaurant_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND EXISTS (SELECT 1 FROM restaurant_bookings rb WHERE rb.id = restaurant_reviews.booking_id AND rb.status = 'completed' AND (rb.influencer_id = auth.uid() OR EXISTS (SELECT 1 FROM restaurants r WHERE r.id = rb.restaurant_id AND r.owner_id = auth.uid()))));

-- Database Functions and Triggers
CREATE OR REPLACE FUNCTION update_restaurant_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants SET average_rating = (SELECT COALESCE(AVG(rating), 0) FROM restaurant_reviews WHERE restaurant_id = NEW.restaurant_id) WHERE id = NEW.restaurant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER restaurant_review_rating_trigger AFTER INSERT OR UPDATE ON restaurant_reviews FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

CREATE OR REPLACE FUNCTION validate_booking_advance() RETURNS TRIGGER AS $$
DECLARE
  booking_datetime TIMESTAMPTZ;
  min_advance_hours INTEGER;
BEGIN
  booking_datetime := (NEW.booking_date::timestamp + NEW.booking_time);
  SELECT COALESCE(advance_booking_hours, 24) INTO min_advance_hours FROM restaurants WHERE id = NEW.restaurant_id;
  IF booking_datetime < (NOW() + (min_advance_hours || ' hours')::INTERVAL) THEN
    RAISE EXCEPTION 'Booking must be at least % hours in advance', min_advance_hours;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_booking_advance BEFORE INSERT OR UPDATE OF booking_date, booking_time ON restaurant_bookings FOR EACH ROW EXECUTE FUNCTION validate_booking_advance();

CREATE OR REPLACE FUNCTION update_restaurant_owner_stats() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE restaurant_owners SET total_collaborations = total_collaborations + 1 WHERE id = (SELECT owner_id FROM restaurants WHERE id = NEW.restaurant_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER restaurant_owner_stats_trigger AFTER UPDATE ON restaurant_bookings FOR EACH ROW EXECUTE FUNCTION update_restaurant_owner_stats();

CREATE OR REPLACE FUNCTION update_restaurant_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_restaurant_updated_at();
CREATE TRIGGER update_restaurant_owners_updated_at BEFORE UPDATE ON restaurant_owners FOR EACH ROW EXECUTE FUNCTION update_restaurant_updated_at();
CREATE TRIGGER update_restaurant_menus_updated_at BEFORE UPDATE ON restaurant_menus FOR EACH ROW EXECUTE FUNCTION update_restaurant_updated_at();
CREATE TRIGGER update_restaurant_bookings_updated_at BEFORE UPDATE ON restaurant_bookings FOR EACH ROW EXECUTE FUNCTION update_restaurant_updated_at();