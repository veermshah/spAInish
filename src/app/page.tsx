"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

export default function Home() {
    const [text, setText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const fullText = "Master Spanish with AI";
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setText(fullText.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8 max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-1000">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                            AI-Powered Language Learning
                        </span>
                    </div>

                    {/* Main Heading with Typewriter Effect */}
                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                            {text}
                            {showCursor && (
                                <span className="inline-block w-1 h-[0.8em] ml-2 bg-primary animate-pulse"></span>
                            )}
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
                        Learn Spanish naturally with cutting-edge AI technology.
                        <span className="text-foreground font-semibold">
                            {" "}
                            Practice speaking, get instant feedback,{" "}
                        </span>
                        and achieve fluency faster than ever.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
                        <button className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="relative z-10">
                                Start Learning Free
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        </button>

                        <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg text-lg font-semibold border-2 border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm">
                            Watch Demo
                        </button>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-6 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-1000">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border backdrop-blur-sm">
                            <Zap className="w-5 h-5 text-chart-1" />
                            <span className="text-sm font-medium">
                                Instant Feedback
                            </span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 text-chart-2" />
                            <span className="text-sm font-medium">
                                Track Progress
                            </span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-chart-3" />
                            <span className="text-sm font-medium">
                                Personalized AI Coach
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto animate-in fade-in zoom-in duration-1000 delay-1200">
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-primary">
                                10k+
                            </div>
                            <div className="text-sm sm:text-base text-muted-foreground mt-2">
                                Active Learners
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-primary">
                                95%
                            </div>
                            <div className="text-sm sm:text-base text-muted-foreground mt-2">
                                Success Rate
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-primary">
                                24/7
                            </div>
                            <div className="text-sm sm:text-base text-muted-foreground mt-2">
                                AI Support
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
