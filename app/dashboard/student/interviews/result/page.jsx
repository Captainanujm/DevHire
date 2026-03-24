"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Trophy, Target, MessageSquare, Zap, TrendingUp, ArrowRight,
    Home, RotateCcw, Sparkles, BarChart3, AlertCircle, CheckCircle,
} from "lucide-react";

import { Suspense } from "react";

export default function InterviewResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>}>
            <InterviewResult />
        </Suspense>
    );
}

function InterviewResult() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("id");

    const [scores, setScores] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingFeedback, setLoadingFeedback] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        fetchScores();
    }, [sessionId]);

    async function fetchScores() {
        setLoading(true);
        try {
            // The end API already ran scoring, get feedback now
            setLoadingFeedback(true);
            const res = await fetch("/api/interview/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
                credentials: "include",
            });
            const data = await res.json();
            setScores(data.scoreSummary);
            setFeedback({ feedback: data.feedback, improvements: data.improvements });
        } catch { }
        setLoading(false);
        setLoadingFeedback(false);
    }

    function getScoreColor(score) {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-red-400";
    }

    function getScoreGradient(score) {
        if (score >= 80) return "from-emerald-500 to-green-600";
        if (score >= 60) return "from-amber-500 to-orange-600";
        return "from-red-500 to-rose-600";
    }

    function getScoreLabel(score) {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Great";
        if (score >= 60) return "Good";
        if (score >= 40) return "Needs Work";
        return "Keep Practicing";
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground ">Analyzing your interview performance...</p>
                    <p className="text-muted-foreground  text-sm mt-2">AI is generating personalized feedback</p>
                </div>
            </div>
        );
    }

    if (!scores) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <AlertCircle className="h-10 w-10 text-muted-foreground  mx-auto mb-4" />
                <p className="text-muted-foreground ">Could not load results.</p>
                <Link href="/dashboard/student/interviews/new">
                    <Button className="mt-4">Start New Interview</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 mb-4"
                    >
                        <Trophy className="h-10 w-10 text-amber-400" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground">Interview Complete!</h1>
                    <p className="text-muted-foreground  mt-2">Here&apos;s how you performed</p>
                </div>

                {/* Overall Score - Big */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-8 mb-8 text-center"
                >
                    <p className="text-muted-foreground  text-sm mb-2">Overall Score</p>
                    <div className={`text-7xl font-bold ${getScoreColor(scores.overall)}`}>
                        {scores.overall}
                        <span className="text-2xl text-muted-foreground ">/100</span>
                    </div>
                    <p className={`mt-2 text-lg font-medium ${getScoreColor(scores.overall)}`}>
                        {getScoreLabel(scores.overall)}
                    </p>
                </motion.div>

                {/* Score Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Technical", value: scores.technical, icon: Target, desc: "Keyword matching & depth" },
                        { label: "Communication", value: scores.communication, icon: MessageSquare, desc: "WPM & filler words" },
                        { label: "Speaking Pace", value: `${scores.wpm} WPM`, icon: Zap, isText: true },
                        { label: "Filler Words", value: scores.fillerCount, icon: AlertCircle, isCount: true },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="glass-card rounded-xl p-5"
                        >
                            <card.icon className={`h-5 w-5 mb-3 ${card.isText || card.isCount ? "text-blue-400" : getScoreColor(card.value)}`} />
                            <p className={`text-3xl font-bold ${card.isText || card.isCount ? "text-foreground" : getScoreColor(card.value)}`}>
                                {card.isText ? card.value : card.isCount ? card.value : `${card.value}%`}
                            </p>
                            <p className="text-sm text-foreground mt-1">{card.label}</p>
                            {card.desc && <p className="text-xs text-muted-foreground  mt-0.5">{card.desc}</p>}
                        </motion.div>
                    ))}
                </div>

                {/* Score Bars */}
                <div className="glass-card rounded-2xl p-6 mb-8">
                    <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        Detailed Breakdown
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Technical Knowledge", value: scores.technical },
                            { label: "Communication Skills", value: scores.communication },
                            { label: "Answer Depth", value: scores.depthScore },
                            { label: "Keyword Relevance", value: scores.keywordMatches },
                        ].map((bar, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-foreground/90 ">{bar.label}</span>
                                    <span className={getScoreColor(bar.value)}>{bar.value}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-secondary/50 dark:bg-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${bar.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.15 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(bar.value)}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Feedback */}
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="glass-card rounded-2xl p-6 mb-8"
                    >
                        <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            AI Feedback
                        </h3>
                        <p className="text-foreground/90  leading-relaxed mb-6">{feedback.feedback}</p>

                        <h4 className="text-foreground font-medium mb-3">Areas for Improvement</h4>
                        <div className="space-y-3">
                            {feedback.improvements?.map((imp, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-muted-foreground  text-sm">{imp}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/dashboard/student/interviews/new">
                        <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </Link>
                    <Link href="/dashboard/student/analytics">
                        <Button variant="outline" className="border-border dark:border-white/ text-foreground/90  hover:bg-secondary/50 dark:bg-white/5">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                        </Button>
                    </Link>
                    <Link href="/dashboard/student">
                        <Button variant="ghost" className="text-muted-foreground  hover:text-foreground">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
