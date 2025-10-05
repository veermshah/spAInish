-- Add activity tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS activity_dates DATE[] DEFAULT '{}';

-- Add index for better performance when querying activity dates
CREATE INDEX IF NOT EXISTS profiles_activity_dates_idx ON public.profiles USING GIN (activity_dates);

-- Create a function to add today's date to activity_dates if not already present
CREATE OR REPLACE FUNCTION public.record_daily_activity(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET 
        activity_dates = CASE
            WHEN NOT (CURRENT_DATE = ANY(activity_dates))
            THEN array_append(activity_dates, CURRENT_DATE)
            ELSE activity_dates
        END,
        updated_at = timezone('utc'::text, now())
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get streak count
CREATE OR REPLACE FUNCTION public.get_streak_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    dates DATE[];
BEGIN
    -- Get sorted activity dates
    SELECT array_agg(d ORDER BY d DESC)
    INTO dates
    FROM unnest((SELECT activity_dates FROM public.profiles WHERE id = user_id)) AS d;
    
    IF dates IS NULL OR array_length(dates, 1) IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Count consecutive days starting from today or yesterday
    FOREACH check_date IN ARRAY dates LOOP
        IF check_date = CURRENT_DATE - streak_count OR 
           (streak_count = 0 AND check_date = CURRENT_DATE - 1) THEN
            streak_count := streak_count + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
