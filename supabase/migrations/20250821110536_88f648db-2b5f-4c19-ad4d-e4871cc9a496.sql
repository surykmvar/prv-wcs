-- Create a cron job to refresh trending topics daily at 6 AM UTC
-- This requires pg_cron extension to be enabled
SELECT cron.schedule(
  'refresh-trending-topics',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://ijtpdrsoddgjwyeiqalg.supabase.co/functions/v1/fetch-trending-topics',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqdHBkcnNvZGRnand5ZWlxYWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODQxNDgsImV4cCI6MjA2NzU2MDE0OH0.5AXDX7qcjECg71g3NYhEXebDaHn6X06YCDFIpPBgfLM"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);