"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    BookOpen,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Brain,
} from "lucide-react";
import type { Lesson, QuizQuestion, LessonAttempt } from "@/types/database";

type ArticleSection = {
    text: string;
    imagePrompt: string;
};

export default function ViewLessonPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const lessonId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [attempts, setAttempts] = useState<LessonAttempt[]>([]);
    const [selectedAttempt, setSelectedAttempt] =
        useState<LessonAttempt | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLesson();
    }, [lessonId]);

    const loadLesson = async () => {
        setLoading(true);
        setError(null);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Load lesson
            const { data: lessonData, error: lessonError } = await supabase
                .from("lessons")
                .select("*")
                .eq("id", lessonId)
                .eq("user_id", user.id)
                .single();

            if (lessonError) {
                console.error("Error loading lesson:", lessonError);
                setError(
                    "Failed to load lesson. It may not exist or you don't have access."
                );
                return;
            }

            setLesson(lessonData);

            // Load quiz questions
            const { data: questionsData, error: questionsError } =
                await supabase
                    .from("quiz_questions")
                    .select("*")
                    .eq("lesson_id", lessonId)
                    .order("question_order");

            if (questionsError) {
                console.error("Error loading questions:", questionsError);
            } else {
                setQuestions(questionsData || []);
            }

            // Load all attempts for this lesson
            const { data: attemptsData, error: attemptsError } = await supabase
                .from("lesson_attempts")
                .select("*")
                .eq("lesson_id", lessonId)
                .eq("user_id", user.id)
                .order("completed_at", { ascending: false });

            if (attemptsError) {
                console.error("Error loading attempts:", attemptsError);
            } else {
                setAttempts(attemptsData || []);
                if (attemptsData && attemptsData.length > 0) {
                    setSelectedAttempt(attemptsData[0]); // Select most recent attempt by default
                }
            }
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "text-green-600 dark:text-green-400";
            case "intermediate":
                return "text-yellow-600 dark:text-yellow-400";
            case "advanced":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="container mx-auto py-10">
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            Error
                        </CardTitle>
                        <CardDescription>
                            {error || "Lesson not found"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push("/analytics")}
                            variant="outline"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const sections = lesson.sections as unknown as ArticleSection[];

    return (
        <div className="container mx-auto py-10">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/analytics")}
                            className="mb-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Analytics
                        </Button>
                        <h1 className="text-3xl font-bold">{lesson.title}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {lesson.topic}
                            </span>
                            <span
                                className={getDifficultyColor(
                                    lesson.difficulty
                                )}
                            >
                                {lesson.difficulty}
                            </span>
                            <span>
                                {new Date(
                                    lesson.created_at
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Article
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                            {sections.map((section, index) => (
                                <div key={index} className="mb-6">
                                    <p className="leading-relaxed text-lg">
                                        {section.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quiz Questions */}
                {questions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Quiz Questions
                            </CardTitle>
                            <CardDescription>
                                {questions.length} questions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <div
                                        key={q.id}
                                        className="p-4 border rounded-lg"
                                    >
                                        <h4 className="font-semibold mb-3">
                                            {index + 1}. {q.question}
                                        </h4>
                                        <div className="space-y-2">
                                            {(
                                                q.options as unknown as string[]
                                            ).map((option, optIndex) => {
                                                const isCorrect =
                                                    optIndex ===
                                                    q.correct_answer;
                                                const userAnswer =
                                                    selectedAttempt?.user_answers as unknown as number[];
                                                const wasSelected =
                                                    userAnswer &&
                                                    userAnswer[index] ===
                                                        optIndex;

                                                return (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded border ${
                                                            selectedAttempt
                                                                ? isCorrect
                                                                    ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                                                                    : wasSelected
                                                                    ? "bg-red-50 dark:bg-red-950/20 border-red-500"
                                                                    : "bg-muted/50"
                                                                : "bg-muted/50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {selectedAttempt &&
                                                                isCorrect && (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                )}
                                                            {selectedAttempt &&
                                                                wasSelected &&
                                                                !isCorrect && (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                            <span>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Attempts History */}
                {attempts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Attempts</CardTitle>
                            <CardDescription>
                                {attempts.length} attempt
                                {attempts.length !== 1 ? "s" : ""} recorded
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {attempts.map((attempt) => {
                                    const quizPercentage = Math.round(
                                        (attempt.score /
                                            attempt.total_questions) *
                                            100
                                    );
                                    const isSelected =
                                        selectedAttempt?.id === attempt.id;

                                    return (
                                        <div
                                            key={attempt.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "border-primary bg-accent"
                                                    : "hover:bg-accent/50"
                                            }`}
                                            onClick={() =>
                                                setSelectedAttempt(attempt)
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(
                                                            attempt.completed_at
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div
                                                            className={`text-lg font-bold ${getScoreColor(
                                                                quizPercentage
                                                            )}`}
                                                        >
                                                            {quizPercentage}%
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Quiz:{" "}
                                                            {attempt.score}/
                                                            {
                                                                attempt.total_questions
                                                            }
                                                        </div>
                                                    </div>
                                                    {attempt.summary_score !==
                                                        null && (
                                                        <div className="text-right">
                                                            <div
                                                                className={`text-lg font-bold ${getScoreColor(
                                                                    attempt.summary_score
                                                                )}`}
                                                            >
                                                                {
                                                                    attempt.summary_score
                                                                }
                                                                %
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Summary
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Show summary details if this attempt is selected */}
                                            {isSelected &&
                                                attempt.summary_text && (
                                                    <div className="mt-4 pt-4 border-t space-y-3">
                                                        <div>
                                                            <div className="text-sm font-medium mb-1">
                                                                Your Summary:
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    attempt.summary_text
                                                                }
                                                            </p>
                                                        </div>
                                                        {attempt.summary_feedback && (
                                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                                                                <div className="text-sm font-medium mb-1">
                                                                    Feedback:
                                                                </div>
                                                                <p className="text-sm">
                                                                    {
                                                                        attempt.summary_feedback
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        {attempt.summary_suggestions && (
                                                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded">
                                                                <div className="text-sm font-medium mb-1">
                                                                    Suggestions:
                                                                </div>
                                                                <p className="text-sm">
                                                                    {
                                                                        attempt.summary_suggestions
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {attempts.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <p>No attempts recorded for this lesson yet.</p>
                            <p className="text-sm mt-2">
                                Complete the quiz to see your results here!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
