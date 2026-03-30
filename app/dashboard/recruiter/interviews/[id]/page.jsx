"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Brain, Clock, Users, Trophy, ArrowLeft,
    Loader2, Copy, CheckCircle2, XCircle, Download,
    Share2, Crown, Medal, Award, Video
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function InterviewDetailPage() {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [ranking, setRanking] = useState(false);
    const [pageError, setPageError] = useState("");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        try {
            const res = await fetch(`/api/recruiter/interviews/${id}`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setInterview(data.interview);
            setAttempts(data.attempts);
            setStats(data.stats);
        } catch (err) {
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleRank() {
        setRanking(true);
        setActionError("");
        try {
            const res = await fetch(`/api/recruiter/interviews/${id}/rank`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await fetchDetail(); // Refresh
        } catch (err) {
            setActionError(err.message);
            // Clear message after 4s
            setTimeout(() => setActionError(""), 4000);
        } finally {
            setRanking(false);
        }
    }

    function copyLink() {
        if (!interview) return;
        const url = `${window.location.origin}/interview/${interview.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function shareWhatsApp() {
        if (!interview) return;
        const url = `${window.location.origin}/interview/${interview.slug}`;
        const text = `You've been invited to take an interview for ${interview.jobRole} position. Take the assessment here: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}m ${s}s`;
    }

    function getRankIcon(idx) {
        if (idx === 0) return <Crown className="h-4 w-4 text-amber-400" />;
        if (idx === 1) return <Medal className="h-4 w-4 text-slate-400" />;
        if (idx === 2) return <Award className="h-4 w-4 text-amber-600" />;
        return <span className="text-xs text-muted-foreground font-semibold">#{idx + 1}</span>;
    }

    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (pageError || !interview) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <p className="text-red-500">{pageError || "Interview not found"}</p>
            </div>
        );
    }

    const statusColors = {
        Active: "text-emerald-500",
        Expired: "text-red-500",
        Completed: "text-blue-500",
    };

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div variants={container} initial="hidden" animate="show">
                <motion.div variants={item}>
                    <Link href="/dashboard/recruiter/interviews" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Interviews
                    </Link>
                </motion.div>

                {/* Header Card */}
                <motion.div variants={item} className="glass-card rounded-2xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{interview.jobRole}</h1>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className={`text-sm font-medium ${statusColors[interview.status]}`}>{interview.status}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">{interview.difficulty}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">{interview.numberOfQuestions} questions</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">{interview.vacancyCount} vacancies</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {interview.interviewType === "Manual" && (
                                <Link href={`/dashboard/recruiter/interviews/${id}/live`}>
                                    <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/20">
                                        <Video className="h-4 w-4 mr-1" /> Join Live
                                    </Button>
                                </Link>
                            )}
                            <Button onClick={copyLink} variant="outline" size="sm" className="glass border-border text-foreground">
                                {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> : <Copy className="h-4 w-4 mr-1" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </Button>
                            <Button onClick={shareWhatsApp} variant="outline" size="sm" className="glass border-border text-foreground">
                                <Share2 className="h-4 w-4 mr-1" /> WhatsApp
                            </Button>
                            <a href={`/api/recruiter/interviews/${id}/export`} download>
                                <Button variant="outline" size="sm" className="glass border-border text-foreground">
                                    <Download className="h-4 w-4 mr-1" /> CSV
                                </Button>
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={item} className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-card rounded-xl p-5 text-center">
                        <Users className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.totalAttempts}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Attempts</p>
                    </div>
                    <div className="glass-card rounded-xl p-5 text-center">
                        <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.topScore}/{interview.numberOfQuestions * 10}</p>
                        <p className="text-xs text-muted-foreground mt-1">Top Score</p>
                    </div>
                    <div className="glass-card rounded-xl p-5 text-center">
                        <Clock className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Avg Score %</p>
                    </div>
                </motion.div>

                {/* Rank Button */}
                {interview.status !== "Completed" && attempts.length > 0 && (
                    <motion.div variants={item} className="mb-6 space-y-3">
                        {actionError && (
                            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
                                <XCircle className="h-4 w-4" /> {actionError}
                            </div>
                        )}
                        <Button
                            onClick={handleRank}
                            disabled={ranking || !attempts.some(a => ["Submitted", "Pending"].includes(a.status))}
                            className="w-full py-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg disabled:opacity-50"
                        >
                            {ranking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                            Run Ranking — Select Top {interview.vacancyCount} Candidate(s)
                        </Button>
                        {!attempts.some(a => ["Submitted", "Pending"].includes(a.status)) && (
                            <p className="text-center text-xs text-muted-foreground mt-2">
                                Waiting for candidates to finish and submit their interviews before ranking.
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Leaderboard */}
                <motion.div variants={item} className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-400" /> Leaderboard
                    </h2>

                    {attempts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                            <p>No candidates have attempted yet</p>
                            <p className="text-xs mt-1">Share the interview link to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">Name</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-1">Score</div>
                                <div className="col-span-2">Time</div>
                                <div className="col-span-2">Status</div>
                            </div>

                            {attempts.map((a, i) => (
                                <div key={a._id} className="flex flex-col gap-2">
                                    {/* Row */}
                                    <div
                                        onClick={() => toggleExpand(a._id)}
                                        className={`grid grid-cols-12 gap-2 px-4 py-3 rounded-xl items-center cursor-pointer transition-colors ${a.status === "Selected"
                                                ? "glass border border-emerald-500/30 hover:bg-emerald-500/10"
                                                : a.status === "Rejected"
                                                    ? "glass border border-red-500/10 opacity-70 hover:opacity-100"
                                                    : "glass hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="col-span-1 flex items-center">{getRankIcon(i)}</div>
                                        <div className="col-span-3 text-sm font-medium text-foreground truncate">{a.candidateId?.name || "—"}</div>
                                        <div className="col-span-3 text-sm text-muted-foreground truncate">{a.candidateId?.email || "—"}</div>
                                        <div className="col-span-1 text-sm font-semibold text-foreground">{a.overallScore}%</div>
                                        <div className="col-span-2 text-sm text-muted-foreground">{formatTime(a.timeTaken)}</div>
                                        <div className="col-span-2 flex justify-between items-center">
                                            {a.status === "Selected" ? (
                                                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                                                </span>
                                            ) : a.status === "Rejected" ? (
                                                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                                    <XCircle className="h-3.5 w-3.5" /> Rejected
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">{a.status}</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Details */}
                                    {expandedId === a._id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="glass rounded-xl p-5 mt-1 border border-blue-500/20 overflow-hidden">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold text-foreground">Interview Evaluation Report</h3>
                                                <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-muted-foreground break-all max-w-[200px] truncate">
                                                    ID: {a._id}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                                    <p className="text-xs text-muted-foreground">Technical Score</p>
                                                    <p className="text-lg font-semibold text-blue-400">{a.technicalScore || 0}/{a.answers?.length * 10 || 0}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                                    <p className="text-xs text-muted-foreground">Communication</p>
                                                    <p className="text-lg font-semibold text-violet-400">{a.communicationScore || 0}/{a.answers?.length * 10 || 0}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                                    <p className="text-xs text-muted-foreground">Anti-Cheat</p>
                                                    <p className={`text-lg font-semibold ${a.violations > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{a.violations || 0} violations</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                                    <p className="text-xs text-muted-foreground">AI Status</p>
                                                    <p className="text-sm font-semibold text-foreground mt-1">Evaluated</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {a.answers?.length > 0 ? (
                                                    a.answers.map((ans, idx) => (
                                                        <div key={idx} className="space-y-2 pb-4 border-b border-white/5 last:border-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <h4 className="text-sm font-semibold text-foreground flex-1">
                                                                    <span className="text-blue-500 mr-2">Q{idx + 1}.</span> 
                                                                    {interview.questions[ans.questionIndex]?.question || "Custom Contextual Question"}
                                                                </h4>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <div className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs">
                                                                        Tech: {ans.technicalScore}/10
                                                                    </div>
                                                                    <div className="px-2 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded text-xs">
                                                                        Comm: {ans.communicationScore}/10
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                                <p className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-wider">Candidate Transcript</p>
                                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                                    {ans.transcript || <span className="italic text-slate-500">No recognizable speech detected.</span>}
                                                                </p>
                                                            </div>

                                                            {ans.feedback && (
                                                                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                                                    <p className="text-xs text-violet-400 mb-1 font-semibold uppercase tracking-wider">Nexus AI Feedback</p>
                                                                    <p className="text-sm text-foreground leading-relaxed">
                                                                        {ans.feedback}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6">
                                                        <p className="text-muted-foreground text-sm">No answers recorded for this candidate.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
