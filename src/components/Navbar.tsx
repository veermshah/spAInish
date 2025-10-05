"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { User, LogOut, LogIn } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";

interface UserData {
    id: string;
    email?: string;
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const navItems = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Practice", href: "/practice" },
        { name: "Lessons", href: "/lessons" },
        { name: "Analytics", href: "/analytics" },
        { name: "Memories", href: "/memories" },
        { name: "Transcripts", href: "/transcripts" },
    ];

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className="text-4xl font-bold bg-gradient-to-r text-purple-500 bg-clip-text hover:from-blue-500 hover:to-purple-500 transition-all"
                        >
                            Habla
                        </Link>
                    </div>

                    {/* Navigation Links - Center */}
                    <div className="hidden md:flex md:items-center md:space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    relative px-4 py-2 text-xl font-medium rounded-md transition-all duration-200
                                    ${
                                        isActive(item.href)
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }
                                `}
                            >
                                {item.name}
                                {isActive(item.href) && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Theme Toggle & Auth Buttons */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />

                        {/* Auth Buttons */}
                        {!loading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/profile-setup"
                                            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <User className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Profile
                                            </span>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Logout
                                            </span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link href="/login">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <LogIn className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    Login
                                                </span>
                                            </Button>
                                        </Link>
                                        <Link href="/signup">
                                            <Button
                                                size="sm"
                                                className="hidden sm:inline-flex"
                                            >
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                            aria-label="Open menu"
                            onClick={(e) => {
                                const menu =
                                    document.getElementById("mobile-menu");
                                menu?.classList.toggle("hidden");
                            }}
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div id="mobile-menu" className="hidden md:hidden pb-4">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    block px-4 py-2 text-base font-medium rounded-md transition-colors
                                    ${
                                        isActive(item.href)
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }
                                `}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
