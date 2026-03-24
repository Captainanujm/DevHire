"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
    Brain, Sparkles, Play, Settings, Users, Zap,
    Loader2, CheckCircle2, Copy, Share2, ArrowRight,
} from "lucide-react";

const AI_MODES = [
    { id: "ai", label: "Full AI", description: "AI generates and conducts the entire interview", icon: Brain, gradient: "from-violet-500 to-purple-600" },
    { id: "custom", label: "Custom", description: "Use your custom questions only", icon: Settings, gradient: "from-blue-500 to-cyan-600" },
    { id: "hybrid", label: "Hybrid", description: "Mix of your questions and AI-generated ones", icon: Sparkles, gradient: "from-amber-500 to-orange-600" },
];

export default function AutoInterviewPage() {
    const router = useRouter();
    const [mode, setMode] = useState("ai");
    const [role, setRole] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [vacancyCount, setVacancyCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdInterview, setCreatedInterview] = useState(null);
    const [copied, setCopied] = useState(false);

    async function handleLaunch() {
        if (!role.trim()) return;
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/recruiter/interviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobRole: role,
                    difficulty,
                    numberOfQuestions,
                    vacancyCount,
                }),
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCreatedInterview(data.interview);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function copyLink() {
        if (!createdInterview) return;
        const url = `${window.location.origin}/interview/${createdInterview.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function shareWhatsApp() {
        if (!createdInterview) return;
        const url = `${window.location.origin}/interview/${createdInterview.slug}`;
        const text = `You've been invited to take an automated interview for ${createdInterview.jobRole} position. Take the assessment here: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }

    // Success state — interview created
    if (createdInterview) {
        return (
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="p-4 rounded-full bg-emerald-500/10 w-fit mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Interview Created!</h1>
                        <p className="text-muted-foreground mb-6">
                            Your automated interview for <strong className="text-foreground">{createdInterview.jobRole}</strong> is ready.
                        </p>

                        <div className="glass rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground">Difficulty</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">{createdInterview.difficulty}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Questions</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">{createdInterview.numberOfQuestions}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Vacancies</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">{createdInterview.vacancyCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Expires</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">
                                        {new Date(createdInterview.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl p-4 mb-6">
                            <p className="text-xs text-muted-foreground mb-2">Share this link with candidates</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm text-blue-400 bg-blue-500/5 rounded-lg px-3 py-2 truncate text-left">
                                    {typeof window !== "undefined" ? `${window.location.origin}/interview/${createdInterview.slug}` : `/interview/${createdInterview.slug}`}
                                </code>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <Button onClick={copyLink} variant="outline" className="flex-1 glass border-border text-foreground">
                                {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </Button>
                            <Button onClick={shareWhatsApp} variant="outline" className="flex-1 glass border-border text-foreground">
                                <Share2 className="h-4 w-4 mr-2" />
                                WhatsApp
                            </Button>
                        </div>

                        <div className="flex gap-3">
                            <Link href={`/dashboard/recruiter/interviews/${createdInterview._id}`} className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0">
                                    View Interview <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => { setCreatedInterview(null); setRole(""); }}
                                className="glass border-border text-foreground"
                            >
                                Create Another
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Brain className="h-8 w-8 text-violet-400" />
                        Automated Interview
                    </h1>
                    <p className="text-muted-foreground mt-2">Set up AI-powered automated interviews for candidates</p>
                </div>

                {/* AI Mode Selector */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Interview Mode</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {AI_MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`glass-card rounded-xl p-5 text-left transition-all ${mode === m.id ? "ring-2 ring-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.2)]" : "hover:bg-accent/50"
                                    }`}
                            >
                                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${m.gradient} mb-3`}>
                                    <m.icon className="h-5 w-5 text-white" />
                                </div>
                                <p className={`font-semibold text-sm ${mode === m.id ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
                                <p className="text-muted-foreground text-xs mt-1">{m.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Config */}
                <div className="glass-card rounded-2xl p-6 mb-8">
                    <h3 className="text-foreground font-semibold mb-4">Configuration</h3>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label className="text-muted-foreground text-sm mb-1.5 block">Job Role *</Label>
                            <Input
                                placeholder="e.g. React Developer, Full Stack Engineer"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="bg-transparent border-border text-foreground placeholder:text-muted-foreground h-11"
                            />
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-sm mb-1.5 block">Difficulty</Label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full h-11 rounded-md bg-transparent border border-border text-foreground px-3 focus:outline-none focus:border-blue-500"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground text-sm mb-1.5 block">Number of Questions</Label>
                            <Input
                                type="number"
                                min={1}
                                max={50}
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
                                className="bg-transparent border-border text-foreground h-11"
                            />
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-sm mb-1.5 block">Vacancy Count</Label>
                            <Input
                                type="number"
                                min={1}
                                value={vacancyCount}
                                onChange={(e) => setVacancyCount(parseInt(e.target.value) || 1)}
                                className="bg-transparent border-border text-foreground h-11"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="glass rounded-xl p-4 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <p className="text-sm font-medium text-foreground">Summary</p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {numberOfQuestions} {difficulty.toLowerCase()} questions for <strong className="text-foreground">{role || "..."}</strong></li>
                        <li>• AI generates unique MCQ questions using Gemini</li>
                        <li>• Interview link valid for 5 days</li>
                        <li>• Top {vacancyCount} candidate(s) will be auto-selected after ranking</li>
                        <li>• Anti-cheating measures: fullscreen lock, tab-switch detection</li>
                    </ul>
                </div>

                <Button
                    onClick={handleLaunch}
                    disabled={!role.trim() || loading}
                    className="w-full py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20 disabled:opacity-40"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating Questions...</>
                    ) : (
                        <><Play className="h-5 w-5 mr-2" /> Launch Automated Interview</>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
