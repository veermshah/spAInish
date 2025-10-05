-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    birthdate DATE,
    phone_number TEXT,
    learning_languages TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- Storage policies for profile images
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = 'avatars' AND
        auth.uid()::text = (storage.filename(name))::text
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'profiles' AND
        (storage.foldername(name))[1] = 'avatars' AND
        auth.uid()::text = (storage.filename(name))::text
    );

CREATE POLICY "Anyone can view avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'avatars');

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profiles_learning_languages_idx ON public.profiles USING GIN (learning_languages);
