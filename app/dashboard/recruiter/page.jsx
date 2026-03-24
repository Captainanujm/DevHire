"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Users,
    Calendar,
    ClipboardList,
    Brain,
    Trophy,
    FileBarChart,
    ArrowRight,
    TrendingUp,
    Briefcase,
    Target,
    UserCheck,
    Plus,
    Loader2,
    Clock,
    Crown,
    Medal,
    Award,
} from "lucide-react";

const quickActions = [
    {
        label: "Browse Candidates",
        description: "Find top talent",
        href: "/dashboard/recruiter/students",
        icon: Users,
        gradient: "from-blue-500 to-cyan-600",
        glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    },
    {
        label: "Schedule Interview",
        description: "Set up interviews",
        href: "/dashboard/recruiter/schedule",
        icon: Calendar,
        gradient: "from-violet-500 to-purple-600",
        glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    },
    {
        label: "Create Questions",
        description: "Build question sets",
        href: "/dashboard/recruiter/questions",
        icon: ClipboardList,
        gradient: "from-emerald-500 to-teal-600",
        glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    },
    {
        label: "Auto Interview",
        description: "AI-powered screening",
        href: "/dashboard/recruiter/auto-interview",
        icon: Brain,
        gradient: "from-amber-500 to-orange-600",
        glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function getRankIcon(idx) {
    if (idx === 0) return <Crown className="h-4 w-4 text-amber-400" />;
    if (idx === 1) return <Medal className="h-4 w-4 text-slate-400" />;
    if (idx === 2) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs text-muted-foreground font-semibold">#{idx + 1}</span>;
}

function getTimeRemaining(expiresAt) {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}d ${h}h left`;
}

export default function RecruiterDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [topCandidates, setTopCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [userRes, statsRes, interviewsRes, rankingsRes] = await Promise.all([
                    fetch("/api/user/me", { credentials: "include" }),
                    fetch("/api/recruiter/stats", { credentials: "include" }),
                    fetch("/api/recruiter/interviews", { credentials: "include" }),
                    fetch("/api/recruiter/rankings", { credentials: "include" }),
                ]);

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
                if (interviewsRes.ok) {
                    const ivData = await interviewsRes.json();
                    // Show most recent 3 active interviews
                    setRecentInterviews(
                        (ivData.interviews || [])
                            .filter(i => i.status === "Active")
                            .slice(0, 3)
                    );
                }
                if (rankingsRes.ok) {
                    const rankData = await rankingsRes.json();
                    setTopCandidates((rankData.rankings || []).slice(0, 3));
                }
            } catch { }
            setLoading(false);
        }
        fetchData();
    }, []);

    const displayStats = stats || {
        totalInterviews: 0,
        totalCandidates: 0,
        hiredCandidates: 0,
        successRate: 0,
    };

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Welcome Banner */}
                <motion.div variants={item} className="mb-8">
                    <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-gradient-to-bl from-violet-500/10 to-transparent blur-[60px]" />
                        <div className="relative z-10">
                            <p className="text-muted-foreground text-sm">Recruiter Dashboard</p>
                            <h1 className="text-3xl font-bold text-foreground mt-1">
                                Welcome, {user?.name || "Recruiter"} <span className="text-2xl">🎯</span>
                            </h1>
                            <p className="text-muted-foreground mt-2 text-sm">Manage interviews and find top developer talent</p>
                            <Link href="/dashboard/recruiter/interviews/create">
                                <Button className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Interview
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Interviews", value: displayStats.totalInterviews, icon: Target, color: "text-blue-400" },
                        { label: "Active Candidates", value: displayStats.totalCandidates, icon: Users, color: "text-violet-400" },
                        { label: "Hired", value: displayStats.hiredCandidates, icon: UserCheck, color: "text-emerald-400" },
                        { label: "Success Rate", value: `${displayStats.successRate}%`, icon: TrendingUp, color: "text-amber-400" },
                    ].map((stat, i) => (
                        <motion.div key={i} variants={item} whileHover={{ scale: 1.02, y: -2 }} className="glass-card rounded-xl p-5 cursor-default transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                            <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-muted-foreground text-xs mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href}>
                                <motion.div
                                    variants={item}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className={`glass-card rounded-xl p-5 cursor-pointer transition-all duration-300 ${action.glow} group h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]`}
                                >
                                    <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${action.gradient} mb-3`}>
                                        <action.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-foreground font-medium text-sm">{action.label}</h3>
                                    <p className="text-muted-foreground text-xs mt-1">{action.description}</p>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                </div>

                {/* Rankings & Activity */}
                <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Top Candidates</h2>
                            <Link href="/dashboard/recruiter/ranking">
                                <span className="text-sm text-blue-400 hover:text-blue-300">View All</span>
                            </Link>
                        </div>
                        {topCandidates.length > 0 ? (
                            <div className="space-y-3">
                                {topCandidates.map((r, i) => (
                                    <div key={r._id} className="flex items-center gap-3 glass rounded-xl p-3">
                                        <div className="flex items-center justify-center w-8 h-8">{getRankIcon(i)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{r.candidate?.name || "—"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{r.interview?.jobRole}</p>
                                        </div>
                                        <span className="text-sm font-bold text-gradient-blue">{r.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Trophy className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                <p>No candidates ranked yet</p>
                                <p className="text-xs mt-1">Run automated interviews to rank candidates</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Active Interviews</h2>
                            <Link href="/dashboard/recruiter/interviews">
                                <span className="text-sm text-blue-400 hover:text-blue-300">View All</span>
                            </Link>
                        </div>
                        {recentInterviews.length > 0 ? (
                            <div className="space-y-3">
                                {recentInterviews.map((iv) => (
                                    <Link key={iv._id} href={`/dashboard/recruiter/interviews/${iv._id}`}>
                                        <div className="flex items-center gap-3 glass rounded-xl p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                                                <Brain className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{iv.jobRole}</p>
                                                <p className="text-xs text-muted-foreground">{iv.difficulty} • {iv.numberOfQuestions} questions</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {getTimeRemaining(iv.expiresAt)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    <Users className="h-3 w-3 inline mr-1" />{iv.totalAttempts || 0} attempts
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Calendar className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                <p>No active interviews</p>
                                <p className="text-xs mt-1">Create an interview to get started</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
