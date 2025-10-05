-- Create lessons table to store generated articles
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    title TEXT NOT NULL,
    sections JSONB NOT NULL, -- Array of {text: string, imagePrompt: string}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table to store quiz questions for each lesson
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_answer INTEGER NOT NULL,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_attempts table to store user quiz results
CREATE TABLE IF NOT EXISTS public.lesson_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_answers JSONB NOT NULL, -- Array of integers
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    summary_text TEXT,
    summary_score INTEGER,
    summary_feedback TEXT,
    summary_suggestions TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON public.lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON public.lessons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_user_id ON public.lesson_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_lesson_id ON public.lesson_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_completed_at ON public.lesson_attempts(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons table
CREATE POLICY "Users can view their own lessons"
    ON public.lessons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lessons"
    ON public.lessons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
    ON public.lessons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
    ON public.lessons FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for quiz_questions table
CREATE POLICY "Users can view quiz questions for their lessons"
    ON public.quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create quiz questions for their lessons"
    ON public.quiz_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update quiz questions for their lessons"
    ON public.quiz_questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete quiz questions for their lessons"
    ON public.quiz_questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
            AND lessons.user_id = auth.uid()
        )
    );

-- RLS Policies for lesson_attempts table
CREATE POLICY "Users can view their own lesson attempts"
    ON public.lesson_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson attempts"
    ON public.lesson_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson attempts"
    ON public.lesson_attempts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson attempts"
    ON public.lesson_attempts FOR DELETE
    USING (auth.uid() = user_id);
