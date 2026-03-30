"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Code2, Play, Terminal, ChevronDown, ArrowLeft,
    Flame, Trophy, CheckCircle2, Zap, Calendar, Tag,
    Sparkles, Star, Filter, Search, Clock, ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
    { id: "javascript", label: "JavaScript", defaultCode: '// Write your solution here\nfunction solution(input) {\n  // Your code\n  return input;\n}\n\nconsole.log(solution("Hello"));' },
    { id: "python", label: "Python", defaultCode: '# Write your solution here\ndef solution(input_val):\n    # Your code\n    return input_val\n\nprint(solution("Hello"))' },
    { id: "typescript", label: "TypeScript", defaultCode: '// Write your solution here\nfunction solution(input: string): string {\n  // Your code\n  return input;\n}\n\nconsole.log(solution("Hello"));' },
];

const DIFFICULTY_COLORS = {
    Easy: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
    Medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
    Hard: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/10" },
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Generate last 7 date strings
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CodingLab() {
    // Browse state
    const [problems, setProblems] = useState([]);
    const [solvedIds, setSolvedIds] = useState([]);
    const [potd, setPotd] = useState(null);
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, solvedToday: false, recentDates: [] });
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Solve view state
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].defaultCode);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [solving, setSolving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [problemsRes, potdRes] = await Promise.all([
                fetch("/api/student/coding-problems", { credentials: "include" }),
                fetch("/api/student/coding-problems/potd", { credentials: "include" }),
            ]);

            if (problemsRes.ok) {
                const data = await problemsRes.json();
                setProblems(data.problems || []);
                setSolvedIds(data.solvedProblemIds || []);
            }

            if (potdRes.ok) {
                const data = await potdRes.json();
                setPotd(data.potd);
                setStreak(data.streak || { currentStreak: 0, longestStreak: 0, solvedToday: false, recentDates: [] });
            }
        } catch { }
        setLoading(false);
    }

    const filteredProblems = useMemo(() => {
        let list = problems;
        if (filter !== "All") list = list.filter(p => p.difficulty === filter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.title.toLowerCase().includes(q) ||
                (p.tags || []).some(t => t.toLowerCase().includes(q))
            );
        }
        return list;
    }, [problems, filter, searchQuery]);

    const stats = useMemo(() => {
        const easy = problems.filter(p => p.difficulty === "Easy").length;
        const medium = problems.filter(p => p.difficulty === "Medium").length;
        const hard = problems.filter(p => p.difficulty === "Hard").length;
        return { total: problems.length, easy, medium, hard, solved: solvedIds.length };
    }, [problems, solvedIds]);

    async function runCode() {
        setRunning(true);
        setOutput("Running...\n");
        try {
            const res = await fetch("/api/code/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: selectedLang.id }),
                credentials: "include",
            });
            const data = await res.json();
            setOutput(data.output || data.error || "No output");
        } catch {
            setOutput("Error: Failed to execute code");
        }
        setRunning(false);
    }

    async function markSolved() {
        if (!selectedProblem) return;
        setSolving(true);
        try {
            const res = await fetch("/api/student/coding-problems/solve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemId: selectedProblem._id }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                // Update local state
                if (!solvedIds.includes(selectedProblem._id)) {
                    setSolvedIds(prev => [...prev, selectedProblem._id]);
                }
                if (data.streak) {
                    setStreak(prev => ({
                        ...prev,
                        currentStreak: data.streak.currentStreak,
                        longestStreak: data.streak.longestStreak,
                    }));
                }
                if (data.isPotd) {
                    setStreak(prev => ({ ...prev, solvedToday: true }));
                }
            }
        } catch { }
        setSolving(false);
    }

    function openProblem(problem) {
        setSelectedProblem(problem);
        setCode(selectedLang.defaultCode);
        setOutput("");
    }

    function goBack() {
        setSelectedProblem(null);
        setOutput("");
    }

    function changeLang(lang) {
        setSelectedLang(lang);
        setCode(lang.defaultCode);
    }

    const last7 = getLast7Days();
    const isProblemSolved = (id) => solvedIds.includes(id?.toString());

    // ======================== SOLVE VIEW ========================
    if (selectedProblem) {
        return (
            <div className="max-w-full mx-auto h-[calc(100vh-7rem)]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={goBack} className="text-muted-foreground hover:text-foreground p-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Code2 className="h-5 w-5 text-cyan-400" />
                            <h1 className="text-xl font-bold text-foreground truncate">{selectedProblem.title}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[selectedProblem.difficulty]?.bg} ${DIFFICULTY_COLORS[selectedProblem.difficulty]?.text}`}>
                                {selectedProblem.difficulty}
                            </span>
                            {isProblemSolved(selectedProblem._id) && (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedLang.id}
                                    onChange={(e) => changeLang(LANGUAGES.find((l) => l.id === e.target.value))}
                                    className="glass-card rounded-lg px-3 py-2 text-sm text-foreground bg-transparent border border-border appearance-none pr-8 cursor-pointer"
                                >
                                    {LANGUAGES.map((l) => (
                                        <option key={l.id} value={l.id} className="bg-background text-foreground">{l.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>

                            <Button
                                onClick={runCode}
                                disabled={running}
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-0"
                            >
                                {running ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Running...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Play className="h-4 w-4" />
                                        Run Code
                                    </div>
                                )}
                            </Button>

                            {!isProblemSolved(selectedProblem._id) && (
                                <Button
                                    onClick={markSolved}
                                    disabled={solving}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                                >
                                    {solving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Mark Solved
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Layout */}
                    <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
                        {/* Left: Problem + Editor */}
                        <div className="flex flex-col gap-4 min-h-0">
                            {/* Problem Card */}
                            <div className="glass-card rounded-xl p-5 flex-shrink-0 max-h-[35%] overflow-y-auto">
                                <p className="text-muted-foreground text-sm whitespace-pre-line mb-3">{selectedProblem.description}</p>
                                {selectedProblem.example && (
                                    <div className="bg-secondary/50 dark:bg-white/5 rounded-lg p-3">
                                        <p className="text-muted-foreground text-xs mb-1 font-medium">Example:</p>
                                        <pre className="text-xs text-foreground/90 font-mono whitespace-pre-wrap">{selectedProblem.example}</pre>
                                    </div>
                                )}
                                {selectedProblem.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {selectedProblem.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Editor */}
                            <div className="glass-card rounded-xl overflow-hidden flex-1 min-h-[300px]">
                                <MonacoEditor
                                    height="100%"
                                    language={selectedLang.id}
                                    value={code}
                                    onChange={(v) => setCode(v || "")}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        padding: { top: 16, bottom: 16 },
                                        scrollBeyondLastLine: false,
                                        folding: true,
                                        lineNumbers: "on",
                                        roundedSelection: true,
                                        smoothScrolling: true,
                                        cursorBlinking: "smooth",
                                        cursorSmoothCaretAnimation: "on",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right: Output */}
                        <div className="glass-card rounded-xl flex flex-col min-h-0">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                                <Terminal className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm text-foreground/90 font-medium">Output</span>
                            </div>
                            <div className="flex-1 p-4 overflow-auto">
                                <pre className="text-sm text-foreground/90 font-mono whitespace-pre-wrap">
                                    {output || "Run your code to see output here..."}
                                </pre>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ======================== BROWSE VIEW ========================
    return (
        <div className="max-w-6xl mx-auto">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Page Header */}
                <motion.div variants={item} className="flex items-center gap-3 mb-6">
                    <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                        <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Coding Lab</h1>
                        <p className="text-muted-foreground text-sm">Sharpen your skills with daily challenges</p>
                    </div>
                </motion.div>

                {/* ========== PROBLEM OF THE DAY ========== */}
                <motion.div variants={item} className="mb-8">
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent blur-[60px]" />
                        <div className="absolute bottom-0 left-0 w-[200px] h-[150px] bg-gradient-to-tr from-violet-500/10 to-transparent blur-[60px]" />

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                {/* Left: POTD Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/20">
                                            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                                            <span className="text-xs font-semibold text-orange-400">Problem of the Day</span>
                                        </div>
                                        {streak.solvedToday && (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3" /> Solved!
                                            </span>
                                        )}
                                    </div>

                                    {potd ? (
                                        <>
                                            <h2 className="text-xl font-bold text-foreground mb-1">{potd.title}</h2>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[potd.difficulty]?.bg} ${DIFFICULTY_COLORS[potd.difficulty]?.text}`}>
                                                    {potd.difficulty}
                                                </span>
                                                {potd.tags?.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 max-w-xl">
                                                {potd.description}
                                            </p>
                                            <Button
                                                onClick={() => openProblem(potd)}
                                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white border-0 shadow-lg shadow-orange-500/20"
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                {streak.solvedToday ? "Solve Again" : "Solve Now"}
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </>
                                    ) : loading ? (
                                        <div className="space-y-3">
                                            <div className="h-6 w-48 bg-secondary/50 dark:bg-white/5 rounded animate-pulse" />
                                            <div className="h-4 w-72 bg-secondary/50 dark:bg-white/5 rounded animate-pulse" />
                                            <div className="h-10 w-32 bg-secondary/50 dark:bg-white/5 rounded animate-pulse" />
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No problems available yet.</p>
                                    )}
                                </div>

                                {/* Right: Streak Widget */}
                                <div className="flex flex-col items-center lg:items-end gap-4">
                                    {/* Streak Counter */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="text-center">
                                                <div className="flex items-center gap-1.5">
                                                    <Flame className="h-8 w-8 text-orange-400 animate-pulse" style={{ filter: "drop-shadow(0 0 8px rgba(251,146,60,0.5))" }} />
                                                    <span className="text-4xl font-extrabold text-foreground">{streak.currentStreak}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">Day Streak</p>
                                            </div>
                                        </div>

                                        <div className="h-12 w-px bg-border" />

                                        <div className="text-center">
                                            <div className="flex items-center gap-1.5">
                                                <Trophy className="h-5 w-5 text-amber-400" />
                                                <span className="text-2xl font-bold text-foreground">{streak.longestStreak}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">Best</p>
                                        </div>
                                    </div>

                                    {/* 7-day Calendar Dots */}
                                    <div className="flex items-center gap-1.5">
                                        {last7.map((day, i) => {
                                            const solved = streak.recentDates?.includes(day);
                                            const d = new Date(day);
                                            const label = DAY_LABELS[d.getUTCDay()];
                                            return (
                                                <div key={day} className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] text-muted-foreground">{label}</span>
                                                    <div
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                                                            solved
                                                                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
                                                                : "bg-secondary/50 dark:bg-white/5 text-muted-foreground"
                                                        }`}
                                                    >
                                                        {solved ? "✓" : d.getUTCDate()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ========== STATS BAR ========== */}
                <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total Problems", value: stats.total, icon: Code2, color: "text-blue-400" },
                        { label: "Solved", value: `${stats.solved}/${stats.total}`, icon: CheckCircle2, color: "text-emerald-400" },
                        { label: "Current Streak", value: `${streak.currentStreak} 🔥`, icon: Flame, color: "text-orange-400" },
                        { label: "Best Streak", value: streak.longestStreak, icon: Trophy, color: "text-amber-400" },
                    ].map((s, i) => (
                        <div key={i} className="glass-card rounded-xl p-4 text-center">
                            <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-2`} />
                            <p className="text-lg font-bold text-foreground">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* ========== FILTERS & SEARCH ========== */}
                <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2">
                        {["All", "Easy", "Medium", "Hard"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    filter === f
                                        ? f === "Easy" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                        : f === "Medium" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                        : f === "Hard" ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                        : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                        : "text-muted-foreground hover:text-foreground bg-secondary/50 dark:bg-white/5 border border-transparent"
                                }`}
                            >
                                {f}
                                <span className="ml-1.5 text-xs opacity-60">
                                    {f === "All" ? stats.total : f === "Easy" ? stats.easy : f === "Medium" ? stats.medium : stats.hard}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search problems or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full glass-card rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                </motion.div>

                {/* ========== PROBLEM CARDS GRID ========== */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                                <div className="h-5 w-2/3 bg-secondary/50 dark:bg-white/10 rounded mb-3" />
                                <div className="h-3 w-1/3 bg-secondary/50 dark:bg-white/10 rounded mb-4" />
                                <div className="h-3 w-full bg-secondary/50 dark:bg-white/10 rounded mb-2" />
                                <div className="h-3 w-4/5 bg-secondary/50 dark:bg-white/10 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filteredProblems.length === 0 ? (
                    <motion.div variants={item} className="text-center py-16 text-muted-foreground">
                        <Code2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">No problems found</p>
                        <p className="text-sm mt-1">Try a different filter or search term</p>
                    </motion.div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                        {filteredProblems.map((problem) => {
                            const solved = isProblemSolved(problem._id);
                            const dc = DIFFICULTY_COLORS[problem.difficulty] || DIFFICULTY_COLORS.Easy;
                            const isPotd = potd && potd._id === problem._id;

                            return (
                                <motion.div
                                    key={problem._id}
                                    variants={item}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openProblem(problem)}
                                    className={`glass-card rounded-xl p-5 cursor-pointer transition-all duration-300 group relative overflow-hidden hover:shadow-lg ${dc.glow} ${solved ? "ring-1 ring-emerald-500/20" : ""}`}
                                >
                                    {/* POTD badge */}
                                    {isPotd && (
                                        <div className="absolute top-3 right-3">
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/20">
                                                <Sparkles className="h-2.5 w-2.5" /> POTD
                                            </span>
                                        </div>
                                    )}

                                    {/* Solved indicator */}
                                    {solved && (
                                        <div className="absolute top-3 right-3">
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3" /> Solved
                                            </div>
                                        </div>
                                    )}

                                    {/* Problem number */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${dc.bg} ${dc.text}`}>
                                            {problems.indexOf(problem) + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-blue-400 transition-colors">
                                                {problem.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${dc.bg} ${dc.text} mb-3`}>
                                        {problem.difficulty}
                                    </span>

                                    {/* Description preview */}
                                    <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                                        {problem.description}
                                    </p>

                                    {/* Tags */}
                                    {problem.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {problem.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 dark:bg-white/5 text-muted-foreground">
                                                    {tag}
                                                </span>
                                            ))}
                                            {problem.tags.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 dark:bg-white/5 text-muted-foreground">
                                                    +{problem.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Hover arrow */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
