-- Add call scheduling fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS call_schedule JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS call_schedule_enabled BOOLEAN DEFAULT false;

-- Add comment to explain the call_schedule structure
COMMENT ON COLUMN public.profiles.call_schedule IS 
'Stores call schedule preferences as JSON: 
{
  "frequency": "daily|weekdays|weekly|biweekly",
  "time": "HH:MM" (24-hour format),
  "timezone": "America/Chicago" (user timezone)
}';

-- Create index for faster queries on enabled schedules
CREATE INDEX IF NOT EXISTS profiles_call_schedule_enabled_idx 
ON public.profiles(call_schedule_enabled) 
WHERE call_schedule_enabled = true;
