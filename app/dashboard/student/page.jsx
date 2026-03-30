"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Mic,
  Code2,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  Award,
  Play,
  Sparkles,
  Brain,
  Briefcase,
  CheckCircle2,
  Users,
} from "lucide-react";

const quickActions = [
  {
    label: "Available Interviews",
    description: "Take recruiter interviews",
    href: "/dashboard/student/interviews/available",
    icon: Briefcase,
    gradient: "from-blue-500 to-cyan-600",
    glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
  },
  {
    label: "Practice Mode",
    description: "AI mock interviews",
    href: "/dashboard/student/interviews/practice",
    icon: Mic,
    gradient: "from-violet-500 to-purple-600",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
  },
  {
    label: "Coding Lab",
    description: "Practice coding problems",
    href: "/dashboard/student/coding",
    icon: Code2,
    gradient: "from-cyan-500 to-blue-600",
    glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]",
  },
  {
    label: "Build Resume",
    description: "AI-powered resume builder",
    href: "/resume-builder",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-600",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]",
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

function getTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `${d}d ${h}h left`;
}

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    streak: 0,
    practiceTime: 0,
  });
  const [availableInterviews, setAvailableInterviews] = useState([]);
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch { }

      try {
        const res = await fetch("/api/analytics/overview", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch { }

      // Fetch available interviews
      try {
        const res = await fetch("/api/student/interviews", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAvailableInterviews(
            (data.interviews || []).filter(iv => !iv.attempt).slice(0, 3)
          );
        }
      } catch { }

      // Fetch recent results
      try {
        const res = await fetch("/api/student/interviews/results", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setRecentResults((data.results || []).slice(0, 3));
        }
      } catch { }

      // Fetch coding streak
      try {
        const res = await fetch("/api/student/coding-problems/potd", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.streak) {
            setStats(prev => ({ ...prev, streak: data.streak.currentStreak || 0 }));
          }
        }
      } catch { }
    }
    fetchData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Welcome Banner */}
        <motion.div variants={item} className="mb-8">
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-[60px]" />
            <div className="relative z-10">
              <p className="text-muted-foreground text-sm">{greeting()}</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">
                {user?.name || "Developer"} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">Ready to level up your interview skills today?</p>
              <div className="flex gap-3 mt-4">
                <Link href="/dashboard/student/interviews/available">
                  <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Available Interviews
                  </Button>
                </Link>
                <Link href="/dashboard/student/interviews/practice">
                  <Button variant="outline" className="glass border-border text-foreground">
                    <Play className="h-4 w-4 mr-2" />
                    Practice
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Interviews", value: stats.totalInterviews || recentResults.length, icon: Target, color: "text-blue-400" },
            { label: "Avg Score", value: `${stats.avgScore || (recentResults.length > 0 ? Math.round(recentResults.reduce((a, r) => a + r.percentage, 0) / recentResults.length) : 0)}%`, icon: TrendingUp, color: "text-emerald-400" },
            { label: "Day Streak", value: stats.streak || 0, icon: Award, color: "text-amber-400" },
            { label: "Practice Hours", value: `${stats.practiceTime || 0}h`, icon: Clock, color: "text-purple-400" },
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

        {/* Available Interviews & Recent Results */}
        <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
          {/* Available Interviews */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Available Interviews</h2>
              <Link href="/dashboard/student/interviews/available">
                <span className="text-sm text-blue-400 hover:text-blue-300">View All</span>
              </Link>
            </div>
            {availableInterviews.length > 0 ? (
              <div className="space-y-3">
                {availableInterviews.map((iv) => (
                  <Link key={iv._id} href={`/interview/${iv.slug}`}>
                    <div className="flex items-center gap-3 glass rounded-xl p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{iv.jobRole}</p>
                        <p className="text-xs text-muted-foreground">{iv.difficulty} • {iv.numberOfQuestions} Q</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />{getTimeRemaining(iv.expiresAt)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Users className="h-3 w-3 inline mr-1" />{iv.vacancyCount} spots
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p>No interviews available right now</p>
                <p className="text-xs mt-1">Check back later for new opportunities</p>
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Results</h2>
              <Link href="/dashboard/student/interviews/available">
                <span className="text-sm text-blue-400 hover:text-blue-300">View All</span>
              </Link>
            </div>
            {recentResults.length > 0 ? (
              <div className="space-y-3">
                {recentResults.map((r) => (
                  <div key={r._id} className="flex items-center gap-3 glass rounded-xl p-3">
                    <div className={`p-2 rounded-lg ${r.status === "Selected" ? "bg-gradient-to-br from-emerald-600 to-teal-600" : "bg-gradient-to-br from-blue-600 to-violet-600"}`}>
                      {r.status === "Selected" ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <Brain className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.interview?.jobRole || "Interview"}</p>
                      <p className="text-xs text-muted-foreground">{r.interview?.difficulty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{r.percentage}%</p>
                      <p className="text-xs text-muted-foreground">{r.score}/{r.totalQuestions}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Mic className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p>No interviews yet</p>
                <p className="text-xs mt-1">Start your first interview to see results here</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
