"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { Profile } from "@/types/database";

interface UserData {
    id: string;
    email?: string;
    created_at?: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [streakCount, setStreakCount] = useState(0);
    const [conversationCount, setConversationCount] = useState(0);
    const [totalCallTime, setTotalCallTime] = useState(0);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setUser(user);

            // Fetch profile data
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
            }

            // Get streak count
            const { data: streakData } = await supabase.rpc(
                "get_streak_count",
                {
                    user_id: user.id,
                }
            );

            if (streakData !== null) {
                setStreakCount(streakData);
            }

            // Fetch conversation data
            try {
                const response = await fetch("/api/conversations");
                const data = await response.json();
                const conversations = data.conversations || [];
                setConversationCount(conversations.length);

                // Calculate total call time in minutes
                const totalSeconds = conversations.reduce(
                    (sum: number, conv: any) =>
                        sum + (conv.callDurationSecs || 0),
                    0
                );
                setTotalCallTime(Math.round(totalSeconds / 60));
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }

            setLoading(false);
        };

        getUser();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Generate streak data (last 30 days) from actual activity dates
    const generateStreakData = () => {
        const today = new Date();
        const streakData = [];
        const activityDates = new Set(
            profile?.activity_dates?.map((date) => date.split("T")[0]) || []
        );

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split("T")[0];

            streakData.push({
                date: dateString,
                day: date.getDate(),
                hasActivity: activityDates.has(dateString),
                isToday: i === 0,
            });
        }

        return streakData;
    };

    const streakData = generateStreakData();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {profile?.first_name || user?.email}!
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Practice</CardTitle>
                        <CardDescription>
                            Start a conversation practice session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/practice">
                            <Button className="w-full">Start Practice</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transcripts</CardTitle>
                        <CardDescription>
                            View your conversation history
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/transcripts">
                            <Button className="w-full" variant="outline">
                                View Transcripts
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Progress</CardTitle>
                        <CardDescription>
                            Track your learning journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-around gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {conversationCount}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Conversations
                                </p>
                            </div>
                            <div className="h-12 w-px bg-border"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {totalCallTime}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Minutes
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium">Email:</span>
                                <span className="text-muted-foreground">
                                    {user?.email}
                                </span>
                            </div>
                            {profile?.birthdate && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium">
                                        Birthday:
                                    </span>
                                    <span className="text-muted-foreground">
                                        {(() => {
                                            const [year, month, day] =
                                                profile.birthdate.split("-");
                                            const date = new Date(
                                                parseInt(year),
                                                parseInt(month) - 1,
                                                parseInt(day)
                                            );
                                            return date.toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }
                                            );
                                        })()}
                                    </span>
                                </div>
                            )}
                            {profile?.learning_languages &&
                                profile.learning_languages.length > 0 && (
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="font-medium">
                                            Learning:
                                        </span>
                                        <span className="text-muted-foreground">
                                            {profile.learning_languages.join(
                                                ", "
                                            )}
                                        </span>
                                    </div>
                                )}
                            {profile?.phone_number && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium">Phone:</span>
                                    <span className="text-muted-foreground">
                                        {profile.phone_number}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-2">
                                <span className="font-medium">
                                    Account created:
                                </span>
                                <span className="text-muted-foreground">
                                    {user?.created_at
                                        ? new Date(
                                              user.created_at
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Streak Calendar */}
                <Card className="md:col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Practice Streak</CardTitle>
                        <CardDescription>
                            Your learning consistency over the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {streakCount}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Day Streak
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Last 30 days
                                </div>
                            </div>

                            {/* Streak Grid */}
                            <div className="grid grid-cols-10 gap-2">
                                {streakData.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            aspect-square rounded-sm flex items-center justify-center text-xs
                                            transition-all duration-200 hover:scale-110
                                            ${
                                                day.hasActivity
                                                    ? "bg-primary text-primary-foreground font-semibold"
                                                    : "bg-muted text-muted-foreground"
                                            }
                                            ${
                                                day.isToday
                                                    ? "ring-2 ring-primary ring-offset-2"
                                                    : ""
                                            }
                                        `}
                                        title={`${day.date}${
                                            day.hasActivity
                                                ? " - Active"
                                                : " - No activity"
                                        }`}
                                    >
                                        {day.day}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 text-sm pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-muted rounded-sm"></div>
                                    <span className="text-muted-foreground">
                                        No activity
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-primary rounded-sm"></div>
                                    <span className="text-muted-foreground">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
