-- Enable pg_cron extension (must be enabled in Supabase dashboard first)
-- This file assumes pg_cron is already enabled

-- Schedule the call check to run every hour at minute 0
-- This will check for any scheduled calls and trigger them
SELECT cron.schedule(
  'check-scheduled-calls',        -- Job name
  '0 * * * *',                     -- Cron expression: every hour at minute 0
  'SELECT public.trigger_scheduled_calls();'
);

-- Optional: You can also schedule it to run every 30 minutes for more precision
-- SELECT cron.schedule(
--   'check-scheduled-calls',
--   '0,30 * * * *',               -- Every 30 minutes
--   'SELECT public.trigger_scheduled_calls();'
-- );

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule the job (if needed):
-- SELECT cron.unschedule('check-scheduled-calls');
