"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Trophy, Medal, Award, Crown, Users, Clock,
    Loader2, CheckCircle2, XCircle, Download, Filter,
    TrendingUp, Brain
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function formatTime(sec) {
    if (!sec && sec !== 0) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
}

function getRankIcon(idx) {
    if (idx === 0) return <Crown className="h-5 w-5 text-amber-400" />;
    if (idx === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (idx === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm text-muted-foreground font-bold">#{idx + 1}</span>;
}

export default function RankingPage() {
    const [rankings, setRankings] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRankings();
    }, [selectedInterview]);

    async function fetchRankings() {
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

    const top3 = rankings.slice(0, 3);

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
                            <Trophy className="h-7 w-7 text-amber-400" />
                            Candidate Rankings
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">AI-ranked candidates based on interview performance</p>
                    </div>

                    {/* Filter */}
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

                {/* Top 3 Podium */}
                {top3.length > 0 && (
                    <motion.div variants={item} className="glass-card rounded-2xl p-8 mb-8">
                        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-400" /> Top Performers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {top3.map((r, i) => (
                                <motion.div
                                    key={r._id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`glass rounded-xl p-5 text-center relative ${i === 0 ? "border border-amber-500/30 bg-amber-500/5" :
                                        i === 1 ? "border border-slate-400/30" :
                                            "border border-amber-600/20"
                                        }`}
                                >
                                    <div className="flex justify-center mb-3">{getRankIcon(i)}</div>
                                    <p className="font-semibold text-foreground text-lg">{r.candidate?.name || "—"}</p>
                                    <p className="text-xs text-muted-foreground">{r.candidate?.email}</p>
                                    <div className="mt-3 flex items-center justify-center gap-3">
                                        <span className="text-2xl font-bold text-gradient-blue">{r.percentage}%</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span>{r.score}/{r.totalQuestions}</span>
                                        <span>•</span>
                                        <span>{formatTime(r.timeTaken)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">{r.interview?.jobRole}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Full Leaderboard */}
                <motion.div variants={item} className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-400" /> Full Leaderboard
                    </h2>

                    {rankings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No rankings yet</p>
                            <p className="text-sm mt-2">Create interviews and let candidates attempt them to see rankings</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                                        <th className="pb-3 font-medium">Rank</th>
                                        <th className="pb-3 font-medium">Candidate</th>
                                        <th className="pb-3 font-medium">Interview</th>
                                        <th className="pb-3 font-medium">Score</th>
                                        <th className="pb-3 font-medium">Time</th>
                                        <th className="pb-3 font-medium">Status</th>
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
                                                <div className="flex items-center">{getRankIcon(i)}</div>
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
