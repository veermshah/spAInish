# Lessons & Analytics Database Migration

This migration adds support for saving generated lessons, quiz questions, and lesson attempts to the database.

## What's Included

### New Tables

1. **lessons** - Stores generated articles

    - topic, difficulty, title, sections (with text and image prompts)
    - Linked to user who created it

2. **quiz_questions** - Stores quiz questions for each lesson

    - question, options, correct_answer, question_order
    - Linked to the lesson

3. **lesson_attempts** - Stores user quiz results and summary evaluations
    - user_answers, score, total_questions
    - summary_text, summary_score, summary_feedback, summary_suggestions
    - Linked to both user and lesson

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're in the project directory
cd c:\cs\spAInish

# Apply the migration
npx supabase db push

# Or if you have migrations locally
npx supabase migration up
```

### Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/008_create_lessons_tables.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option 3: Using psql

```bash
psql postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres -f supabase/migrations/008_create_lessons_tables.sql
```

## Verification

After applying the migration, verify the tables exist:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('lessons', 'quiz_questions', 'lesson_attempts');

-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('lessons', 'quiz_questions', 'lesson_attempts');
```

## Features Enabled

### Lessons Page (`/lessons`)

-   ✅ Auto-saves generated articles to database
-   ✅ Auto-saves quiz questions
-   ✅ Saves quiz results when user completes
-   ✅ Saves summary evaluation (if provided)
-   ✅ Links all data to authenticated user

### Analytics Page (`/analytics`)

-   ✅ Displays total lessons created
-   ✅ Shows total attempts/completions
-   ✅ Calculates average quiz score
-   ✅ Calculates average summary score
-   ✅ Lists recent activity with all details
-   ✅ Click on any attempt to see detailed results
-   ✅ View quiz scores and summary feedback

## Database Schema

```typescript
// Lesson
{
  id: UUID,
  user_id: UUID,
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  title: string,
  sections: Array<{text: string, imagePrompt: string}>,
  created_at: timestamp,
  updated_at: timestamp
}

// Quiz Question
{
  id: UUID,
  lesson_id: UUID,
  question: string,
  options: string[],
  correct_answer: number,
  question_order: number,
  created_at: timestamp
}

// Lesson Attempt
{
  id: UUID,
  lesson_id: UUID,
  user_id: UUID,
  user_answers: number[],
  score: number,
  total_questions: number,
  summary_text: string?,
  summary_score: number?,
  summary_feedback: string?,
  summary_suggestions: string?,
  completed_at: timestamp
}
```

## Security

All tables have Row Level Security (RLS) enabled:

-   Users can only view/modify their own data
-   Quiz questions inherit access from parent lesson
-   Comprehensive policies for SELECT, INSERT, UPDATE, DELETE

## Navigation

The Analytics link has been added to the navbar between "Lessons" and "Transcripts".
