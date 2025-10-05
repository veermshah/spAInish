"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    ChevronDown,
    ChevronRight,
    Calendar,
    Clock,
    MessageSquare,
    Play,
    Pause,
    Volume2,
    CheckCircle,
    XCircle,
    Loader2,
    User,
    Bot,
} from "lucide-react";

interface Conversation {
    agentId: string;
    agentName: string;
    conversationId: string;
    startTimeUnixSecs: number;
    callDurationSecs: number;
    messageCount: number;
    status: string;
    callSuccessful: string;
    transcriptSummary?: string | null;
    callSummaryTitle?: string | null;
    direction?: string | null;
}

interface TranscriptMessage {
    role: string;
    message: string;
    timeInCallSecs: number;
}

interface ConversationDetail {
    conversationId: string;
    transcript: TranscriptMessage[];
    hasAudio: boolean;
    metadata: {
        callDurationSecs: number;
    };
}

export default function Transcripts() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [conversationDetails, setConversationDetails] = useState<
        Record<string, ConversationDetail>
    >({});
    const [loadingDetails, setLoadingDetails] = useState<
        Record<string, boolean>
    >({});
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch("/api/conversations");
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversationDetails = async (conversationId: string) => {
        if (conversationDetails[conversationId]) {
            return; // Already loaded
        }

        setLoadingDetails((prev) => ({ ...prev, [conversationId]: true }));

        try {
            const response = await fetch(
                `/api/conversations/${conversationId}`
            );
            const data = await response.json();
            setConversationDetails((prev) => ({
                ...prev,
                [conversationId]: data,
            }));
        } catch (error) {
            console.error("Error fetching conversation details:", error);
        } finally {
            setLoadingDetails((prev) => ({ ...prev, [conversationId]: false }));
        }
    };

    const handleRowClick = async (conversationId: string) => {
        if (expandedId === conversationId) {
            // Collapse
            setExpandedId(null);
            if (playingAudio === conversationId) {
                audioRef.current?.pause();
                setPlayingAudio(null);
            }
        } else {
            // Expand
            setExpandedId(conversationId);
            await fetchConversationDetails(conversationId);

            // Start playing audio
            const audioUrl = `/api/conversations/${conversationId}/audio`;
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current
                    .play()
                    .then(() => {
                        setPlayingAudio(conversationId);
                    })
                    .catch((error) => {
                        console.error("Error playing audio:", error);
                    });
            }
        }
    };

    const toggleAudio = (conversationId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (playingAudio === conversationId) {
            audioRef.current?.pause();
            setPlayingAudio(null);
        } else {
            const audioUrl = `/api/conversations/${conversationId}/audio`;
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current
                    .play()
                    .then(() => {
                        setPlayingAudio(conversationId);
                    })
                    .catch((error) => {
                        console.error("Error playing audio:", error);
                    });
            }
        }
    };

    const formatDate = (unixSecs: number) => {
        const date = new Date(unixSecs * 1000);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (unixSecs: number) => {
        const date = new Date(unixSecs * 1000);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getStatusIcon = (status: string, callSuccessful: string) => {
        if (status === "done" && callSuccessful === "success") {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        return <XCircle className="h-4 w-4 text-red-500" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Conversation Transcripts
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Review your past conversations and track your
                            progress
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card border rounded-lg p-4">
                            <div className="text-2xl font-bold text-primary">
                                {conversations.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Conversations
                            </div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <div className="text-2xl font-bold text-primary">
                                {
                                    conversations.filter(
                                        (c) => c.callSuccessful === "success"
                                    ).length
                                }
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Successful Calls
                            </div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <div className="text-2xl font-bold text-primary">
                                {Math.floor(
                                    conversations.reduce(
                                        (acc, c) => acc + c.callDurationSecs,
                                        0
                                    ) / 60
                                )}
                                m
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Practice Time
                            </div>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="space-y-3">
                        {conversations.map((conversation) => {
                            const isExpanded =
                                expandedId === conversation.conversationId;
                            const details =
                                conversationDetails[
                                    conversation.conversationId
                                ];
                            const isLoading =
                                loadingDetails[conversation.conversationId];
                            const isPlaying =
                                playingAudio === conversation.conversationId;

                            return (
                                <div
                                    key={conversation.conversationId}
                                    className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                                >
                                    {/* Row Header */}
                                    <div
                                        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() =>
                                            handleRowClick(
                                                conversation.conversationId
                                            )
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Expand/Collapse Icon */}
                                                <div className="flex-shrink-0">
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>

                                                {/* Title & Status */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {getStatusIcon(
                                                            conversation.status,
                                                            conversation.callSuccessful
                                                        )}
                                                        <h3 className="font-semibold truncate">
                                                            {conversation.callSummaryTitle ||
                                                                "Untitled Conversation"}
                                                        </h3>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(
                                                                conversation.startTimeUnixSecs
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(
                                                                conversation.startTimeUnixSecs
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {
                                                                conversation.messageCount
                                                            }{" "}
                                                            messages
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDuration(
                                                                conversation.callDurationSecs
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Agent Badge */}
                                                <div className="flex-shrink-0 hidden md:block">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                        <Bot className="h-3 w-3" />
                                                        {conversation.agentName}
                                                    </span>
                                                </div>

                                                {/* Play Button */}
                                                <button
                                                    onClick={(e) =>
                                                        toggleAudio(
                                                            conversation.conversationId,
                                                            e
                                                        )
                                                    }
                                                    className="flex-shrink-0 p-2 rounded-full hover:bg-accent transition-colors"
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <Play className="h-5 w-5 text-primary" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t bg-accent/20 p-6">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            ) : details &&
                                              details.transcript &&
                                              details.transcript.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Volume2 className="h-5 w-5 text-primary" />
                                                        <h4 className="font-semibold">
                                                            Transcript
                                                        </h4>
                                                    </div>
                                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                        {details.transcript.map(
                                                            (
                                                                message,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={`${conversation.conversationId}-${index}-${message.timeInCallSecs}`}
                                                                    className={`flex gap-3 ${
                                                                        message.role ===
                                                                        "user"
                                                                            ? "flex-row-reverse"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                                            message.role ===
                                                                            "user"
                                                                                ? "bg-blue-500/10"
                                                                                : "bg-purple-500/10"
                                                                        }`}
                                                                    >
                                                                        {message.role ===
                                                                        "user" ? (
                                                                            <User className="h-4 w-4 text-blue-500" />
                                                                        ) : (
                                                                            <Bot className="h-4 w-4 text-purple-500" />
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        className={`flex-1 rounded-lg p-3 ${
                                                                            message.role ===
                                                                            "user"
                                                                                ? "bg-blue-500/10 text-right"
                                                                                : "bg-background"
                                                                        }`}
                                                                    >
                                                                        <p className="text-sm mb-1">
                                                                            {
                                                                                message.message
                                                                            }
                                                                        </p>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {formatDuration(
                                                                                message.timeInCallSecs
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                    <p>
                                                        No transcript available
                                                        for this conversation
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {conversations.length === 0 && (
                        <div className="text-center py-12">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">
                                No conversations yet
                            </h3>
                            <p className="text-muted-foreground">
                                Start practicing to see your conversation
                                history here
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden Audio Player */}
            <audio
                ref={audioRef}
                onEnded={() => setPlayingAudio(null)}
                onPause={() => setPlayingAudio(null)}
            />
        </div>
    );
}
