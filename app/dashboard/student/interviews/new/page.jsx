"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { INTERVIEW_ROLES, INTERVIEW_DIFFICULTIES } from "@/lib/interviewQuestions";
import { Mic, ArrowRight, Sparkles, Gauge, Zap } from "lucide-react";

const difficultyConfig = {
    Easy: { color: "from-emerald-500 to-green-600", badge: "text-emerald-400 bg-emerald-500/10", icon: Zap },
    Medium: { color: "from-amber-500 to-orange-600", badge: "text-amber-400 bg-amber-500/10", icon: Gauge },
    Hard: { color: "from-red-500 to-rose-600", badge: "text-red-400 bg-red-500/10", icon: Sparkles },
};

export default function NewInterview() {
    const [role, setRole] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function startInterview() {
        if (!role || !difficulty) return;
        setLoading(true);

        try {
            const res = await fetch("/api/interview/question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, difficulty }),
                credentials: "include",
            });

            const data = await res.json();
            if (res.ok && data.sessionId) {
                router.push(`/dashboard/student/interviews/session?id=${data.sessionId}`);
            }
        } catch {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Start Mock Interview</h1>
                    <p className="text-muted-foreground mt-2">Choose a role and difficulty to begin your AI-powered interview</p>
                </div>

                {/* Role Selection */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Select Role</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {INTERVIEW_ROLES.map((r) => (
                            <motion.button
                                key={r}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole(r)}
                                className={`glass-card rounded-xl p-4 text-left transition-all ${role === r
                                    ? "ring-2 ring-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                                    : "hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${role === r ? "bg-blue-400" : "bg-slate-600"}`} />
                                    <span className={`text-sm font-medium ${role === r ? "text-foreground" : "text-muted-foreground"}`}>{r}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Selection */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Select Difficulty</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {INTERVIEW_DIFFICULTIES.map((d) => {
                            const config = difficultyConfig[d];
                            return (
                                <motion.button
                                    key={d}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDifficulty(d)}
                                    className={`glass-card rounded-xl p-5 text-center transition-all ${difficulty === d
                                        ? "ring-2 ring-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                                        : "hover:bg-white/5"
                                        }`}
                                >
                                    <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${config.color} mb-3`}>
                                        <config.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <p className={`font-semibold ${difficulty === d ? "text-foreground" : "text-muted-foreground"}`}>{d}</p>
                                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${config.badge}`}>
                                        {d === "Easy" ? "5 mins" : d === "Medium" ? "10 mins" : "15 mins"}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Start Button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Button
                        onClick={startInterview}
                        disabled={!role || !difficulty || loading}
                        className="w-full py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all hover:scale-[1.01]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Preparing Interview...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Mic className="h-5 w-5" />
                                Start Interview
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        )}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
