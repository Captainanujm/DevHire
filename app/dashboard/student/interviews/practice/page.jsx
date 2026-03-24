"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEW_ROLES, INTERVIEW_DIFFICULTIES, getStaticQuestions } from "@/lib/interviewQuestions";
import {
    BookOpen, ChevronRight, ChevronLeft, RotateCcw, Loader2,
    CheckCircle2, AlertTriangle, Star, Lightbulb, MessageSquare,
    TrendingUp, ArrowRight,
} from "lucide-react";

function ScoreBadge({ score }) {
    const color = score >= 7 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        : score >= 4 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
            : "text-red-400 bg-red-500/10 border-red-500/20";
    return (
        <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${color}`}>
            {score}/10
        </span>
    );
}

export default function PracticeMode() {
    const [role, setRole] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [started, setStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loadingQ, setLoadingQ] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({}); // { index: answerText }
    const [evaluating, setEvaluating] = useState(false);
    const [report, setReport] = useState(null); // evaluation results

    async function startPractice() {
        if (!role || !difficulty) return;
        setLoadingQ(true);
        try {
            const res = await fetch(`/api/student/practice/questions?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}`, { credentials: "include" });
            const data = await res.json();
            const qs = data.questions?.length > 0 ? data.questions : getStaticQuestions(role, difficulty);
            if (qs.length === 0) return;
            setQuestions(qs);
            setAnswers({});
            setCurrentQ(0);
            setReport(null);
            setStarted(true);
        } catch {
            const qs = getStaticQuestions(role, difficulty);
            setQuestions(qs);
            setAnswers({});
            setCurrentQ(0);
            setReport(null);
            setStarted(true);
        } finally {
            setLoadingQ(false);
        }
    }

    async function submitAndEvaluate() {
        setEvaluating(true);
        try {
            const payload = questions.map((q, i) => ({ question: q, answer: answers[i] || "" }));
            const res = await fetch("/api/student/practice/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role, difficulty, answers: payload }),
            });
            const data = await res.json();
            setReport(data);
        } catch {
            setReport({ error: "Evaluation failed. Please try again." });
        } finally {
            setEvaluating(false);
        }
    }

    function reset() {
        setStarted(false);
        setRole("");
        setDifficulty("");
        setQuestions([]);
        setCurrentQ(0);
        setAnswers({});
        setReport(null);
    }

    const setAnswer = (idx, val) => setAnswers(prev => ({ ...prev, [idx]: val }));

    // ──────── SETUP SCREEN ────────
    if (!started) {
        return (
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-amber-400" />
                            Practice Mode
                        </h1>
                        <p className="text-muted-foreground  mt-2">Practice interview questions and get AI-powered feedback on your answers</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Select Role</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {INTERVIEW_ROLES.map((r) => (
                                <button key={r} onClick={() => setRole(r)}
                                    className={`glass-card rounded-xl p-4 text-left transition-all ${role === r ? "ring-2 ring-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]" : "hover:bg-secondary/50 dark:bg-white/5"}`}>
                                    <span className={`text-sm font-medium ${role === r ? "text-foreground" : "text-muted-foreground "}`}>{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Select Difficulty</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {INTERVIEW_DIFFICULTIES.map((d) => (
                                <button key={d} onClick={() => setDifficulty(d)}
                                    className={`glass-card rounded-xl p-5 text-center transition-all ${difficulty === d ? "ring-2 ring-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]" : "hover:bg-secondary/50 dark:bg-white/5"}`}>
                                    <p className={`font-semibold ${difficulty === d ? "text-foreground" : "text-foreground/90 "}`}>{d}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button onClick={startPractice} disabled={!role || !difficulty || loadingQ}
                        className="w-full py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20 disabled:opacity-40">
                        {loadingQ ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <BookOpen className="h-5 w-5 mr-2" />}
                        {loadingQ ? "Loading Questions..." : "Start Practice"}
                    </Button>
                </motion.div>
            </div>
        );
    }

    // ──────── REPORT SCREEN ────────
    if (report) {
        if (report.error) {
            return (
                <div className="max-w-4xl mx-auto text-center py-16">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 font-semibold text-lg">{report.error}</p>
                    <Button onClick={reset} className="mt-6">Try Again</Button>
                </div>
            );
        }

        const { results = [], avgScore = 0 } = report;
        return (
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400" /> Practice Report
                            </h1>
                            <p className="text-muted-foreground  text-sm mt-0.5">{role} · {difficulty}</p>
                        </div>
                        <Button onClick={reset} variant="ghost" className="text-muted-foreground  hover:text-foreground">
                            <RotateCcw className="h-4 w-4 mr-2" /> New Session
                        </Button>
                    </div>

                    {/* Average score card */}
                    <div className="glass-card rounded-2xl p-6 mb-6 flex items-center gap-6 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                        <div className="text-center shrink-0">
                            <div className="text-5xl font-bold text-amber-400">{avgScore}</div>
                            <div className="text-xs text-muted-foreground  mt-1">avg / 10</div>
                        </div>
                        <div>
                            <p className="text-foreground font-semibold text-lg">
                                {avgScore >= 8 ? "🔥 Outstanding!" : avgScore >= 6 ? "✅ Good Work!" : avgScore >= 4 ? "📈 Keep Practicing!" : "💡 More Study Needed"}
                            </p>
                            <p className="text-muted-foreground  text-sm mt-1">
                                Answered {results.length} question{results.length !== 1 ? "s" : ""} · Review each answer below to improve
                            </p>
                        </div>
                    </div>

                    {/* Per-question results */}
                    <div className="space-y-4">
                        {results.map((r, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="glass-card rounded-2xl p-5 space-y-4">
                                {/* Question + score */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MessageSquare className="h-4 w-4 text-amber-400 shrink-0" />
                                            <span className="text-xs text-amber-400 font-medium">Question {i + 1}</span>
                                        </div>
                                        <p className="text-foreground font-medium">{r.question}</p>
                                    </div>
                                    <ScoreBadge score={r.score} />
                                </div>

                                {/* Your answer */}
                                <div className="rounded-xl bg-secondary/50 dark:bg-white/5 border border-border dark:border-white/ p-3">
                                    <p className="text-xs text-muted-foreground  mb-1">Your answer</p>
                                    <p className="text-foreground/90  text-sm">{r.yourAnswer || <em className="text-muted-foreground ">No answer provided</em>}</p>
                                </div>

                                {/* Feedback */}
                                <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-3">
                                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1">
                                        <Star className="h-3 w-3" /> Feedback
                                    </div>
                                    <p className="text-foreground/90  text-sm">{r.feedback}</p>
                                </div>

                                {/* Improvements */}
                                {r.improvements?.length > 0 && (
                                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
                                        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium mb-2">
                                            <TrendingUp className="h-3 w-3" /> Key Improvements
                                        </div>
                                        <ul className="space-y-1">
                                            {r.improvements.map((imp, j) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-foreground/90 ">
                                                    <ArrowRight className="h-3.5 w-3.5 text-amber-500/70 shrink-0 mt-0.5" />
                                                    {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Sample answer */}
                                {r.sampleAnswer && (
                                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3">
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mb-1">
                                            <Lightbulb className="h-3 w-3" /> Sample Answer
                                        </div>
                                        <p className="text-foreground/90  text-sm leading-relaxed">{r.sampleAnswer}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button onClick={reset}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0 px-8 py-3">
                            <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ──────── EVALUATING SCREEN ────────
    if (evaluating) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
                <p className="text-foreground font-semibold text-lg">Evaluating your answers with AI…</p>
                <p className="text-muted-foreground  text-sm">This may take 15-30 seconds. Please wait.</p>
            </div>
        );
    }

    // ──────── QUESTION SCREEN ────────
    const isLast = currentQ === questions.length - 1;
    const currentAnswer = answers[currentQ] || "";

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Practice Mode</h1>
                        <p className="text-muted-foreground  text-sm">{role} • {difficulty}</p>
                    </div>
                    <Button onClick={reset} variant="ghost" className="text-muted-foreground  hover:text-foreground">
                        <RotateCcw className="h-4 w-4 mr-2" /> Reset
                    </Button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm text-muted-foreground ">{currentQ + 1} / {questions.length}</span>
                    <div className="flex-1 h-1 rounded-full bg-secondary/50 dark:bg-white/5">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                    </div>
                </div>

                {/* Question */}
                <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 text-amber-400 text-sm mb-4">
                        <MessageSquare className="h-4 w-4" />
                        <span>Question {currentQ + 1}</span>
                    </div>
                    <p className="text-foreground text-lg leading-relaxed">{questions[currentQ]}</p>
                </motion.div>

                {/* Answer area */}
                <div className="glass-card rounded-2xl p-6 mb-6">
                    <Textarea
                        placeholder="Type your answer here... Be as detailed as you can."
                        value={currentAnswer}
                        onChange={(e) => setAnswer(currentQ, e.target.value)}
                        className="bg-secondary/50 dark:bg-white/5 border-border dark:border-white/ text-foreground placeholder:text-muted-foreground  min-h-[160px]"
                    />
                    <p className="text-xs text-muted-foreground  mt-2">
                        {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button onClick={() => { setCurrentQ(q => q - 1); }} disabled={currentQ === 0}
                        variant="ghost" className="text-muted-foreground  hover:text-foreground disabled:opacity-30">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>

                    {isLast ? (
                        <Button onClick={submitAndEvaluate}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border-0 shadow-lg shadow-emerald-500/20 px-6">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Submit & Evaluate
                        </Button>
                    ) : (
                        <Button onClick={() => setCurrentQ(q => q + 1)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0">
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
