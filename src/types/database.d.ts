// Database types for Supabase tables

export interface CallSchedule {
    frequency: "daily" | "weekdays" | "weekly" | "biweekly";
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

export interface ArticleSection {
    text: string;
    imagePrompt: string;
}

export interface Lesson {
    id: string;
    user_id: string;
    topic: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    title: string;
    sections: ArticleSection[];
    created_at: string;
    updated_at: string;
}

export interface QuizQuestion {
    id: string;
    lesson_id: string;
    question: string;
    options: string[];
    correct_answer: number;
    question_order: number;
    created_at: string;
}

export interface LessonAttempt {
    id: string;
    lesson_id: string;
    user_id: string;
    user_answers: number[];
    score: number;
    total_questions: number;
    summary_text: string | null;
    summary_score: number | null;
    summary_feedback: string | null;
    summary_suggestions: string | null;
    completed_at: string;
}

export interface LessonWithQuestions extends Lesson {
    quiz_questions: QuizQuestion[];
}

export interface LessonAttemptWithLesson extends LessonAttempt {
    lessons: Lesson;
}
