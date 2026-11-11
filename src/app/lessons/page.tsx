"use client";

import { useState, useRef, useEffect } from "react";
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
    BookOpen,
    Brain,
    PenTool,
    CheckCircle,
    Play,
    Pause,
    Volume2,
} from "lucide-react";

type QuizQuestion = {
    question: string;
    options: string[];
    correctAnswer: number;
};

type Evaluation = {
    score: number;
    feedback: string;
    suggestions: string;
};

type ArticleSection = {
    text: string;
    imagePrompt: string;
};

type ArticleData = {
    title: string;
    sections: ArticleSection[];
};

export default function LessonsPage() {
    const supabase = createClient();
    const [step, setStep] = useState<
        "input" | "article" | "quiz" | "summary" | "results"
    >("input");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState<
        "beginner" | "intermediate" | "advanced"
    >("beginner");
    const [loading, setLoading] = useState(false);
    const [articleData, setArticleData] = useState<ArticleData | null>(null);
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [userSummary, setUserSummary] = useState("");
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

    // Text-to-speech state
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [currentCharIndex, setCurrentCharIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioDataRef = useRef<{
        alignment: {
            characters: string[];
            character_start_times_seconds: number[];
            character_end_times_seconds: number[];
        };
        fullText: string;
    } | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Mini-game state
    const [gameScore, setGameScore] = useState(0);
    const [currentWord, setCurrentWord] = useState({
        spanish: "",
        english: "",
        options: [] as string[],
    });
    const [gameWords] = useState([
        // Greetings & Basic Phrases
        { spanish: "Hola", english: "Hello" },
        { spanish: "Adiós", english: "Goodbye" },
        { spanish: "Gracias", english: "Thank you" },
        { spanish: "Por favor", english: "Please" },
        { spanish: "Perdón", english: "Excuse me" },
        { spanish: "Lo siento", english: "I&apos;m sorry" },
        { spanish: "Buenos días", english: "Good morning" },
        { spanish: "Buenas noches", english: "Good night" },
        { spanish: "Hasta luego", english: "See you later" },

        // Common Objects
        { spanish: "Agua", english: "Water" },
        { spanish: "Casa", english: "House" },
        { spanish: "Libro", english: "Book" },
        { spanish: "Mesa", english: "Table" },
        { spanish: "Silla", english: "Chair" },
        { spanish: "Puerta", english: "Door" },
        { spanish: "Ventana", english: "Window" },
        { spanish: "Cama", english: "Bed" },
        { spanish: "Coche", english: "Car" },
        { spanish: "Bicicleta", english: "Bicycle" },
        { spanish: "Teléfono", english: "Phone" },
        { spanish: "Computadora", english: "Computer" },
        { spanish: "Reloj", english: "Clock/Watch" },
        { spanish: "Llave", english: "Key" },
        { spanish: "Bolso", english: "Bag" },

        // Animals
        { spanish: "Gato", english: "Cat" },
        { spanish: "Perro", english: "Dog" },
        { spanish: "Pájaro", english: "Bird" },
        { spanish: "Pez", english: "Fish" },
        { spanish: "Caballo", english: "Horse" },
        { spanish: "Vaca", english: "Cow" },
        { spanish: "Cerdo", english: "Pig" },
        { spanish: "Pollo", english: "Chicken" },
        { spanish: "Ratón", english: "Mouse" },
        { spanish: "Elefante", english: "Elephant" },

        // Food & Drink
        { spanish: "Pan", english: "Bread" },
        { spanish: "Leche", english: "Milk" },
        { spanish: "Café", english: "Coffee" },
        { spanish: "Té", english: "Tea" },
        { spanish: "Manzana", english: "Apple" },
        { spanish: "Naranja", english: "Orange" },
        { spanish: "Plátano", english: "Banana" },
        { spanish: "Queso", english: "Cheese" },
        { spanish: "Carne", english: "Meat" },
        { spanish: "Pescado", english: "Fish (food)" },
        { spanish: "Arroz", english: "Rice" },
        { spanish: "Ensalada", english: "Salad" },
        { spanish: "Sopa", english: "Soup" },
        { spanish: "Huevo", english: "Egg" },

        // People & Family
        { spanish: "Madre", english: "Mother" },
        { spanish: "Padre", english: "Father" },
        { spanish: "Hermano", english: "Brother" },
        { spanish: "Hermana", english: "Sister" },
        { spanish: "Hijo", english: "Son" },
        { spanish: "Hija", english: "Daughter" },
        { spanish: "Amigo", english: "Friend" },
        { spanish: "Niño", english: "Child/Boy" },
        { spanish: "Niña", english: "Girl" },
        { spanish: "Hombre", english: "Man" },
        { spanish: "Mujer", english: "Woman" },

        // Colors
        { spanish: "Rojo", english: "Red" },
        { spanish: "Azul", english: "Blue" },
        { spanish: "Verde", english: "Green" },
        { spanish: "Amarillo", english: "Yellow" },
        { spanish: "Negro", english: "Black" },
        { spanish: "Blanco", english: "White" },
        { spanish: "Gris", english: "Gray" },
        { spanish: "Rosa", english: "Pink" },
        { spanish: "Morado", english: "Purple" },
        { spanish: "Naranja", english: "Orange (color)" },

        // Numbers
        { spanish: "Uno", english: "One" },
        { spanish: "Dos", english: "Two" },
        { spanish: "Tres", english: "Three" },
        { spanish: "Cuatro", english: "Four" },
        { spanish: "Cinco", english: "Five" },
        { spanish: "Seis", english: "Six" },
        { spanish: "Siete", english: "Seven" },
        { spanish: "Ocho", english: "Eight" },
        { spanish: "Nueve", english: "Nine" },
        { spanish: "Diez", english: "Ten" },

        // Places
        { spanish: "Escuela", english: "School" },
        { spanish: "Tienda", english: "Store" },
        { spanish: "Restaurante", english: "Restaurant" },
        { spanish: "Hospital", english: "Hospital" },
        { spanish: "Banco", english: "Bank" },
        { spanish: "Parque", english: "Park" },
        { spanish: "Biblioteca", english: "Library" },
        { spanish: "Iglesia", english: "Church" },
        { spanish: "Playa", english: "Beach" },
        { spanish: "Ciudad", english: "City" },

        // Time & Weather
        { spanish: "Día", english: "Day" },
        { spanish: "Noche", english: "Night" },
        { spanish: "Mañana", english: "Morning/Tomorrow" },
        { spanish: "Tarde", english: "Afternoon/Late" },
        { spanish: "Hoy", english: "Today" },
        { spanish: "Ayer", english: "Yesterday" },
        { spanish: "Sol", english: "Sun" },
        { spanish: "Luna", english: "Moon" },
        { spanish: "Lluvia", english: "Rain" },
        { spanish: "Nieve", english: "Snow" },

        // Common Verbs
        { spanish: "Hablar", english: "To speak" },
        { spanish: "Comer", english: "To eat" },
        { spanish: "Beber", english: "To drink" },
        { spanish: "Dormir", english: "To sleep" },
        { spanish: "Correr", english: "To run" },
        { spanish: "Caminar", english: "To walk" },
        { spanish: "Leer", english: "To read" },
        { spanish: "Escribir", english: "To write" },
        { spanish: "Ver", english: "To see/watch" },
        { spanish: "Escuchar", english: "To listen" },
        { spanish: "Trabajar", english: "To work" },
        { spanish: "Estudiar", english: "To study" },

        // Adjectives
        { spanish: "Grande", english: "Big" },
        { spanish: "Pequeño", english: "Small" },
        { spanish: "Bueno", english: "Good" },
        { spanish: "Malo", english: "Bad" },
        { spanish: "Bonito", english: "Pretty" },
        { spanish: "Feo", english: "Ugly" },
        { spanish: "Nuevo", english: "New" },
        { spanish: "Viejo", english: "Old" },
        { spanish: "Rápido", english: "Fast" },
        { spanish: "Lento", english: "Slow" },
        { spanish: "Alto", english: "Tall/High" },
        { spanish: "Bajo", english: "Short/Low" },
    ]);

    // Cleanup audio on unmount or step change
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    useEffect(() => {
        // Stop audio when leaving article step
        if (step !== "article") {
            stopAudio();
        }
    }, [step]);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setIsPlaying(false);
        setCurrentCharIndex(-1);
    };

    const generateSpeech = async () => {
        if (!articleData) return;

        setAudioLoading(true);
        try {
            const fullText = articleData.sections.map((s) => s.text).join(" ");

            const response = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: fullText }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate speech");
            }

            const data = await response.json();

            // Convert base64 audio to blob and create URL
            const audioBlob = base64ToBlob(data.audio_base64, "audio/mpeg");
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create audio element
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audioDataRef.current = {
                alignment: data.alignment,
                fullText: fullText,
            };

            // Set up audio event handlers
            audio.onended = () => {
                setIsPlaying(false);
                setCurrentCharIndex(-1);
            };

            audio.onplay = () => {
                setIsPlaying(true);
                updateCharacterHighlight();
            };

            audio.onpause = () => {
                setIsPlaying(false);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        } catch (err) {
            console.error("Failed to generate speech:", err);
            setError("Failed to generate speech");
        } finally {
            setAudioLoading(false);
        }
    };

    const base64ToBlob = (base64: string, mimeType: string): Blob => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    };

    const updateCharacterHighlight = () => {
        if (!audioRef.current || !audioDataRef.current) return;

        const currentTime = audioRef.current.currentTime;
        const { alignment } = audioDataRef.current;

        if (!alignment || !alignment.character_start_times_seconds) return;

        // Find the current character index based on audio time
        let charIndex = -1;
        for (
            let i = 0;
            i < alignment.character_start_times_seconds.length;
            i++
        ) {
            if (
                currentTime >= alignment.character_start_times_seconds[i] &&
                currentTime < alignment.character_end_times_seconds[i]
            ) {
                charIndex = i;
                break;
            }
        }

        setCurrentCharIndex(charIndex);

        // Continue updating
        if (audioRef.current && !audioRef.current.paused) {
            animationFrameRef.current = requestAnimationFrame(
                updateCharacterHighlight
            );
        }
    };

    const togglePlayPause = async () => {
        if (!audioRef.current) {
            // Generate speech if not already generated
            await generateSpeech();
            // Wait a bit for audio to be ready, then play
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.play();
                }
            }, 100);
        } else {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const renderHighlightedText = (
        text: string,
        startCharIndex: number
    ): React.ReactNode[] => {
        if (!audioDataRef.current || currentCharIndex < 0) {
            return [<span key="normal">{text}</span>];
        }

        const result: React.ReactNode[] = [];
        let currentGlobalIndex = startCharIndex;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const globalIndex = currentGlobalIndex;
            currentGlobalIndex++;

            const isHighlighted = globalIndex === currentCharIndex;
            const isAlreadyRead = globalIndex < currentCharIndex;

            result.push(
                <span
                    key={`char-${globalIndex}`}
                    className={
                        isHighlighted
                            ? "bg-yellow-300 dark:bg-yellow-600 text-black font-semibold"
                            : isAlreadyRead
                            ? "text-gray-500 dark:text-gray-400"
                            : ""
                    }
                >
                    {char}
                </span>
            );
        }

        return result;
    };

    const generateArticle = async () => {
        if (!topic.trim()) {
            setError("Please enter a topic");
            return;
        }

        setLoading(true);
        setError(null);
        setGameScore(0);
        generateNewWord(); // Start the mini-game

        try {
            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user)
                throw new Error("You must be logged in to generate lessons");

            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate_article",
                    topic,
                    difficulty,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            setArticleData(data);

            // Save lesson to Supabase
            const { data: lessonData, error: lessonError } = await supabase
                .from("lessons")
                .insert({
                    user_id: user.id,
                    topic: topic,
                    difficulty: difficulty,
                    title: data.title,
                    sections: data.sections,
                })
                .select()
                .single();

            if (lessonError) {
                console.error("Failed to save lesson:", lessonError);

                // Check if it's a "table doesn't exist" error
                if (
                    lessonError.message?.includes("does not exist") ||
                    lessonError.code === "42P01"
                ) {
                    throw new Error(
                        "Database tables not set up yet. Please check the Analytics page for setup instructions, or see APPLY_MIGRATION_NOW.md file."
                    );
                }
                throw new Error("Failed to save lesson to database");
            }

            setCurrentLessonId(lessonData.id);
            setStep("article");

            // Automatically start generating quiz in the background
            const fullArticle = data.sections
                .map((s: ArticleSection) => s.text)
                .join("\n\n");
            generateQuizInBackground(fullArticle, lessonData.id);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate article"
            );
        } finally {
            setLoading(false);
        }
    };

    const generateNewWord = () => {
        const randomWord =
            gameWords[Math.floor(Math.random() * gameWords.length)];
        const wrongOptions = gameWords
            .filter((w) => w.english !== randomWord.english)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((w) => w.english);
        const allOptions = [...wrongOptions, randomWord.english].sort(
            () => Math.random() - 0.5
        );
        setCurrentWord({ ...randomWord, options: allOptions });
    };

    const handleGameAnswer = (answer: string) => {
        if (answer === currentWord.english) {
            setGameScore((prev) => prev + 1);
        }
        generateNewWord();
    };

    const generateQuizInBackground = async (
        articleContent: string,
        lessonId: string
    ) => {
        setQuizLoading(true);

        try {
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate_quiz",
                    article: articleContent,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            setQuiz(data.quiz);
            setUserAnswers(new Array(data.quiz.length).fill(-1));

            // Save quiz questions to Supabase
            const quizQuestions = data.quiz.map(
                (q: QuizQuestion, index: number) => ({
                    lesson_id: lessonId,
                    question: q.question,
                    options: q.options,
                    correct_answer: q.correctAnswer,
                    question_order: index,
                })
            );

            const { error: quizError } = await supabase
                .from("quiz_questions")
                .insert(quizQuestions);

            if (quizError) {
                console.error("Failed to save quiz questions:", quizError);
            }
        } catch (err) {
            console.error("Failed to generate quiz:", err);
            // Don&apos;t show error to user yet, they&apos;ll see it when they click continue
        } finally {
            setQuizLoading(false);
        }
    };

    const continueToQuiz = () => {
        if (quiz.length > 0) {
            // Quiz is ready
            setStep("quiz");
        } else {
            // Quiz still loading, show error
            setError("Quiz is still being generated. Please wait a moment.");
        }
    };

    const submitQuiz = () => {
        setStep("summary");
    };

    const evaluateSummary = async () => {
        setLoading(true);
        setError(null);

        try {
            const fullArticle =
                articleData?.sections.map((s) => s.text).join("\n\n") || "";
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "evaluate_summary",
                    article: fullArticle,
                    userSummary,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            setEvaluation(data.evaluation);

            // Save lesson attempt with quiz and summary results
            await saveLessonAttempt(data.evaluation);

            setStep("results");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to evaluate summary"
            );
        } finally {
            setLoading(false);
        }
    };

    const skipSummary = async () => {
        // Save lesson attempt with quiz results only
        await saveLessonAttempt(null);
        setStep("results");
    };

    const saveLessonAttempt = async (summaryEvaluation: Evaluation | null) => {
        if (!currentLessonId) return;

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const quizScore = calculateQuizScore();

            const { error } = await supabase.from("lesson_attempts").insert({
                lesson_id: currentLessonId,
                user_id: user.id,
                user_answers: userAnswers,
                score: quizScore.correct,
                total_questions: quizScore.total,
                summary_text: userSummary || null,
                summary_score: summaryEvaluation?.score || null,
                summary_feedback: summaryEvaluation?.feedback || null,
                summary_suggestions: summaryEvaluation?.suggestions || null,
            });

            if (error) {
                console.error("Failed to save lesson attempt:", error);
            }
        } catch (err) {
            console.error("Error saving lesson attempt:", err);
        }
    };

    const startOver = () => {
        setStep("input");
        setTopic("");
        setArticleData(null);
        setQuiz([]);
        setUserAnswers([]);
        setUserSummary("");
        setEvaluation(null);
        setError(null);
    };

    const calculateQuizScore = () => {
        let correct = 0;
        quiz.forEach((q, i) => {
            if (userAnswers[i] === q.correctAnswer) correct++;
        });
        return {
            correct,
            total: quiz.length,
            percentage: Math.round((correct / quiz.length) * 100),
        };
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2">Spanish Lessons</h1>
                <p className="text-muted-foreground">
                    Learn Spanish through AI-generated articles and interactive
                    quizzes
                </p>
            </div>

            {error && (
                <div
                    className={`mb-6 p-4 rounded-lg border ${
                        error.includes("Database tables not set up")
                            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                            : "bg-destructive/10 border-destructive/20"
                    }`}
                >
                    <div
                        className={`flex items-start gap-3 ${
                            error.includes("Database tables not set up")
                                ? "text-amber-900 dark:text-amber-100"
                                : "text-destructive"
                        }`}
                    >
                        <div className="flex-1">
                            <p className="font-semibold mb-1">
                                {error.includes("Database tables not set up")
                                    ? "⚠️ Setup Required"
                                    : "Error"}
                            </p>
                            <p className="text-sm">{error}</p>
                            {error.includes("Database tables not set up") && (
                                <div className="mt-3">
                                    <a
                                        href="/analytics"
                                        className="text-sm font-medium underline hover:no-underline"
                                    >
                                        Go to Analytics page for setup
                                        instructions →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-6 justify-center">
                {/* Main Content - Slides left when loading */}
                <div
                    className={`transition-all duration-500 ${
                        loading ? "w-1/2 max-w-2xl" : "w-full max-w-4xl"
                    }`}
                >
                    {/* Step 1: Input Topic */}
                    {step === "input" && (
                        <Card className="h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Choose Your Topic
                                </CardTitle>
                                <CardDescription>
                                    Select a topic and difficulty level for your
                                    lesson
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        placeholder="e.g., Food, Travel, Technology, Culture..."
                                        value={topic}
                                        onChange={(e) =>
                                            setTopic(e.target.value)
                                        }
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Difficulty Level</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(
                                            [
                                                "beginner",
                                                "intermediate",
                                                "advanced",
                                            ] as const
                                        ).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() =>
                                                    setDifficulty(level)
                                                }
                                                className={`
                                            p-4 rounded-lg border-2 transition-all
                                            ${
                                                difficulty === level
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:border-primary/50"
                                            }
                                        `}
                                                disabled={loading}
                                            >
                                                <div className="font-semibold capitalize">
                                                    {level}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <Button
                                        className="w-full"
                                        onClick={generateArticle}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating Article...
                                            </>
                                        ) : (
                                            "Generate Lesson"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Read Article */}
                    {step === "article" && articleData && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            {articleData.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Read carefully - you&apos;ll be
                                            quizzed on this content
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={togglePlayPause}
                                        disabled={audioLoading}
                                        className="ml-4"
                                    >
                                        {audioLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Loading Audio...
                                            </>
                                        ) : isPlaying ? (
                                            <>
                                                <Pause className="mr-2 h-5 w-5" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-5 w-5" />
                                                {audioRef.current
                                                    ? "Resume"
                                                    : "Read Aloud"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Article Sections with Images */}
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    <div className="space-y-8">
                                        {articleData.sections.map(
                                            (section, i) => {
                                                // Calculate starting character index for this section
                                                const startCharIndex =
                                                    articleData.sections
                                                        .slice(0, i)
                                                        .reduce(
                                                            (acc, s) =>
                                                                acc +
                                                                s.text.length +
                                                                1,
                                                            0
                                                        ); // +1 for space between sections

                                                return (
                                                    <div
                                                        key={i}
                                                        className="space-y-4"
                                                    >
                                                        {/* Section Text with highlighting */}
                                                        <p className="text-lg leading-relaxed text-foreground/90">
                                                            {renderHighlightedText(
                                                                section.text,
                                                                startCharIndex
                                                            )}
                                                        </p>

                                                        {/* Section Image */}
                                                        {section.imagePrompt && (
                                                            <div className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg overflow-hidden my-6">
                                                                <img
                                                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                                                                        section.imagePrompt
                                                                    )}?width=800&height=450&nologo=true`}
                                                                    alt={
                                                                        section.imagePrompt
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={startOver}
                                    >
                                        Start Over
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={continueToQuiz}
                                        disabled={quizLoading}
                                    >
                                        {quizLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating Quiz...
                                            </>
                                        ) : (
                                            <>
                                                Continue to Quiz
                                                <Brain className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Take Quiz */}
                    {step === "quiz" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    Comprehension Quiz
                                </CardTitle>
                                <CardDescription>
                                    Answer these questions about the article
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {quiz.map((q, qIndex) => (
                                    <div
                                        key={qIndex}
                                        className="space-y-3 mb-8"
                                    >
                                        <Label className="text-base font-semibold">
                                            {qIndex + 1}. {q.question}
                                        </Label>
                                        <div className="space-y-2">
                                            {q.options.map((option, oIndex) => (
                                                <button
                                                    key={oIndex}
                                                    onClick={() => {
                                                        const newAnswers = [
                                                            ...userAnswers,
                                                        ];
                                                        newAnswers[qIndex] =
                                                            oIndex;
                                                        setUserAnswers(
                                                            newAnswers
                                                        );
                                                    }}
                                                    className={`
                                                w-full p-4 text-left rounded-lg border-2 transition-all
                                                ${
                                                    userAnswers[qIndex] ===
                                                    oIndex
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                }
                                            `}
                                                >
                                                    <span className="font-medium mr-2">
                                                        {String.fromCharCode(
                                                            65 + oIndex
                                                        )}
                                                        .
                                                    </span>
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    className="w-full"
                                    onClick={submitQuiz}
                                    disabled={userAnswers.includes(-1)}
                                >
                                    Finish Quiz
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Write Summary (Optional) */}
                    {step === "summary" && (
                        <Card className="h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PenTool className="h-5 w-5" />
                                    Write a Summary (Optional)
                                </CardTitle>
                                <CardDescription>
                                    Write a brief summary of the article in
                                    Spanish to get AI feedback
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <Label htmlFor="summary">
                                        Your Summary
                                    </Label>
                                    <textarea
                                        id="summary"
                                        className="w-full flex-1 p-4 rounded-lg border bg-background resize-none"
                                        placeholder="Escribe un resumen del artículo aquí..."
                                        value={userSummary}
                                        onChange={(e) =>
                                            setUserSummary(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={skipSummary}
                                        className="flex-1"
                                    >
                                        Skip Summary
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={evaluateSummary}
                                        disabled={
                                            !userSummary.trim() || loading
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Evaluating...
                                            </>
                                        ) : (
                                            "Get Feedback"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 5: Results */}
                    {step === "results" && (
                        <div className="space-y-6">
                            {/* Quiz Results */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Quiz Results
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(() => {
                                        const { correct, total, percentage } =
                                            calculateQuizScore();
                                        return (
                                            <>
                                                <div className="text-center p-6 bg-muted rounded-lg">
                                                    <div className="text-5xl font-bold text-primary mb-2">
                                                        {percentage}%
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        {correct} out of {total}{" "}
                                                        correct
                                                    </p>
                                                </div>

                                                {/* Show correct answers */}
                                                <div className="space-y-4">
                                                    <h3 className="font-semibold">
                                                        Answer Review:
                                                    </h3>
                                                    {quiz.map((q, i) => (
                                                        <div
                                                            key={i}
                                                            className="p-4 bg-muted rounded-lg"
                                                        >
                                                            <p className="font-medium mb-2">
                                                                {q.question}
                                                            </p>
                                                            <p
                                                                className={`text-sm ${
                                                                    userAnswers[
                                                                        i
                                                                    ] ===
                                                                    q.correctAnswer
                                                                        ? "text-green-600"
                                                                        : "text-red-600"
                                                                }`}
                                                            >
                                                                Your answer:{" "}
                                                                {
                                                                    q.options[
                                                                        userAnswers[
                                                                            i
                                                                        ]
                                                                    ]
                                                                }{" "}
                                                                {userAnswers[
                                                                    i
                                                                ] ===
                                                                q.correctAnswer
                                                                    ? "✓"
                                                                    : "✗"}
                                                            </p>
                                                            {userAnswers[i] !==
                                                                q.correctAnswer && (
                                                                <p className="text-sm text-green-600 mt-1">
                                                                    Correct
                                                                    answer:{" "}
                                                                    {
                                                                        q
                                                                            .options[
                                                                            q
                                                                                .correctAnswer
                                                                        ]
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>

                            {/* Summary Evaluation */}
                            {evaluation && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Summary Evaluation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center p-6 bg-muted rounded-lg">
                                            <div className="text-5xl font-bold text-primary mb-2">
                                                {evaluation.score}/100
                                            </div>
                                            <p className="text-muted-foreground">
                                                Summary Score
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold mb-2">
                                                    Feedback:
                                                </h4>
                                                <p className="text-muted-foreground">
                                                    {evaluation.feedback}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-2">
                                                    Suggestions:
                                                </h4>
                                                <p className="text-muted-foreground">
                                                    {evaluation.suggestions}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Button className="w-full" onClick={startOver}>
                                Start New Lesson
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mini-game - Appears on the right while loading */}
                {loading && (
                    <div className="w-1/2 max-w-2xl animate-in slide-in-from-right duration-500">
                        <Card className="h-[500px] flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span className="flex items-center gap-2">
                                        🎮 Quick Match
                                    </span>
                                    <span className="text-xl font-bold text-primary">
                                        {gameScore}
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Match words while you wait!
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 flex flex-col">
                                {currentWord.spanish && (
                                    <>
                                        <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Spanish
                                            </p>
                                            <p className="text-3xl font-bold text-primary">
                                                {currentWord.spanish}
                                            </p>
                                        </div>

                                        <div className="space-y-2 flex-1">
                                            <p className="text-xs text-muted-foreground text-center">
                                                Select the English translation:
                                            </p>
                                            {currentWord.options.map(
                                                (option, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() =>
                                                            handleGameAnswer(
                                                                option
                                                            )
                                                        }
                                                        className="w-full p-3 text-base font-medium rounded-lg border-2 border-border hover:border-primary hover:bg-primary/10 transition-all"
                                                    >
                                                        {option}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Generating your article...
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
