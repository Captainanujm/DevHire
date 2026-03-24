"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    FileBarChart, Download, Eye, Brain, Users, Clock,
    Loader2, CheckCircle2, XCircle, Trophy, TrendingUp,
    Filter, Crown, Medal, Award,
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function formatTime(sec) {
    if (!sec && sec !== 0) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
}

export default function ReportsPage() {
    const [rankings, setRankings] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReports();
    }, [selectedInterview]);

    async function fetchReports() {
        setLoading(true);
        try {
            const url = selectedInterview
                ? `/api/recruiter/rankings?interviewId=${selectedInterview}`
                : "/api/recruiter/rankings";
            const res = await fetch(url, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRankings(data.rankings);
            setInterviews(data.interviews);
            setStats(data.stats);
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
                <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <FileBarChart className="h-7 w-7 text-cyan-400" />
                            Candidate Reports
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">View detailed candidate evaluation reports across all interviews</p>
                    </div>

                    {interviews.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={selectedInterview}
                                onChange={(e) => setSelectedInterview(e.target.value)}
                                className="glass-strong rounded-lg px-3 py-2 text-sm text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Interviews</option>
                                {interviews.map((iv) => (
                                    <option key={iv._id} value={iv._id}>
                                        {iv.jobRole} ({iv.difficulty})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </motion.div>

                {error && (
                    <motion.div variants={item} className="glass-card rounded-xl p-4 mb-6 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </motion.div>
                )}

                {/* Stats */}
                <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-card rounded-xl p-5 text-center">
                        <Users className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.totalCandidates || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Candidates</p>
                    </div>
                    <div className="glass-card rounded-xl p-5 text-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.selectedCount || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Selected</p>
                    </div>
                    <div className="glass-card rounded-xl p-5 text-center">
                        <TrendingUp className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.avgPercentage || 0}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
                    </div>
                    <div className="glass-card rounded-xl p-5 text-center">
                        <Brain className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.totalInterviews || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Interviews</p>
                    </div>
                </motion.div>

                {/* Results Table */}
                <motion.div variants={item} className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileBarChart className="h-5 w-5 text-cyan-400" /> Detailed Results
                    </h2>

                    {rankings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No reports generated</p>
                            <p className="text-sm mt-2">Complete automated interviews to generate candidate reports</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                                        <th className="pb-3 font-medium">#</th>
                                        <th className="pb-3 font-medium">Candidate</th>
                                        <th className="pb-3 font-medium">Interview</th>
                                        <th className="pb-3 font-medium">Score</th>
                                        <th className="pb-3 font-medium">Time</th>
                                        <th className="pb-3 font-medium">Violations</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.map((r, i) => (
                                        <tr
                                            key={r._id}
                                            className={`border-b border-border/50 transition-colors hover:bg-accent/50 ${r.status === "Selected" ? "bg-emerald-500/5" :
                                                r.status === "Rejected" ? "opacity-60" : ""
                                                }`}
                                        >
                                            <td className="py-3 pr-2">
                                                <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
                                            </td>
                                            <td className="py-3">
                                                <p className="text-sm font-medium text-foreground">{r.candidate?.name || "—"}</p>
                                                <p className="text-xs text-muted-foreground">{r.candidate?.email}</p>
                                            </td>
                                            <td className="py-3">
                                                <p className="text-sm text-foreground">{r.interview?.jobRole}</p>
                                                <p className="text-xs text-muted-foreground">{r.interview?.difficulty}</p>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {r.score}/{r.totalQuestions}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">({r.percentage}%)</span>
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">{formatTime(r.timeTaken)}</td>
                                            <td className="py-3">
                                                {r.violations > 0 ? (
                                                    <span className="text-xs text-amber-400 font-medium">{r.violations} ⚠️</span>
                                                ) : (
                                                    <span className="text-xs text-emerald-500">Clean</span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {r.status === "Selected" ? (
                                                    <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                                                    </span>
                                                ) : r.status === "Rejected" ? (
                                                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                                        <XCircle className="h-3.5 w-3.5" /> Rejected
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">{r.status}</span>
                                                )}
                                            </td>
                                            <td className="py-3 text-xs text-muted-foreground">
                                                {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
