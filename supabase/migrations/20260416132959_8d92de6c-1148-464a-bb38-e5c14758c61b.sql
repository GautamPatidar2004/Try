SELECT cron.schedule(
  'process-automations',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dkahqqmcmwfaxjxmfxne.supabase.co/functions/v1/process-automations',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYWhxcW1jbXdmYXhqeG1meG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDQxMzIsImV4cCI6MjA2NTc4MDEzMn0.Zmj1n9Sw7ykm5VKgM7PtVaqjuLPSAmgjjFZYEMjhZsA"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);