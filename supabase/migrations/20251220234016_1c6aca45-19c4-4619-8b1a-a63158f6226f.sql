-- Enable pg_net extension for making HTTP requests from cron
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Create the scheduled analytics sync cron job
-- Runs twice daily at 6 AM and 6 PM UTC
SELECT
  cron.schedule(
    'sync-instagram-analytics-morning',
    '0 6 * * *', -- 6 AM UTC daily
    $$
    SELECT
      net.http_post(
        url:='https://dkahqqmcmwfaxjxmfxne.supabase.co/functions/v1/scheduled-analytics-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYWhxcW1jbXdmYXhqeG1meG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzc2OTIsImV4cCI6MjA1ODQxMzY5Mn0.VBfnFtDkT3hMivPw7lY3L2Cs2jHk_Hyza2eKcvK5b-Y"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );

SELECT
  cron.schedule(
    'sync-instagram-analytics-evening',
    '0 18 * * *', -- 6 PM UTC daily
    $$
    SELECT
      net.http_post(
        url:='https://dkahqqmcmwfaxjxmfxne.supabase.co/functions/v1/scheduled-analytics-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYWhxcW1jbXdmYXhqeG1meG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzc2OTIsImV4cCI6MjA1ODQxMzY5Mn0.VBfnFtDkT3hMivPw7lY3L2Cs2jHk_Hyza2eKcvK5b-Y"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );