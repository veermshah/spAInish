-- Create a function that checks for scheduled calls and triggers them
CREATE OR REPLACE FUNCTION public.check_and_make_scheduled_calls()
RETURNS TABLE(user_id UUID, phone_number TEXT, scheduled_time TIME) AS $$
DECLARE
  profile_record RECORD;
  current_hour INT;
  current_day_of_week INT; -- 0 = Sunday, 6 = Saturday
  schedule_time TIME;
  schedule_hour INT;
  should_call BOOLEAN;
BEGIN
  -- Get current hour and day
  current_hour := EXTRACT(HOUR FROM CURRENT_TIME);
  current_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);
  
  -- Loop through all profiles with enabled call schedules
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
    
    -- Extract scheduled time from JSON
    schedule_time := (profile_record.call_schedule->>'time')::TIME;
    schedule_hour := EXTRACT(HOUR FROM schedule_time);
    
    -- Check if current hour matches scheduled hour
    IF current_hour = schedule_hour THEN
      
      -- Check frequency
      CASE profile_record.call_schedule->>'frequency'
        WHEN 'daily' THEN
          should_call := true;
          
        WHEN 'weekdays' THEN
          -- Monday = 1, Friday = 5
          IF current_day_of_week BETWEEN 1 AND 5 THEN
            should_call := true;
          END IF;
          
        WHEN 'weekly' THEN
          -- Only call on the day they first scheduled (you could enhance this)
          -- For now, let's call on Mondays
          IF current_day_of_week = 1 THEN
            should_call := true;
          END IF;
          
        WHEN 'biweekly' THEN
          -- Call every other week on Mondays (simplified)
          IF current_day_of_week = 1 AND EXTRACT(WEEK FROM CURRENT_DATE) % 2 = 0 THEN
            should_call := true;
          END IF;
      END CASE;
      
      -- If should call, return this user's info
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

-- Grant execute permission to authenticated users (optional, for testing)
GRANT EXECUTE ON FUNCTION public.check_and_make_scheduled_calls() TO authenticated;
