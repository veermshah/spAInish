-- Create a configuration table to store the API URL
-- Since we can't use ALTER DATABASE SET in Supabase, we'll use a table instead

CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert the API URL
INSERT INTO public.app_config (key, value, description)
VALUES (
    'api_url',
    'https://habla-two.vercel.app/api/call-scheduled',
    'Base API URL for scheduled calls'
)
ON CONFLICT (key) 
DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = timezone('utc'::text, now());

-- For local development, you can update it with:
-- UPDATE public.app_config SET value = 'http://localhost:3000/api/call-scheduled' WHERE key = 'api_url';

-- To view current setting:
-- SELECT value FROM public.app_config WHERE key = 'api_url';
