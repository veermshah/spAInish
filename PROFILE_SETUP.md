# Profile Setup Guide

This guide explains how to set up the user profile feature in your application.

## Database Setup

### Step 1: Run the Migration

You need to create the `profiles` table in Supabase. You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/001_create_profiles_table.sql`
5. Paste it into the query editor
6. Click **Run** to execute the migration

#### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Step 2: Verify the Setup

After running the migration, verify that:

1. **Table Created**: Check that the `profiles` table exists in **Table Editor**
2. **Storage Bucket**: Verify the `profiles` bucket exists in **Storage**
3. **RLS Policies**: Check that Row Level Security policies are enabled

## What the Migration Creates

### Profiles Table

The `profiles` table stores user profile information:

| Column               | Type      | Description                                  |
| -------------------- | --------- | -------------------------------------------- |
| `id`                 | UUID      | Foreign key to `auth.users.id` (Primary Key) |
| `first_name`         | TEXT      | User's first name                            |
| `last_name`          | TEXT      | User's last name                             |
| `birthdate`          | DATE      | User's date of birth                         |
| `phone_number`       | TEXT      | User's phone number                          |
| `learning_languages` | TEXT[]    | Array of languages the user is learning      |
| `avatar_url`         | TEXT      | URL to profile picture                       |
| `created_at`         | TIMESTAMP | When the profile was created                 |
| `updated_at`         | TIMESTAMP | When the profile was last updated            |

### Storage Bucket

-   **Bucket Name**: `profiles`
-   **Path Structure**: `avatars/{user-id}-{random}.{ext}`
-   **Public Access**: Yes (for displaying avatars)
-   **Max File Size**: 5MB (enforced in the frontend)

### Row Level Security (RLS)

The migration sets up RLS policies so that:

-   Users can only view, insert, update, and delete their own profile
-   Users can only upload/update their own avatar
-   Anyone can view avatars (public access)

### Automatic Profile Creation

A trigger automatically creates a profile row when a new user signs up via Supabase Auth.

## User Flow

1. **Sign Up** (`/signup`)

    - User creates account with email/password or Google OAuth
    - Trigger automatically creates empty profile row

2. **Profile Setup** (`/profile-setup`)

    - User is redirected here after signup
    - User fills in profile information:
        - Profile picture (optional)
        - First and last name (required)
        - Birthdate (optional)
        - Phone number (optional)
        - Learning languages (required, at least one)
    - Profile data is saved to Supabase

3. **Dashboard** (`/dashboard`)
    - User can now access the dashboard
    - Can return to profile setup anytime to update information

## Available Languages

The profile setup supports these languages by default:

-   Spanish
-   French
-   German
-   Italian
-   Portuguese
-   Mandarin Chinese
-   Japanese
-   Korean
-   Arabic
-   Russian
-   Hindi
-   Dutch

You can modify the `LANGUAGES` array in `src/app/profile-setup/page.tsx` to add or remove languages.

## Storage Configuration

### Profile Picture Requirements

-   **Supported Formats**: JPG, PNG, GIF, WebP
-   **Maximum Size**: 5MB
-   **Recommended Size**: 500x500px or larger (square ratio)
-   **Storage Path**: `profiles/avatars/{user-id}-{random}.{ext}`

### Storage Policies

The storage bucket has three policies:

1. **Upload**: Users can only upload images with their user ID in the filename
2. **Update**: Users can only update their own images
3. **View**: Anyone can view profile pictures (public bucket)

## Accessing Profile Data

### Client-Side (React Component)

```typescript
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

// Get current user's profile
const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

// Update profile
await supabase
    .from("profiles")
    .update({
        first_name: "John",
        last_name: "Doe",
        learning_languages: ["Spanish", "French"],
    })
    .eq("id", user.id);
```

### Server-Side (API Route)

```typescript
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

const {
    data: { user },
} = await supabase.auth.getUser();

const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
```

## Troubleshooting

### "relation 'public.profiles' does not exist"

-   The migration hasn't been run. Follow Step 1 above.

### "new row violates row-level security policy"

-   Make sure the user is authenticated
-   Verify that the `id` being inserted matches `auth.uid()`

### Profile image upload fails

-   Check that the `profiles` storage bucket exists
-   Verify storage policies are set up correctly
-   Ensure the file is under 5MB

### Trigger not creating profile automatically

-   Check that the trigger `on_auth_user_created` exists
-   Verify the `handle_new_user()` function is created
-   Test by creating a new user and checking the profiles table

## Security Best Practices

1. **Always validate on the server**: Don't trust client-side validation alone
2. **Use RLS policies**: The migration already sets these up
3. **Sanitize file uploads**: Only allow image files for avatars
4. **Rate limit**: Consider adding rate limiting for profile updates
5. **Validate data types**: Ensure phone numbers, dates, etc. are in correct format

## Future Enhancements

Consider adding:

-   Email notifications when profile is updated
-   Profile completion percentage indicator
-   Additional fields (bio, location, preferred learning time)
-   Privacy settings (public/private profile)
-   Profile picture cropping/editing
-   Social media links
-   Skill level tracking per language
