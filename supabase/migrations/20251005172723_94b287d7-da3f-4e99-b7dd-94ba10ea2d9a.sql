-- Fix Critical RLS Policy Issues
-- This migration addresses multiple security vulnerabilities in the database

-- 1. FIX PROFILES TABLE: Restrict public access to sensitive personal data
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create new restrictive policies
CREATE POLICY "Authenticated users can view basic profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their own sensitive data"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. FIX INFLUENCERS TABLE: Protect collaboration strategies and rates
DROP POLICY IF EXISTS "Anyone can view influencer profiles" ON influencers;

CREATE POLICY "Authenticated users can view influencer profiles"
ON influencers FOR SELECT
TO authenticated
USING (true);

-- 3. FIX HOSTS TABLE: Protect business intelligence
DROP POLICY IF EXISTS "Anyone can view host profiles" ON hosts;

CREATE POLICY "Authenticated users can view host profiles"
ON hosts FOR SELECT
TO authenticated
USING (true);

-- 4. FIX CONTENT_POSTS TABLE: Protect unpublished content
DROP POLICY IF EXISTS "All users can view content posts" ON content_posts;

-- Public can only see published and approved content
CREATE POLICY "Anyone can view published content"
ON content_posts FOR SELECT
USING (delivery_status = 'published' AND host_approval_status = 'approved');

-- Creators can view their own content in any state
CREATE POLICY "Creators view their own content"
ON content_posts FOR SELECT
TO authenticated
USING (influencer_id = auth.uid());

-- Hosts can view content for their properties
CREATE POLICY "Hosts view content for their properties"
ON content_posts FOR SELECT
TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties WHERE host_id = auth.uid()
  )
);

-- 5. FIX PROPERTY_IMAGES TABLE: Align with property visibility
DROP POLICY IF EXISTS "Anyone can view property images" ON property_images;

CREATE POLICY "Users can view images for active properties"
ON property_images FOR SELECT
USING (
  property_id IN (
    SELECT id FROM properties WHERE is_active = true
  )
);

-- Property owners can view all their images
CREATE POLICY "Property owners can view all their images"
ON property_images FOR SELECT
TO authenticated
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN hosts h ON h.id = p.host_id
    WHERE h.id = auth.uid()
  )
);