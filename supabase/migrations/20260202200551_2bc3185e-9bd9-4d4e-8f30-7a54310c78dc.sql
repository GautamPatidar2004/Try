-- Create a view that aggregates reviews per property through the relationship chain
CREATE OR REPLACE VIEW property_review_stats AS
SELECT 
  a.property_id,
  COUNT(r.id)::integer as review_count,
  ROUND(AVG(r.rating)::numeric, 1) as average_rating
FROM reviews_and_ratings r
JOIN collaboration_agreements ca ON r.agreement_id = ca.id
JOIN applications a ON ca.application_id = a.id
WHERE r.is_hidden = false AND r.is_public = true
GROUP BY a.property_id;