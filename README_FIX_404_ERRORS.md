# ⚠️ IMPORTANT: Fix 404 Errors - Database Setup Required

## What's Wrong?

You're seeing 404 errors because the database tables for lessons and analytics don't exist yet.

## ✅ Quick Fix (Takes 2 minutes)

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **spAInish**
3. Click **SQL Editor** in the left sidebar

### Step 2: Create Tables

1. Click the green **New Query** button
2. **Copy the entire SQL script below**
3. Paste it into the SQL Editor
4. Click **Run** (or press `Ctrl+Enter`)
5. You should see "Success. No rows returned"

### Step 3: Verify

1. Click **Table Editor** in the sidebar
2. You should now see 3 new tables:
    - ✅ `lessons`
    - ✅ `quiz_questions`
    - ✅ `lesson_attempts`

### Step 4: Refresh Your App

Reload your browser and the errors will be gone! 🎉

---

## 📋 SQL Script (Copy Everything Below)

\`\`\`sql
-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
topic TEXT NOT NULL,
difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
title TEXT NOT NULL,
sections JSONB NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
question TEXT NOT NULL,
options JSONB NOT NULL,
correct_answer INTEGER NOT NULL,
question_order INTEGER NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_attempts table
CREATE TABLE IF NOT EXISTS public.lesson_attempts (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
user_answers JSONB NOT NULL,
score INTEGER NOT NULL,
total_questions INTEGER NOT NULL,
summary_text TEXT,
summary_score INTEGER,
summary_feedback TEXT,
summary_suggestions TEXT,
completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
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

-- Policies for lessons
CREATE POLICY "Users can view their own lessons" ON public.lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lessons" ON public.lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lessons" ON public.lessons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lessons" ON public.lessons FOR DELETE USING (auth.uid() = user_id);

-- Policies for quiz_questions
CREATE POLICY "Users can view quiz questions for their lessons" ON public.quiz_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.lessons WHERE lessons.id = quiz_questions.lesson_id AND lessons.user_id = auth.uid()));
CREATE POLICY "Users can create quiz questions for their lessons" ON public.quiz_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.lessons WHERE lessons.id = quiz_questions.lesson_id AND lessons.user_id = auth.uid()));
CREATE POLICY "Users can update quiz questions for their lessons" ON public.quiz_questions FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.lessons WHERE lessons.id = quiz_questions.lesson_id AND lessons.user_id = auth.uid()));
CREATE POLICY "Users can delete quiz questions for their lessons" ON public.quiz_questions FOR DELETE
USING (EXISTS (SELECT 1 FROM public.lessons WHERE lessons.id = quiz_questions.lesson_id AND lessons.user_id = auth.uid()));

-- Policies for lesson_attempts
CREATE POLICY "Users can view their own lesson attempts" ON public.lesson_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lesson attempts" ON public.lesson_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lesson attempts" ON public.lesson_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lesson attempts" ON public.lesson_attempts FOR DELETE USING (auth.uid() = user_id);
\`\`\`

---

## 🎯 What This Does

Creates 3 tables to store:

1. **lessons** - Generated Spanish articles with topic, difficulty, and content
2. **quiz_questions** - 5 quiz questions for each lesson
3. **lesson_attempts** - Your quiz scores and summary evaluations

All data is protected with Row Level Security so users only see their own data!

---

## 🔧 Alternative: Using Command Line

If you have Supabase CLI installed:

\`\`\`bash
cd c:\cs\spAInish
npx supabase db push
\`\`\`

---

## 💡 After Setup

Once the tables are created:

-   ✅ `/lessons` will save every article you generate
-   ✅ `/analytics` will show your learning progress
-   ✅ You'll track quiz scores and summary evaluations
-   ✅ All your lesson history will be saved

---

## ❓ Still Having Issues?

1. **Check you're logged in** to Supabase as the project owner
2. **Verify the tables** appear in Table Editor after running SQL
3. **Clear browser cache** and reload the app
4. **Check browser console** for any remaining errors

Need help? The error messages in the app now include direct links to setup instructions!
