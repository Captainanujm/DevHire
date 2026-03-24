"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, TrendingUp, Target, Clock, Award, Mic,
    ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch("/api/analytics/overview", { credentials: "include" });
                if (res.ok) setData(await res.json());
            } catch { }
            setLoading(false);
        }
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 mt-4">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: "Total Interviews", value: data?.totalInterviews || 0, icon: Target, color: "text-blue-400", bgColor: "bg-blue-500/10" },
        { label: "Average Score", value: `${data?.avgScore || 0}%`, icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        { label: "Day Streak", value: data?.streak || 0, icon: Award, color: "text-amber-400", bgColor: "bg-amber-500/10" },
        { label: "Practice Hours", value: `${data?.practiceTime || 0}h`, icon: Clock, color: "text-purple-400", bgColor: "bg-purple-500/10" },
    ];

    const scoreHistory = data?.scoreHistory || [];
    const interviews = data?.interviews || [];

    const radarData = scoreHistory.length > 0
        ? [
            { subject: "Technical", value: scoreHistory[scoreHistory.length - 1]?.technical || 0 },
            { subject: "Communication", value: scoreHistory[scoreHistory.length - 1]?.communication || 0 },
            { subject: "Overall", value: scoreHistory[scoreHistory.length - 1]?.overall || 0 },
        ]
        : [];

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-blue-400" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-400 mt-2">Track your interview performance and progress over time</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card rounded-xl p-5"
                        >
                            <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Score Trend */}
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4">Score Trends</h3>
                        {scoreHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={scoreHistory}>
                                    <defs>
                                        <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                                    <Area type="monotone" dataKey="technical" stroke="#3b82f6" fill="url(#colorTech)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="communication" stroke="#8b5cf6" fill="url(#colorComm)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-12 text-slate-500 text-sm">
                                <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                <p>Complete interviews to see score trends</p>
                            </div>
                        )}
                    </div>

                    {/* Overall Performance */}
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4">Latest Performance</h3>
                        {radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                                    <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-12 text-slate-500 text-sm">
                                <Target className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                <p>Complete an interview to see performance radar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interview History */}
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">Interview History</h3>
                    {interviews.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500 border-b border-white/5">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Role</th>
                                        <th className="pb-3 font-medium">Difficulty</th>
                                        <th className="pb-3 font-medium">Technical</th>
                                        <th className="pb-3 font-medium">Communication</th>
                                        <th className="pb-3 font-medium">Overall</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.map((int, i) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0">
                                            <td className="py-3 text-sm text-slate-300">
                                                {new Date(int.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 text-sm text-slate-300">{int.role}</td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${int.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                                                        int.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                                            "bg-red-500/10 text-red-400"
                                                    }`}>
                                                    {int.difficulty}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-blue-400 font-medium">{int.technical}%</td>
                                            <td className="py-3 text-sm text-violet-400 font-medium">{int.communication}%</td>
                                            <td className="py-3 text-sm font-bold text-white">{int.score}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            <Mic className="h-8 w-8 mx-auto mb-3 opacity-30" />
                            <p>No interview history yet</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
