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
    Eye,
    X,
} from "lucide-react";

type KnowledgeDocument = {
    id: string;
    name: string;
};

type KnowledgeDocumentDetail = {
    type: string;
    id: string;
    name: string;
    metadata?: {
        createdAtUnixSecs: number;
        lastUpdatedAtUnixSecs: number;
        sizeBytes: number;
    };
    supportedUsages?: string[];
    accessInfo?: {
        isCreator: boolean;
        creatorName: string;
        creatorEmail: string;
        role: string;
    };
    extractedInnerHtml?: string;
    text?: string;
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
    const [viewingDocument, setViewingDocument] =
        useState<KnowledgeDocumentDetail | null>(null);
    const [documentContentLoading, setDocumentContentLoading] = useState(false);

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
        } catch (err) {
            console.error("Error loading documents:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load documents"
            );
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
        } catch (err) {
            console.error("Error adding document:", err);
            setError(
                err instanceof Error ? err.message : "Failed to add memory"
            );
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
            const response = await fetch(
                `/api/knowledge-base?id=${documentId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete document");
            }

            setSuccess("Memory deleted successfully");
            await loadDocuments();
        } catch (err) {
            console.error("Error deleting document:", err);
            setError(
                err instanceof Error ? err.message : "Failed to delete memory"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewDocument = async (documentId: string) => {
        setDocumentContentLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/knowledge-base?id=${documentId}`,
                {
                    method: "GET",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch document content");
            }

            const data = await response.json();
            setViewingDocument(data);
        } catch (err) {
            console.error("Error fetching document:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch document content"
            );
        } finally {
            setDocumentContentLoading(false);
        }
    };

    const closeDocumentView = () => {
        setViewingDocument(null);
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
                        Manage the knowledge base for your AI conversation
                        partner/teacher. Add personal information, preferences,
                        or context to make conversations more personalized.
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <Card className="border-red-500">
                        <CardContent className="pt-6">
                            <p className="text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {success && (
                    <Card className="border-green-500">
                        <CardContent className="pt-6">
                            <p className="text-green-600 dark:text-green-400">
                                {success}
                            </p>
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
                            Add information that you want the AI to remember
                            about you
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
                                onChange={(e) =>
                                    setNewDocumentText(e.target.value)
                                }
                            />
                        </div>
                        <Button
                            onClick={handleAddDocument}
                            disabled={
                                actionLoading === "add" ||
                                !newDocumentText.trim()
                            }
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
                                    {documents.length}{" "}
                                    {documents.length === 1
                                        ? "memory"
                                        : "memories"}{" "}
                                    stored
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
                                    Add your first memory to help the AI learn
                                    about you!
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
                                                <h3 className="font-medium">
                                                    {doc.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {doc.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleViewDocument(doc.id)
                                                }
                                                disabled={
                                                    documentContentLoading
                                                }
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteDocument(doc.id)
                                                }
                                                disabled={
                                                    actionLoading === doc.id
                                                }
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
                            How Memories Work
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <strong>What are Memories?</strong> Memories are
                            pieces of information stored in the AI&apos;s
                            knowledge base that help personalize your
                            conversations.
                        </p>
                        <p>
                            <strong>What to Add:</strong> Personal details,
                            learning goals, preferences, interests, or any
                            context you want the AI to remember.
                        </p>
                        <p>
                            <strong>Examples:</strong>
                        </p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>
                                &quot;I&apos;m a beginner learning Spanish for
                                an upcoming trip to Spain&quot;
                            </li>
                            <li>
                                &quot;I prefer visual learning methods and enjoy
                                cultural topics&quot;
                            </li>
                            <li>
                                &quot;I work as a software engineer and like
                                tech-related examples&quot;
                            </li>
                        </ul>
                        <p className="mt-3">
                            <strong>Privacy:</strong> These memories are stored
                            in your ElevenLabs account and are only accessible
                            to you and your AI conversation partner.
                        </p>
                    </CardContent>
                </Card>

                {/* Document Viewer Modal */}
                {viewingDocument && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Memory Content
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeDocumentView}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardDescription>
                                    {viewingDocument.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Document ID */}
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">
                                            Document ID
                                        </div>
                                        <code className="text-sm bg-muted px-2 py-1 rounded">
                                            {viewingDocument.id}
                                        </code>
                                    </div>

                                    {/* Extracted Content */}
                                    {viewingDocument.extractedInnerHtml && (
                                        <div>
                                            <div className="text-sm font-medium mb-2">
                                                Content
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg border">
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {
                                                        viewingDocument.extractedInnerHtml
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fallback to text field if extractedInnerHtml not available */}
                                    {!viewingDocument.extractedInnerHtml &&
                                        viewingDocument.text && (
                                            <div>
                                                <div className="text-sm font-medium mb-2">
                                                    Content
                                                </div>
                                                <div className="p-4 bg-muted/50 rounded-lg border">
                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                        {viewingDocument.text}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {/* Metadata */}
                                    {viewingDocument.metadata && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                                Metadata
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="p-3 bg-muted rounded">
                                                    <div className="text-muted-foreground mb-1">
                                                        Created
                                                    </div>
                                                    <div>
                                                        {new Date(
                                                            viewingDocument
                                                                .metadata
                                                                .createdAtUnixSecs *
                                                                1000
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-muted rounded">
                                                    <div className="text-muted-foreground mb-1">
                                                        Last Updated
                                                    </div>
                                                    <div>
                                                        {new Date(
                                                            viewingDocument
                                                                .metadata
                                                                .lastUpdatedAtUnixSecs *
                                                                1000
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-muted rounded">
                                                    <div className="text-muted-foreground mb-1">
                                                        Size
                                                    </div>
                                                    <div>
                                                        {
                                                            viewingDocument
                                                                .metadata
                                                                .sizeBytes
                                                        }{" "}
                                                        bytes
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-muted rounded">
                                                    <div className="text-muted-foreground mb-1">
                                                        Type
                                                    </div>
                                                    <div>
                                                        {viewingDocument.type}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Access Info */}
                                    {viewingDocument.accessInfo && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                                Access Information
                                            </div>
                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Creator:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            viewingDocument
                                                                .accessInfo
                                                                .creatorName
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Email:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            viewingDocument
                                                                .accessInfo
                                                                .creatorEmail
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Role:
                                                    </span>
                                                    <span className="font-medium capitalize">
                                                        {
                                                            viewingDocument
                                                                .accessInfo.role
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Supported Usages */}
                                    {viewingDocument.supportedUsages &&
                                        viewingDocument.supportedUsages.length >
                                            0 && (
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                                    Supported Usages
                                                </div>
                                                <div className="flex gap-2">
                                                    {viewingDocument.supportedUsages.map(
                                                        (usage, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium"
                                                            >
                                                                {usage}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
