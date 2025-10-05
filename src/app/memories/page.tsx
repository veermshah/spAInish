"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    Brain,
    Plus,
    Trash2,
    FileText,
    RefreshCw,
} from "lucide-react";

type KnowledgeDocument = {
    id: string;
    name: string;
};

type KnowledgeBaseResponse = {
    documents: KnowledgeDocument[];
    next_cursor: string | null;
    has_more: boolean;
};

export default function MemoriesPage() {
    const supabase = createClient();
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [newDocumentText, setNewDocumentText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/knowledge-base", {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch knowledge base documents");
            }

            const data: KnowledgeBaseResponse = await response.json();
            setDocuments(data.documents || []);
        } catch (err: any) {
            console.error("Error loading documents:", err);
            setError(err.message || "Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDocument = async () => {
        if (!newDocumentText.trim()) {
            setError("Please enter some text for the memory");
            return;
        }

        setActionLoading("add");
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/knowledge-base", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: newDocumentText }),
            });

            if (!response.ok) {
                throw new Error("Failed to create knowledge base document");
            }

            const data = await response.json();
            setSuccess(`Memory added successfully: ${data.name}`);
            setNewDocumentText("");
            await loadDocuments();
        } catch (err: any) {
            console.error("Error adding document:", err);
            setError(err.message || "Failed to add memory");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (!confirm("Are you sure you want to delete this memory?")) {
            return;
        }

        setActionLoading(documentId);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/knowledge-base?id=${documentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete document");
            }

            setSuccess("Memory deleted successfully");
            await loadDocuments();
        } catch (err: any) {
            console.error("Error deleting document:", err);
            setError(err.message || "Failed to delete memory");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Brain className="h-8 w-8" />
                        Memories
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage the knowledge base for your AI conversation partner.
                        Add personal information, preferences, or context to make conversations more personalized.
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <Card className="border-red-500">
                        <CardContent className="pt-6">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {success && (
                    <Card className="border-green-500">
                        <CardContent className="pt-6">
                            <p className="text-green-600 dark:text-green-400">{success}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Add New Memory */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add New Memory
                        </CardTitle>
                        <CardDescription>
                            Add information that you want the AI to remember about you
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-memory">Memory Text</Label>
                            <textarea
                                id="new-memory"
                                className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                                placeholder="Example: My name is John and I love hiking. I'm learning Spanish to travel to South America..."
                                value={newDocumentText}
                                onChange={(e) => setNewDocumentText(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleAddDocument}
                            disabled={actionLoading === "add" || !newDocumentText.trim()}
                            className="w-full"
                        >
                            {actionLoading === "add" ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding Memory...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Memory
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Existing Memories */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Your Memories
                                </CardTitle>
                                <CardDescription>
                                    {documents.length} {documents.length === 1 ? "memory" : "memories"} stored
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadDocuments}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No memories stored yet.</p>
                                <p className="text-sm mt-2">
                                    Add your first memory to help the AI learn about you!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-medium">{doc.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {doc.id}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            disabled={actionLoading === doc.id}
                                        >
                                            {actionLoading === doc.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-blue-600 dark:text-blue-400">
                            💡 How Memories Work
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <strong>What are Memories?</strong> Memories are pieces of information stored in the AI's knowledge base that help personalize your conversations.
                        </p>
                        <p>
                            <strong>What to Add:</strong> Personal details, learning goals, preferences, interests, or any context you want the AI to remember.
                        </p>
                        <p>
                            <strong>Examples:</strong>
                        </p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>"I'm a beginner learning Spanish for an upcoming trip to Spain"</li>
                            <li>"I prefer visual learning methods and enjoy cultural topics"</li>
                            <li>"I work as a software engineer and like tech-related examples"</li>
                        </ul>
                        <p className="mt-3">
                            <strong>Privacy:</strong> These memories are stored in your ElevenLabs account and are only accessible to you and your AI conversation partner.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
