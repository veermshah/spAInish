// Database types for Supabase tables

export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    birthdate: string | null;
    phone_number: string | null;
    learning_languages: string[];
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProfileUpdate {
    first_name?: string;
    last_name?: string;
    birthdate?: string;
    phone_number?: string;
    learning_languages?: string[];
    avatar_url?: string;
    updated_at?: string;
}
