"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Brain, Clock, Users, Loader2, CheckCircle2,
    ArrowRight, Briefcase, AlertTriangle,
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function getTimeRemaining(expiresAt) {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}d ${h}h left`;
}

function DifficultyBadge({ difficulty }) {
    const colors = {
        Easy: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
        Medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        Hard: "bg-red-500/15 text-red-500 border-red-500/30",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[difficulty] || "glass text-muted-foreground"}`}>
            {difficulty}
        </span>
    );
}

export default function AvailableInterviewsPage() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviews();
    }, []);

    async function fetchInterviews() {
        try {
            const res = await fetch("/api/student/interviews", { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setInterviews(data.interviews);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const available = interviews.filter(iv => !iv.attempt);
    const attempted = interviews.filter(iv => iv.attempt);

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div variants={container} initial="hidden" animate="show">
                <motion.div variants={item} className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Briefcase className="h-7 w-7 text-blue-400" />
                        Available Interviews
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Take interviews assigned by recruiters and showcase your skills</p>
                </motion.div>

                {error && (
                    <motion.div variants={item} className="glass-card rounded-xl p-4 mb-6 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </motion.div>
                )}

                {/* Available Interviews */}
                <motion.div variants={item} className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Open Interviews ({available.length})</h2>
                    {available.length === 0 ? (
                        <div className="glass-card rounded-2xl p-12 text-center">
                            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Available Interviews</h3>
                            <p className="text-muted-foreground text-sm">Check back later for new interview opportunities</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {available.map((iv) => (
                                <motion.div key={iv._id} variants={item}>
                                    <Link href={`/interview/${iv.slug}`}>
                                        <div className="glass-card rounded-xl p-5 hover:scale-[1.01] transition-all cursor-pointer group h-full">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                                                        <Brain className="h-5 w-5 text-foreground" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">{iv.jobRole}</h3>
                                                        <DifficultyBadge difficulty={iv.difficulty} />
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1" />
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                                                <span className="flex items-center gap-1">
                                                    <Brain className="h-3 w-3" /> {iv.numberOfQuestions} questions
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {iv.vacancyCount} vacancies
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {getTimeRemaining(iv.expiresAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Attempted Interviews */}
                {attempted.length > 0 && (
                    <motion.div variants={item}>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Completed ({attempted.length})</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {attempted.map((iv) => (
                                <div key={iv._id} className="glass-card rounded-xl p-5 opacity-80">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
                                                <CheckCircle2 className="h-5 w-5 text-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{iv.jobRole}</h3>
                                                <DifficultyBadge difficulty={iv.difficulty} />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-foreground">
                                                {iv.attempt.score}/{iv.attempt.totalQuestions}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {Math.round((iv.attempt.score / iv.attempt.totalQuestions) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        {iv.attempt.status === "Selected" ? (
                                            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" /> Selected 🎉
                                            </span>
                                        ) : iv.attempt.status === "Rejected" ? (
                                            <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-1 rounded-full">
                                                Not Selected
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                                                {iv.attempt.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
