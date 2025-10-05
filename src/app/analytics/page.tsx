"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Brain,
    Trophy,
    TrendingUp,
    Calendar,
    CheckCircle,
    XCircle,
    ExternalLink,
} from "lucide-react";
import type { LessonAttemptWithLesson, Lesson } from "@/types/database";

type LessonStats = {
    totalLessons: number;
    totalAttempts: number;
    averageQuizScore: number;
    averageSummaryScore: number;
    recentActivity: LessonAttemptWithLesson[];
};

export default function AnalyticsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<LessonStats | null>(null);
    const [selectedLesson, setSelectedLesson] =
        useState<LessonAttemptWithLesson | null>(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Get all lesson attempts with lesson details
            const { data: attempts, error: attemptsError } = await supabase
                .from("lesson_attempts")
                .select(
                    `
                    *,
                    lessons (
                        id,
                        topic,
                        difficulty,
                        title,
                        created_at
                    )
                `
                )
                .eq("user_id", user.id)
                .order("completed_at", { ascending: false });

            if (attemptsError) {
                // Check if it's a "table doesn't exist" error
                if (
                    attemptsError.message?.includes(
                        'relation "public.lesson_attempts" does not exist'
                    )
                ) {
                    console.error(
                        "Tables not created yet. Please run the migration."
                    );
                }
                throw attemptsError;
            }

            // Get unique lessons count
            const { count: lessonsCount } = await supabase
                .from("lessons")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            // Calculate statistics
            const totalAttempts = attempts?.length || 0;
            const avgQuizScore =
                totalAttempts > 0
                    ? attempts!.reduce(
                          (sum, a) => sum + (a.score / a.total_questions) * 100,
                          0
                      ) / totalAttempts
                    : 0;

            const attemptsWithSummary =
                attempts?.filter((a) => a.summary_score !== null) || [];
            const avgSummaryScore =
                attemptsWithSummary.length > 0
                    ? attemptsWithSummary.reduce(
                          (sum, a) => sum + (a.summary_score || 0),
                          0
                      ) / attemptsWithSummary.length
                    : 0;

            setStats({
                totalLessons: lessonsCount || 0,
                totalAttempts,
                averageQuizScore: Math.round(avgQuizScore),
                averageSummaryScore: Math.round(avgSummaryScore),
                recentActivity: (attempts as LessonAttemptWithLesson[]) || [],
            });
        } catch (error) {
            console.error("Failed to load analytics:", error);
            // Show a helpful error message to the user
            const errorMessage = error instanceof Error ? error.message : "";
            const errorCode =
                typeof error === "object" && error !== null && "code" in error
                    ? (error as { code?: string }).code
                    : undefined;
            if (
                errorMessage?.includes("does not exist") ||
                errorCode === "42P01"
            ) {
                setStats(null);
            }
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

    if (!stats) {
        return (
            <div className="container mx-auto py-10">
                Login First
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <TrendingUp className="h-8 w-8" />
                        Learning Analytics
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Track your progress and review your lesson history
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Lessons
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalLessons}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Unique lessons generated
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Attempts
                            </CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalAttempts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lessons completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Quiz Score
                            </CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${getScoreColor(
                                    stats.averageQuizScore
                                )}`}
                            >
                                {stats.averageQuizScore}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all attempts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Summary Score
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${getScoreColor(
                                    stats.averageSummaryScore
                                )}`}
                            >
                                {stats.averageSummaryScore > 0
                                    ? `${stats.averageSummaryScore}%`
                                    : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                When summaries provided
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Your lesson completion history
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No lessons completed yet. Start learning!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.recentActivity.map((attempt) => {
                                    const lesson = attempt.lessons as Lesson;
                                    const quizPercentage = Math.round(
                                        (attempt.score /
                                            attempt.total_questions) *
                                            100
                                    );

                                    return (
                                        <div
                                            key={attempt.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div
                                                className="flex-1 space-y-1 cursor-pointer"
                                                onClick={() =>
                                                    setSelectedLesson(attempt)
                                                }
                                            >
                                                <h3 className="font-semibold">
                                                    {lesson.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />
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
                                                            attempt.completed_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(
                                                            `/lessons/${lesson.id}`
                                                        );
                                                    }}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed View Modal */}
                {selectedLesson && (
                    <Card className="mt-6 border-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Lesson Details</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.push(
                                                `/lessons/${
                                                    (
                                                        selectedLesson.lessons as {
                                                            id: string;
                                                        }
                                                    ).id
                                                }`
                                            )
                                        }
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Full Lesson
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedLesson(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Quiz Results */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    Quiz Results
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">
                                            Score
                                        </div>
                                        <div
                                            className={`text-2xl font-bold ${getScoreColor(
                                                (selectedLesson.score /
                                                    selectedLesson.total_questions) *
                                                    100
                                            )}`}
                                        >
                                            {selectedLesson.score}/
                                            {selectedLesson.total_questions}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">
                                            Percentage
                                        </div>
                                        <div
                                            className={`text-2xl font-bold ${getScoreColor(
                                                (selectedLesson.score /
                                                    selectedLesson.total_questions) *
                                                    100
                                            )}`}
                                        >
                                            {Math.round(
                                                (selectedLesson.score /
                                                    selectedLesson.total_questions) *
                                                    100
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Results */}
                            {selectedLesson.summary_text && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Summary Evaluation
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <div className="text-sm font-medium mb-2">
                                                Your Summary:
                                            </div>
                                            <p className="text-sm">
                                                {selectedLesson.summary_text}
                                            </p>
                                        </div>
                                        {selectedLesson.summary_score !==
                                            null && (
                                            <div className="p-4 border rounded-lg">
                                                <div className="text-sm text-muted-foreground">
                                                    Score
                                                </div>
                                                <div
                                                    className={`text-2xl font-bold ${getScoreColor(
                                                        selectedLesson.summary_score
                                                    )}`}
                                                >
                                                    {
                                                        selectedLesson.summary_score
                                                    }
                                                    %
                                                </div>
                                            </div>
                                        )}
                                        {selectedLesson.summary_feedback && (
                                            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                                <div className="text-sm font-medium mb-2">
                                                    Feedback:
                                                </div>
                                                <p className="text-sm">
                                                    {
                                                        selectedLesson.summary_feedback
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {selectedLesson.summary_suggestions && (
                                            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                                                <div className="text-sm font-medium mb-2">
                                                    Suggestions:
                                                </div>
                                                <p className="text-sm">
                                                    {
                                                        selectedLesson.summary_suggestions
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
