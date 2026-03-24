"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Brain, Clock, AlertTriangle, ArrowRight,
    Loader2, ShieldCheck, Lock, CheckCircle2, CalendarClock,
} from "lucide-react";

export default function InterviewLandingPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hasAttempted, setHasAttempted] = useState(false);
    const [attemptStatus, setAttemptStatus] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [dailyLimitReached, setDailyLimitReached] = useState(false);

    // Auth form
    const [mode, setMode] = useState("register");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    useEffect(() => { fetchInterview(); }, [slug]);

    async function fetchInterview() {
        try {
            const res = await fetch(`/api/interview/${slug}`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setInterview(data.interview);
            setHasAttempted(data.hasAttempted);
            setAttemptStatus(data.attemptStatus);
            setIsAuthenticated(data.isAuthenticated);
        } catch (err) {
            setError(err.message || "Interview not found");
        } finally {
            setLoading(false);
        }
    }

    async function handleAuth(e) {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const endpoint = mode === "register"
                ? `/api/interview/${slug}/register`
                : "/api/auth/login";
            const body = mode === "register" ? { name, email, password } : { email, password };
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setIsAuthenticated(true);
            await fetchInterview();
        } catch (err) {
            setAuthError(err.message);
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleStartInterview() {
        // Pre-check daily limit before redirecting
        setLoading(true);
        try {
            const res = await fetch(`/api/interview/${slug}/start`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (res.status === 429 || data.error === "daily_limit") {
                setDailyLimitReached(true);
                setLoading(false);
                return;
            }
            if (res.status === 400 && data.error?.includes("already")) {
                setHasAttempted(true);
                setLoading(false);
                return;
            }
            // Successful — the start route already created the attempt, so pass the data via sessionStorage
            // and navigate to attempt page
            if (data.attemptId) {
                sessionStorage.setItem(`interview_${slug}`, JSON.stringify(data));
                router.push(`/interview/${slug}/attempt`);
                return;
            }
        } catch {
            // fallback — just navigate, the attempt page will call start itself
        }
        setLoading(false);
        router.push(`/interview/${slug}/attempt`);
    }

    function getTimeRemaining() {
        if (!interview?.expiresAt) return "";
        const diff = new Date(interview.expiresAt) - new Date();
        if (diff <= 0) return "Expired";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h remaining`;
    }

    // ── Loading ──
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // ── Error ──
    if (error || !interview) {
        return (
            <div className="h-full flex items-center justify-center bg-background px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Interview Not Found</h1>
                    <p className="text-muted-foreground">{error || "This interview link is invalid."}</p>
                </motion.div>
            </div>
        );
    }

    // ── Expired ──
    if (interview.isExpired) {
        return (
            <div className="h-full flex items-center justify-center bg-background px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
                    <Clock className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Interview Expired</h1>
                    <p className="text-muted-foreground">This interview is no longer accepting responses.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Expired on: {new Date(interview.expiresAt).toLocaleDateString()}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Interview Info Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{interview.jobRole}</h1>
                            <p className="text-sm text-muted-foreground">AI Video Technical Interview</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="glass rounded-xl p-3 text-center">
                            <p className="text-xs text-muted-foreground">Difficulty</p>
                            <p className={`text-sm font-semibold mt-1 ${interview.difficulty === "Easy" ? "text-emerald-500" : interview.difficulty === "Medium" ? "text-amber-500" : "text-red-500"}`}>
                                {interview.difficulty}
                            </p>
                        </div>
                        <div className="glass rounded-xl p-3 text-center">
                            <p className="text-xs text-muted-foreground">Questions</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{interview.numberOfQuestions}</p>
                        </div>
                        <div className="glass rounded-xl p-3 text-center">
                            <p className="text-xs text-muted-foreground">Vacancies</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{interview.vacancyCount}</p>
                        </div>
                        <div className="glass rounded-xl p-3 text-center">
                            <p className="text-xs text-muted-foreground">Time Left</p>
                            <p className="text-sm font-semibold text-blue-500 mt-1">{getTimeRemaining()}</p>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="glass rounded-xl p-4 mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Important Rules
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1.5">
                            <li>• Camera and microphone are required — keep them on throughout</li>
                            <li>• Questions are AI-generated and shuffled per candidate to prevent cheating</li>
                            <li>• Tab switching will be flagged — 3 violations = auto-submit</li>
                            <li>• You can only attempt this interview once</li>
                            <li>• 1 free AI interview allowed per day</li>
                        </ul>
                    </div>

                    {/* Daily limit banner */}
                    {dailyLimitReached && (
                        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-xl p-4 text-center border border-amber-500/30 bg-amber-500/5 mb-4">
                            <CalendarClock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                            <p className="text-amber-300 font-semibold">Daily Interview Limit Reached</p>
                            <p className="text-sm text-slate-400 mt-1">
                                You've used your free interview for today. Come back tomorrow to take another one — completely free!
                            </p>
                        </motion.div>
                    )}

                    {/* Already attempted */}
                    {hasAttempted && isAuthenticated && !dailyLimitReached && (
                        <div className="glass rounded-xl p-4 text-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-foreground font-medium">You have already completed this interview</p>
                            <p className="text-sm text-muted-foreground mt-1">Your submission has been recorded.</p>
                        </div>
                    )}

                    {/* Start/Resume button */}
                    {isAuthenticated && !hasAttempted && !dailyLimitReached && (
                        <Button onClick={handleStartInterview}
                            className="w-full py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all">
                            {attemptStatus === "InProgress" ? "Resume Interview" : "Start Interview"} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </motion.div>

                {/* Auth Form (unauthenticated) */}
                {!isAuthenticated && !hasAttempted && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Lock className="h-5 w-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-foreground">
                                {mode === "register" ? "Register to Take Interview" : "Sign In to Continue"}
                            </h2>
                        </div>
                        {authError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-500 text-sm">
                                {authError}
                            </div>
                        )}
                        <form onSubmit={handleAuth} className="space-y-4">
                            {mode === "register" && (
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="John Doe" />
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Password</label>
                                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="••••••••" />
                            </div>
                            <Button type="submit" disabled={authLoading}
                                className="w-full py-5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20">
                                {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                    mode === "register" ? "Register & Start" : "Sign In & Start"}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            {mode === "register" ? (
                                <>Already have an account? <button onClick={() => setMode("login")} className="text-blue-400 hover:underline">Sign In</button></>
                            ) : (
                                <>New here? <button onClick={() => setMode("register")} className="text-blue-400 hover:underline">Register</button></>
                            )}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
