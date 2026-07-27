-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to boost post views every 5 minutes
SELECT cron.schedule(
  'boost-post-views',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dkahqqmcmwfaxjxmfxne.supabase.co/functions/v1/boost-post-views',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYWhxcW1jbXdmYXhqeG1meG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDQxMzIsImV4cCI6MjA2NTc4MDEzMn0.Zmj1n9Sw7ykm5VKgM7PtVaqjuLPSAmgjjFZYEMjhZsA"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
