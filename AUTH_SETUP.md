# Authentication Setup Guide

This project uses Supabase for authentication. Follow these steps to set up authentication:

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Credentials

1. Go to your project settings: `Settings` → `API`
2. Copy your **Project URL** and **anon/public key**

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

    ```bash
    cp .env.example .env.local
    ```

2. Update `.env.local` with your credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

## 4. Configure Supabase Authentication

### Email Authentication

Email authentication is enabled by default. Users can sign up and log in using their email and password.

To customize email templates:

1. Go to `Authentication` → `Email Templates` in your Supabase dashboard
2. Customize the confirmation email template

### Google OAuth (Optional)

To enable Google authentication:

1. Go to `Authentication` → `Providers` in your Supabase dashboard
2. Enable Google provider
3. Follow the instructions to set up Google OAuth credentials:
    - Create a project in [Google Cloud Console](https://console.cloud.google.com)
    - Enable Google+ API
    - Create OAuth 2.0 credentials
    - Add authorized redirect URIs:
        - `https://your-project.supabase.co/auth/v1/callback`
    - Copy Client ID and Client Secret to Supabase

### Site URL and Redirect URLs

1. Go to `Authentication` → `URL Configuration`
2. Set your **Site URL** (e.g., `http://localhost:3000` for development)
3. Add **Redirect URLs**:
    - `http://localhost:3000/auth/callback` (development)
    - `https://yourdomain.com/auth/callback` (production)

## 5. Run the Application

```bash
npm run dev
```

Visit:

-   `/signup` - Create a new account
-   `/login` - Sign in to your account
-   `/dashboard` - Protected page (requires authentication)

## Features

-   ✅ Email/Password authentication
-   ✅ Google OAuth authentication
-   ✅ Protected routes with middleware
-   ✅ Auto-redirect to login for unauthenticated users
-   ✅ Session management
-   ✅ Logout functionality

## File Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   └── auth/
│       └── callback/route.ts   # OAuth callback handler
├── components/
│   ├── Navbar.tsx              # Navigation with auth state
│   └── ui/                     # Reusable UI components
├── utils/
│   └── supabase/
│       ├── client.ts           # Client-side Supabase client
│       ├── server.ts           # Server-side Supabase client
│       └── middleware.ts       # Middleware utilities
└── middleware.ts               # Route protection middleware
```

## Troubleshooting

### "Invalid API key" error

-   Make sure your `.env.local` file has the correct credentials
-   Restart the development server after changing environment variables

### OAuth redirect not working

-   Check that your redirect URLs are configured correctly in Supabase
-   Make sure the callback URL matches exactly (including http/https)

### User not redirected after login

-   Check browser console for errors
-   Verify middleware is working by checking the Network tab

## Security Notes

-   Never commit `.env.local` to version control
-   The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code
-   Use Row Level Security (RLS) in Supabase to protect your data
-   Always validate user sessions on the server side

## Next Steps

Consider implementing:

-   Password reset functionality
-   Email verification
-   User profile management
-   Role-based access control (RBAC)
-   Social login with other providers (GitHub, Twitter, etc.)
