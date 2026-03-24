"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Plus, Brain, Clock, Users, ChevronRight,
    Loader2, AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function StatusBadge({ status }) {
    const colors = {
        Active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
        Expired: "bg-red-500/15 text-red-500 border-red-500/30",
        Completed: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || "glass text-muted-foreground"}`}>
            {status}
        </span>
    );
}

function getTimeRemaining(expiresAt) {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}d ${h}h left`;
}

export default function RecruiterInterviewsPage() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviews();
    }, []);

    async function fetchInterviews() {
        try {
            const res = await fetch("/api/recruiter/interviews", { credentials: "include" });
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

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Header */}
                <motion.div variants={item} className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Interviews</h1>
                        <p className="text-muted-foreground text-sm mt-1">Create and manage your interview assessments</p>
                    </div>
                    <Link href="/dashboard/recruiter/interviews/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20">
                            <Plus className="h-4 w-4 mr-2" /> Create Interview
                        </Button>
                    </Link>
                </motion.div>

                {error && (
                    <motion.div variants={item} className="glass-card rounded-xl p-4 mb-6 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </motion.div>
                )}

                {interviews.length === 0 ? (
                    <motion.div variants={item} className="glass-card rounded-2xl p-12 text-center">
                        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                        <h2 className="text-lg font-semibold text-foreground mb-2">No Interviews Yet</h2>
                        <p className="text-muted-foreground text-sm mb-6">Create your first AI-powered interview to get started</p>
                        <Link href="/dashboard/recruiter/interviews/create">
                            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0">
                                <Plus className="h-4 w-4 mr-2" /> Create Interview
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {interviews.map((iv) => (
                            <motion.div key={iv._id} variants={item}>
                                <Link href={`/dashboard/recruiter/interviews/${iv._id}`}>
                                    <div className="glass-card rounded-xl p-5 hover:scale-[1.005] transition-all cursor-pointer group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                                                    <Brain className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">{iv.jobRole}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-muted-foreground">{iv.difficulty}</span>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-xs text-muted-foreground">{iv.numberOfQuestions} questions</span>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Users className="h-3 w-3" /> {iv.totalAttempts || 0} attempts
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <StatusBadge status={iv.status} />
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {getTimeRemaining(iv.expiresAt)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {iv.vacancyCount} {iv.vacancyCount === 1 ? "vacancy" : "vacancies"}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
