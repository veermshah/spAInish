"use client";

import React, { useState } from "react";
import Script from "next/script";
import {
    MessageCircle,
    Sparkles,
    TrendingUp,
    Mic,
    Target,
    Zap,
} from "lucide-react";

export default function Practice() {
    const [isWidgetReady, setIsWidgetReady] = useState(false);

    const conversationStarters = [
        {
            icon: "👋",
            text: "¡Hola! ¿Cómo estás?",
            translation: "Hello! How are you?",
        },
        {
            icon: "🍽️",
            text: "¿Qué te gusta comer?",
            translation: "What do you like to eat?",
        },
        {
            icon: "🎬",
            text: "¿Cuál es tu película favorita?",
            translation: "What's your favorite movie?",
        },
        {
            icon: "🌍",
            text: "¿De dónde eres?",
            translation: "Where are you from?",
        },
    ];

    const tips = [
        {
            icon: Mic,
            title: "Speak Naturally",
            description:
                "Don't worry about mistakes - they're part of learning!",
        },
        {
            icon: Target,
            title: "Stay Focused",
            description: "Practice regularly for the best results",
        },
        {
            icon: Zap,
            title: "Be Bold",
            description: "Try new phrases and vocabulary",
        },
    ];

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
                {/* Hero Section */}
                <div className="mr-auto w-full lg:w-2/3 px-4 pt-12 pb-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Sparkles className="h-4 w-4" />
                                AI-Powered Spanish Practice
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Practice Spanish
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Have natural conversations with our AI tutor.
                                Click the assistant in the bottom left to start
                                speaking!
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MessageCircle className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <h3 className="font-semibold text-lg">
                                        Real Conversations
                                    </h3>
                                </div>
                                <p className="text-muted-foreground">
                                    Practice with lifelike AI conversations that
                                    adapt to your level
                                </p>
                            </div>

                            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <h3 className="font-semibold text-lg">
                                        Track Progress
                                    </h3>
                                </div>
                                <p className="text-muted-foreground">
                                    See your improvement over time with detailed
                                    transcripts
                                </p>
                            </div>

                            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-pink-500/10 rounded-lg">
                                        <Sparkles className="h-6 w-6 text-pink-500" />
                                    </div>
                                    <h3 className="font-semibold text-lg">
                                        Instant Feedback
                                    </h3>
                                </div>
                                <p className="text-muted-foreground">
                                    Get corrections and suggestions in real-time
                                </p>
                            </div>
                        </div>

                        {/* Conversation Starters */}
                        <div className="bg-card border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <MessageCircle className="h-6 w-6 text-primary" />
                                Conversation Starters
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {conversationStarters.map((starter, index) => (
                                    <div
                                        key={index}
                                        className="group p-4 rounded-xl border bg-background hover:bg-accent/50 transition-all cursor-pointer hover:scale-[1.02]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">
                                                {starter.icon}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium text-lg mb-1">
                                                    {starter.text}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {starter.translation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">
                                Tips for Success
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {tips.map((tip, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="p-3 bg-background rounded-lg border">
                                                <tip.icon className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">
                                                {tip.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {tip.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></div>
                                <span>
                                    AI Assistant ready in bottom left corner
                                </span>
                            </div>
                        </div>
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
