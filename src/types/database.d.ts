// Database types for Supabase tables

export interface CallSchedule {
    frequency: 'daily' | 'weekdays' | 'weekly' | 'biweekly';
    time: string; // HH:MM format
    timezone: string;
}

export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    birthdate: string | null;
    phone_number: string | null;
    learning_languages: string[];
    avatar_url: string | null;
    activity_dates: string[];
    call_schedule: CallSchedule | null;
    call_schedule_enabled: boolean;
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
    activity_dates?: string[];
    call_schedule?: CallSchedule | null;
    call_schedule_enabled?: boolean;
    updated_at?: string;
}
