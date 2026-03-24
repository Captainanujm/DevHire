"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Code2, Play, Send, Terminal, CheckCircle, XCircle,
    RotateCcw, ChevronDown,
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
    { id: "javascript", label: "JavaScript", defaultCode: '// Write your solution here\nfunction solution(input) {\n  // Your code\n  return input;\n}\n\nconsole.log(solution("Hello"));' },
    { id: "python", label: "Python", defaultCode: '# Write your solution here\ndef solution(input_val):\n    # Your code\n    return input_val\n\nprint(solution("Hello"))' },
    { id: "typescript", label: "TypeScript", defaultCode: '// Write your solution here\nfunction solution(input: string): string {\n  // Your code\n  return input;\n}\n\nconsole.log(solution("Hello"));' },
];

const SAMPLE_PROBLEMS = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nYou may assume that each input would have exactly one solution.",
        example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
    },
    {
        id: 2,
        title: "Reverse String",
        difficulty: "Easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters.",
        example: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
    },
    {
        id: 3,
        title: "Valid Parentheses",
        difficulty: "Medium",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        example: "Input: s = '()[]{}'\nOutput: true",
    },
    {
        id: 4,
        title: "FizzBuzz",
        difficulty: "Easy",
        description: "Given an integer n, return a string array answer where answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, or i (as a string).",
        example: "Input: n = 15\nOutput: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz']",
    },
];

export default function CodingLab() {
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].defaultCode);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [problems, setProblems] = useState(SAMPLE_PROBLEMS);
    const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
    const [showProblems, setShowProblems] = useState(false);
    const [fetchingProblems, setFetchingProblems] = useState(true);

    useEffect(() => {
        async function fetchProblems() {
            try {
                const res = await fetch("/api/student/coding-problems", { credentials: "include" });
                const data = await res.json();
                if (data.problems && data.problems.length > 0) {
                    setProblems(data.problems);
                    setSelectedProblem(data.problems[0]);
                }
            } catch {
                // silently fallback to SAMPLE_PROBLEMS already in state
            } finally {
                setFetchingProblems(false);
            }
        }
        fetchProblems();
    }, []);

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
        } catch (err) {
            setOutput("Error: Failed to execute code");
        }
        setRunning(false);
    }

    function changeLang(lang) {
        setSelectedLang(lang);
        setCode(lang.defaultCode);
    }

    return (
        <div className="max-w-full mx-auto h-[calc(100vh-7rem)]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Code2 className="h-6 w-6 text-cyan-400" />
                        <h1 className="text-2xl font-bold text-foreground">Coding Lab</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language selector */}
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
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
                    {/* Left: Problem + Editor */}
                    <div className="flex flex-col gap-4 min-h-0">
                        {/* Problem Card */}
                        <div className="glass-card rounded-xl p-4 flex-shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-foreground">{selectedProblem.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedProblem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                                        selectedProblem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                            "bg-red-500/10 text-red-400"
                                    }`}>
                                    {selectedProblem.difficulty}
                                </span>
                            </div>
                            <p className="text-muted-foreground  text-sm whitespace-pre-line mb-3">{selectedProblem.description}</p>
                            <div className="bg-secondary/50 dark:bg-white/5 rounded-lg p-3">
                                <p className="text-muted-foreground  text-xs mb-1">Example:</p>
                                <pre className="text-xs text-foreground/90  font-mono whitespace-pre-wrap">{selectedProblem.example}</pre>
                            </div>

                            {/* Problem selector */}
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {problems.map((p) => (
                                    <button
                                        key={p._id || p.id}
                                        onClick={() => setSelectedProblem(p)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${(selectedProblem._id || selectedProblem.id) === (p._id || p.id)
                                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                                : "text-muted-foreground  hover:text-foreground/90  bg-secondary/50 dark:bg-white/5"
                                            }`}
                                    >
                                        {p.title}
                                    </button>
                                ))}
                            </div>
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
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border dark:border-white/">
                            <Terminal className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm text-foreground/90  font-medium">Output</span>
                        </div>
                        <div className="flex-1 p-4 overflow-auto">
                            <pre className="text-sm text-foreground/90  font-mono whitespace-pre-wrap">
                                {output || "Run your code to see output here..."}
                            </pre>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
