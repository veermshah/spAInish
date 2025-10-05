"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import Image from "next/image";

const LANGUAGES = [
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Mandarin Chinese",
    "Japanese",
    "Korean",
    "Arabic",
    "Russian",
    "Hindi",
    "Dutch",
];

interface UserData {
    id: string;
    email?: string;
}

export default function ProfileSetupPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        birthdate: "",
        phoneNumber: "",
        learningLanguages: [] as string[],
    });

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

            // Check if profile already exists
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                // Profile exists, populate form
                setFormData({
                    firstName: profile.first_name || "",
                    lastName: profile.last_name || "",
                    birthdate: profile.birthdate || "",
                    phoneNumber: profile.phone_number || "",
                    learningLanguages: profile.learning_languages || [],
                });
                setProfileImageUrl(profile.avatar_url || null);
            }

            setLoading(false);
        };

        getUser();
    }, [router, supabase]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }
            setProfileImageFile(file);
            setProfileImageUrl(URL.createObjectURL(file));
        }
    };

    const uploadProfileImage = async () => {
        if (!profileImageFile || !user) return null;

        setUploading(true);
        try {
            const fileExt = profileImageFile.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            console.log("Uploading image to:", filePath);

            const { error: uploadError, data } = await supabase.storage
                .from("profiles")
                .upload(filePath, profileImageFile, { upsert: true });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }

            console.log("Upload successful:", data);

            const {
                data: { publicUrl },
            } = supabase.storage.from("profiles").getPublicUrl(filePath);

            console.log("Public URL:", publicUrl);

            return publicUrl;
        } catch (err: any) {
            console.error("Error uploading image:", err);
            setError("Failed to upload profile image: " + err.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleLanguageToggle = (language: string) => {
        setFormData((prev) => ({
            ...prev,
            learningLanguages: prev.learningLanguages.includes(language)
                ? prev.learningLanguages.filter((l) => l !== language)
                : [...prev.learningLanguages, language],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            // Upload image first if selected
            let avatarUrl = profileImageUrl;
            if (profileImageFile) {
                const uploadedUrl = await uploadProfileImage();
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl;
                } else if (!profileImageUrl) {
                    // If upload failed and there's no existing URL, set to null
                    avatarUrl = null;
                }
            }

            // Save profile data
            const profileData = {
                id: user.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                birthdate: formData.birthdate,
                phone_number: formData.phoneNumber,
                learning_languages: formData.learningLanguages,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            console.log("Saving profile with data:", profileData);

            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert(profileData);

            if (upsertError) throw upsertError;

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Error saving profile:", err);
            setError(err.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Set Up Your Profile</CardTitle>
                    <CardDescription>
                        Tell us about yourself to personalize your learning
                        experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Profile Picture */}
                        <div className="space-y-2">
                            <Label>Profile Picture</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted mt-5">
                                    {profileImageUrl ? (
                                        <Image
                                            src={profileImageUrl}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            <Upload className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 ml-6">
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="avatar"
                                        className="cursor-pointer"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                document
                                                    .getElementById("avatar")
                                                    ?.click()
                                            }
                                            disabled={uploading}
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Photo
                                                </>
                                            )}
                                        </Button>
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Max 5MB (JPG, PNG)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            firstName: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={saving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            lastName: e.target.value,
                                        }))
                                    }
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Birthdate */}
                        <div className="space-y-2">
                            <Label htmlFor="birthdate">Birthdate</Label>
                            <Input
                                id="birthdate"
                                type="date"
                                value={formData.birthdate}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        birthdate: e.target.value,
                                    }))
                                }
                                disabled={saving}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={formData.phoneNumber}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        phoneNumber: e.target.value,
                                    }))
                                }
                                disabled={saving}
                            />
                        </div>

                        {/* Learning Languages */}
                        <div className="space-y-2">
                            <Label>Languages You're Learning *</Label>
                            <p className="text-sm text-muted-foreground">
                                Select at least one language
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {LANGUAGES.map((language) => (
                                    <button
                                        key={language}
                                        type="button"
                                        onClick={() =>
                                            handleLanguageToggle(language)
                                        }
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            formData.learningLanguages.includes(
                                                language
                                            )
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        }`}
                                        disabled={saving}
                                    >
                                        {language}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={
                                    saving ||
                                    !formData.firstName ||
                                    !formData.lastName ||
                                    formData.learningLanguages.length === 0
                                }
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Profile"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/dashboard")}
                                disabled={saving}
                            >
                                Skip for Now
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
