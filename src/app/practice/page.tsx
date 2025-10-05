"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";
import { Phone, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Practice() {
    const [isWidgetReady, setIsWidgetReady] = useState(false);
    const [activityRecorded, setActivityRecorded] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [callLoading, setCallLoading] = useState(false);
    const [callFrequency, setCallFrequency] = useState("daily");
    const [callTime, setCallTime] = useState("18:00");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const getPhoneNumber = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("phone_number")
                    .eq("id", user.id)
                    .single();
                
                if (profile?.phone_number) {
                    setPhoneNumber(profile.phone_number);
                }
            }
            setLoading(false);
        };

        getPhoneNumber();
    }, [supabase]);

    // Record activity when widget is ready and used
    useEffect(() => {
        if (isWidgetReady && !activityRecorded) {
            const recordActivity = async () => {
                try {
                    await fetch("/api/activity", {
                        method: "POST",
                    });
                    setActivityRecorded(true);
                } catch (error) {
                    console.error("Failed to record activity:", error);
                }
            };

            const handleWidgetClick = () => {
                if (!activityRecorded) {
                    recordActivity();
                }
            };

            const widget = document.querySelector("elevenlabs-convai");
            if (widget) {
                widget.addEventListener("click", handleWidgetClick);
                return () =>
                    widget.removeEventListener("click", handleWidgetClick);
            }
        }
    }, [isWidgetReady, activityRecorded]);

    const handleCallNow = async () => {
        setCallLoading(true);
        setMessage(null);
        
        try {
            const response = await fetch("/api/call", {
                method: "POST",
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Call initiated! You should receive a call shortly.' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to initiate call' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to initiate call' });
        } finally {
            setCallLoading(false);
        }
    };

    const handleScheduleCall = async () => {
        setMessage(null);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setMessage({ type: 'error', text: 'Please log in to schedule calls' });
                return;
            }

            // Save schedule to database
            const { error } = await supabase
                .from('profiles')
                .update({
                    call_schedule: {
                        frequency: callFrequency,
                        time: callTime,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    call_schedule_enabled: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                setMessage({ type: 'error', text: 'Failed to save schedule: ' + error.message });
            } else {
                setMessage({ 
                    type: 'success', 
                    text: `Scheduled ${callFrequency} calls at ${callTime}. You'll receive calls automatically!` 
                });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to save schedule' });
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
                <div className="mr-auto w-full lg:w-2/3 px-4 pt-12 pb-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Practice Spanish
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Chat with our AI assistant or schedule phone calls to practice anytime
                            </p>
                        </div>

                        {/* Phone Call Section */}
                        {!loading && (
                            <div className="grid gap-6 md:grid-cols-2 mb-8">
                                {/* Call Now Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            Call Now
                                        </CardTitle>
                                        <CardDescription>
                                            Start a practice conversation immediately
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {phoneNumber && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Calling number:
                                                </p>
                                                <p className="font-medium">{phoneNumber}</p>
                                            </div>
                                        )}
                                        
                                        {!phoneNumber && (
                                            <div className="p-3 bg-destructive/10 rounded-lg">
                                                <p className="text-sm text-destructive">
                                                    Please add your phone number in your profile to receive calls
                                                </p>
                                            </div>
                                        )}

                                        <Button 
                                            className="w-full" 
                                            onClick={handleCallNow}
                                            disabled={!phoneNumber || callLoading}
                                        >
                                            {callLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Calling...
                                                </>
                                            ) : (
                                                <>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Call Me Now
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Schedule Calls Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Schedule Calls
                                        </CardTitle>
                                        <CardDescription>
                                            Set up recurring practice calls
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency">Frequency</Label>
                                            <select
                                                id="frequency"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={callFrequency}
                                                onChange={(e) => setCallFrequency(e.target.value)}
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekdays">Weekdays Only</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="biweekly">Bi-weekly</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="time">Preferred Time</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={callTime}
                                                onChange={(e) => setCallTime(e.target.value)}
                                            />
                                        </div>

                                        <Button 
                                            className="w-full" 
                                            variant="outline"
                                            onClick={handleScheduleCall}
                                            disabled={!phoneNumber}
                                        >
                                            <Clock className="mr-2 h-4 w-4" />
                                            Schedule Calls
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Message Display */}
                        {message && (
                            <div className={`mb-8 p-4 rounded-lg ${
                                message.type === 'success' 
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                                    : 'bg-destructive/10 text-destructive'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Web Chat Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Practice via Web Chat</CardTitle>
                                <CardDescription>
                                    Click the assistant in the bottom left corner to start a conversation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center py-8">
                                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                                        <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></div>
                                        <span>AI Assistant ready in bottom left corner</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ElevenLabs Widget - Positioned Bottom Left */}
                <div className="fixed bottom-6 left-6 z-50">
                    <elevenlabs-convai agent-id="agent_6201k6shnp39eheavzgd5afg85pr"></elevenlabs-convai>
                </div>
            </div>

            <Script
                src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                strategy="lazyOnload"
                type="text/javascript"
                onLoad={() => setIsWidgetReady(true)}
            />

            {/* Custom Styles for ElevenLabs Widget */}
            <style jsx global>{`
                elevenlabs-convai {
                    --elevation: 0 10px 40px rgba(0, 0, 0, 0.15);
                    display: block;
                }
            `}</style>
        </>
    );
}
