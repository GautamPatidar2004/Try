-- Add missing triggers for automatic badge progress tracking

-- Trigger for applications table
DROP TRIGGER IF EXISTS update_badge_progress_on_application ON applications;
CREATE TRIGGER update_badge_progress_on_application
AFTER INSERT OR UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

-- Trigger for content_posts table
DROP TRIGGER IF EXISTS update_badge_progress_on_content ON content_posts;
CREATE TRIGGER update_badge_progress_on_content
AFTER INSERT OR UPDATE ON content_posts
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

-- Trigger for collaboration_agreements table
DROP TRIGGER IF EXISTS update_badge_progress_on_collaboration ON collaboration_agreements;
CREATE TRIGGER update_badge_progress_on_collaboration
AFTER INSERT OR UPDATE ON collaboration_agreements
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();

-- Trigger for reviews_and_ratings table
DROP TRIGGER IF EXISTS update_badge_progress_on_review ON reviews_and_ratings;
CREATE TRIGGER update_badge_progress_on_review
AFTER INSERT OR UPDATE ON reviews_and_ratings
FOR EACH ROW
EXECUTE FUNCTION update_badge_progress();