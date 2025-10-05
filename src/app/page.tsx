"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import dynamic from "next/dynamic";

const Spline = dynamic(
    () => import("@splinetool/react-spline").then((mod) => mod.default),
    {
        ssr: false,
    }
);

export default function Home() {
    const phrases = [
        "Master Spanish with AI",
        "Practice Speaking Daily",
        "Get Instant Feedback",
        "Achieve Fluency Faster",
    ];

    const [text, setText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];

        if (!isDeleting && currentIndex < currentPhrase.length) {
            // Typing
            const timeout = setTimeout(() => {
                setText(currentPhrase.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, 100);
            return () => clearTimeout(timeout);
        } else if (!isDeleting && currentIndex === currentPhrase.length) {
            // Pause at end before deleting
            const timeout = setTimeout(() => {
                setIsDeleting(true);
            }, 2000);
            return () => clearTimeout(timeout);
        } else if (isDeleting && currentIndex > 0) {
            // Deleting
            const timeout = setTimeout(() => {
                setText(currentPhrase.slice(0, currentIndex - 1));
                setCurrentIndex(currentIndex - 1);
            }, 50);
            return () => clearTimeout(timeout);
        } else if (isDeleting && currentIndex === 0) {
            // Move to next phrase
            setIsDeleting(false);
            setCurrentPhraseIndex(
                (prevIndex) => (prevIndex + 1) % phrases.length
            );
        }
    }, [currentIndex, isDeleting, currentPhraseIndex]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 relative">
            {/* Globe Background - only render on client */}
            {mounted && (
                <div className="absolute inset-0 z-0">
                    <Spline scene="https://prod.spline.design/DMgqegIru5gadIVJ/scene.splinecode" />
                </div>
            )}

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8 max-w-5xl mx-auto">
                    {/* Main Heading with Typewriter Effect */}
                    <h1 className="text-6xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
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
                        <button
                            className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                            onClick={() => {
                                window.location.href = "/signup";
                            }}
                        >
                            <span className="relative z-10">
                                Start Learning Free
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
