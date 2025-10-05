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
import { User } from "lucide-react";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
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

    // Generate streak data (last 30 days)
    const generateStreakData = () => {
        const today = new Date();
        const streakData = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay();
            
            // Simulate some activity (you'll replace this with actual data)
            const hasActivity = Math.random() > 0.5;
            
            streakData.push({
                date: date.toISOString().split('T')[0],
                day: date.getDate(),
                hasActivity,
                isToday: i === 0,
            });
        }
        
        return streakData;
    };

    const streakData = generateStreakData();
    const currentStreak = streakData.filter(d => d.hasActivity).length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                    )}
                </div>
                
                <div>
                    <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {profile?.first_name || user?.email}!
                    </p>
                </div>
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
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                                0
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Conversations completed
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
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
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium">User ID:</span>
                                <span className="text-muted-foreground font-mono text-sm">
                                    {user?.id}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="font-medium">
                                    Account created:
                                </span>
                                <span className="text-muted-foreground">
                                    {new Date(
                                        user?.created_at
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
