-- Set the API URL for your application
-- Update this with your actual deployed URL
ALTER DATABASE postgres SET app.api_url = 'https://your-app-domain.vercel.app/api/call-scheduled';

-- For local development, you might want to use:
-- ALTER DATABASE postgres SET app.api_url = 'http://localhost:3000/api/call-scheduled';

-- To view current setting:
-- SELECT current_setting('app.api_url', true);
