# 🚀 Quick Setup Instructions for Profile Feature

## Prerequisites

-   Supabase project created
-   Environment variables set in `.env.local`

## Step-by-Step Setup

### 1. Run Database Migration

Go to your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor and run:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/001_create_profiles_table.sql
```

Or use the SQL Editor to execute the migration file.

### 2. Verify Setup

Check these in your Supabase dashboard:

✅ **Table Editor** → `profiles` table exists  
✅ **Storage** → `profiles` bucket exists  
✅ **Authentication** → RLS policies enabled on profiles table

### 3. Test the Feature

1. Sign up a new user at `/signup`
2. User should be redirected to `/profile-setup`
3. Fill out the profile form
4. Submit and verify redirect to `/dashboard`

### 4. Check Data

In Supabase Table Editor → `profiles`:

-   New row should exist with user's data
-   `learning_languages` should be an array
-   `avatar_url` should contain the uploaded image URL (if uploaded)

## What Users See

### New User Flow

1. Visit `/signup`
2. Create account (email/password or Google)
3. → Redirected to `/profile-setup`
4. Fill in profile information
5. → Redirected to `/dashboard`

### Existing User Flow

1. Visit `/login`
2. Sign in
3. → Redirected to `/dashboard` (if profile complete)
4. → Redirected to `/profile-setup` (if profile incomplete)

## Files Created

-   ✅ `/profile-setup/page.tsx` - Profile setup form
-   ✅ `supabase/migrations/001_create_profiles_table.sql` - Database migration
-   ✅ `src/types/database.d.ts` - TypeScript types
-   ✅ `PROFILE_SETUP.md` - Detailed documentation

## Files Modified

-   ✅ `/signup/page.tsx` - Redirects to profile setup
-   ✅ `/auth/callback/route.ts` - Checks profile completion
-   ✅ `middleware.ts` - Allows profile-setup access

## Troubleshooting

**Migration fails?**

-   Make sure you're in the correct Supabase project
-   Check for existing tables with same names
-   Verify you have proper permissions

**Profile not saving?**

-   Check browser console for errors
-   Verify RLS policies are enabled
-   Ensure user is authenticated

**Images not uploading?**

-   Check that `profiles` storage bucket exists
-   Verify bucket is set to public
-   Ensure file is under 5MB

## Support

See `PROFILE_SETUP.md` for detailed documentation and troubleshooting.
