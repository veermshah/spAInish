-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create a function that makes the actual API call
CREATE OR REPLACE FUNCTION public.trigger_scheduled_calls()
RETURNS void AS $$
DECLARE
  scheduled_user RECORD;
  api_response extensions.http_response;
  api_url TEXT;
BEGIN
  -- Your API endpoint URL (you'll need to update this)
  api_url := current_setting('app.api_url', true);
  
  IF api_url IS NULL THEN
    api_url := 'http://localhost:3000/api/call-scheduled'; -- fallback for local dev
  END IF;
  
  -- Get all users who should receive calls now
  FOR scheduled_user IN 
    SELECT * FROM public.check_and_make_scheduled_calls()
  LOOP
    -- Make HTTP POST request to your API endpoint
    -- The API endpoint will handle authentication and calling ElevenLabs
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
      
      -- Log the response (optional)
      RAISE NOTICE 'Call initiated for user %: Status %', 
        scheduled_user.user_id, 
        api_response.status;
        
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing other users
      RAISE WARNING 'Failed to call user %: %', 
        scheduled_user.user_id, 
        SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
