-- ============================================
-- ALL-IN-ONE MIGRATION FOR CALL SCHEDULING
-- Run this entire file in SQL Editor
-- ============================================

-- Step 1: Add call scheduling fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS call_schedule JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS call_schedule_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.call_schedule IS 
'Stores call schedule preferences as JSON: 
{
  "frequency": "daily|weekdays|weekly|biweekly",
  "time": "HH:MM" (24-hour format),
  "timezone": "America/Chicago" (user timezone)
}';

CREATE INDEX IF NOT EXISTS profiles_call_schedule_enabled_idx 
ON public.profiles(call_schedule_enabled) 
WHERE call_schedule_enabled = true;

-- Step 2: Create function to check for scheduled calls
CREATE OR REPLACE FUNCTION public.check_and_make_scheduled_calls()
RETURNS TABLE(user_id UUID, phone_number TEXT, scheduled_time TIME) AS $$
DECLARE
  profile_record RECORD;
  current_hour INT;
  current_day_of_week INT;
  schedule_time TIME;
  schedule_hour INT;
  should_call BOOLEAN;
BEGIN
  current_hour := EXTRACT(HOUR FROM CURRENT_TIME);
  current_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);
  
  FOR profile_record IN 
    SELECT 
      id, 
      phone_number, 
      call_schedule
    FROM public.profiles
    WHERE call_schedule_enabled = true
      AND call_schedule IS NOT NULL
      AND phone_number IS NOT NULL
  LOOP
    should_call := false;
    schedule_time := (profile_record.call_schedule->>'time')::TIME;
    schedule_hour := EXTRACT(HOUR FROM schedule_time);
    
    IF current_hour = schedule_hour THEN
      CASE profile_record.call_schedule->>'frequency'
        WHEN 'daily' THEN
          should_call := true;
        WHEN 'weekdays' THEN
          IF current_day_of_week BETWEEN 1 AND 5 THEN
            should_call := true;
          END IF;
        WHEN 'weekly' THEN
          IF current_day_of_week = 1 THEN
            should_call := true;
          END IF;
        WHEN 'biweekly' THEN
          IF current_day_of_week = 1 AND EXTRACT(WEEK FROM CURRENT_DATE) % 2 = 0 THEN
            should_call := true;
          END IF;
      END CASE;
      
      IF should_call THEN
        user_id := profile_record.id;
        phone_number := profile_record.phone_number;
        scheduled_time := schedule_time;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_and_make_scheduled_calls() TO authenticated;

-- Step 3: Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Step 4: Create function to trigger calls via HTTP
CREATE OR REPLACE FUNCTION public.trigger_scheduled_calls()
RETURNS void AS $$
DECLARE
  scheduled_user RECORD;
  api_response extensions.http_response;
  api_url TEXT;
BEGIN
  api_url := current_setting('app.api_url', true);
  
  IF api_url IS NULL THEN
    api_url := 'http://localhost:3000/api/call-scheduled';
  END IF;
  
  FOR scheduled_user IN 
    SELECT * FROM public.check_and_make_scheduled_calls()
  LOOP
    BEGIN
      SELECT * INTO api_response
      FROM extensions.http((
        'POST',
        api_url,
        ARRAY[
          extensions.http_header('Content-Type', 'application/json')
        ],
        'application/json',
        json_build_object(
          'user_id', scheduled_user.user_id,
          'phone_number', scheduled_user.phone_number,
          'scheduled', true
        )::text
      ));
      
      RAISE NOTICE 'Call initiated for user %: Status %', 
        scheduled_user.user_id, 
        api_response.status;
        
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to call user %: %', 
        scheduled_user.user_id, 
        SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Schedule the cron job
-- NOTE: This requires pg_cron to be enabled first!
SELECT cron.schedule(
  'check-scheduled-calls',
  '0 * * * *',
  'SELECT public.trigger_scheduled_calls();'
);

-- Step 6: Set API URL (CHANGE THIS TO YOUR ACTUAL URL!)
ALTER DATABASE postgres SET app.api_url = 'https://your-app-domain.vercel.app/api/call-scheduled';

-- Verification queries
-- Run these to verify everything is set up correctly:

-- Check if columns were added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name LIKE 'call_%';

-- Check if cron job is scheduled
-- SELECT * FROM cron.job;

-- Test the check function
-- SELECT * FROM public.check_and_make_scheduled_calls();
