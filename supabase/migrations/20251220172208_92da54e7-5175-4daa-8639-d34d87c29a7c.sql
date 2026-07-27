-- Delete demo/seed campaigns from brand_campaigns table
DELETE FROM brand_campaigns 
WHERE id IN (
  '95f1c63b-ed12-4eff-b32a-a455ed8ae7b5',  -- Adventure Gear Co - Summer Adventure Campaign
  '69e03308-890d-4078-90cd-aef93ded48de',  -- FitLife Nutrition - Fitness Transformation Series
  '0518ad72-9a6d-4cf1-b60d-714bc1c5e4e2',  -- EcoStyle Fashion - Sustainable Fashion Collaboration
  'dffdf2ac-a272-4993-9c81-617014091dde',  -- TechNova - Smart Home Device Review
  '86b0b3ea-0e2c-4aed-a0df-2c8a55ee85e4'   -- Gourmet Bites - Food Influencer Partnership
);