-- Setup secure cron job for trending topics with secret authentication

-- Delete any existing cron jobs for trending topics
SELECT cron.unschedule('fetch-trending-topics-daily');
SELECT cron.unschedule('invoke-function-every-minute');

-- Create new secure cron job that includes the secret header
-- This will run every 6 hours to refresh trending topics
SELECT cron.schedule(
  'fetch-trending-topics-secure',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
      url := 'https://ijtpdrsoddgjwyeiqalg.supabase.co/functions/v1/fetch-trending-topics',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-task-secret', current_setting('app.fetch_trending_secret', true)
      ),
      body := jsonb_build_object(
        'style', 'genz',
        'maxEmojis', 2,
        'forceRefresh', true,
        'safeMode', 'strict'
      )
    ) as request_id;
  $$
);

-- Set the secret as a database setting (will need to be updated manually with actual secret)
-- This is a placeholder - the actual secret should be set separately
-- ALTER DATABASE postgres SET app.fetch_trending_secret = 'your-secret-here';