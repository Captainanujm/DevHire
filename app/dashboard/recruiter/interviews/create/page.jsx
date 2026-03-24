"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreateInterviewPage() {
    const router = useRouter();
    const [jobRole, setJobRole] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [vacancyCount, setVacancyCount] = useState(1);
    const [interviewType, setInterviewType] = useState("Automated");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [candidatePhone, setCandidatePhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = { 
                jobRole, difficulty, numberOfQuestions, vacancyCount, interviewType 
            };
            if (interviewType === "Manual") {
                payload.targetCandidate = { email: candidateEmail, phone: candidatePhone };
            }

            const res = await fetch("/api/recruiter/interviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push(`/dashboard/recruiter/interviews/${data.interview._id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/dashboard/recruiter/interviews" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Interviews
                </Link>

                <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Create New Interview</h1>
                            <p className="text-sm text-muted-foreground">{interviewType === "Automated" ? "AI will generate questions and evaluate candidates" : "Create a targeted live interview with a specific candidate"}</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Interview Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setInterviewType("Automated")}
                                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${interviewType === "Automated" ? "bg-blue-500/15 border-blue-500/50 text-blue-400" : "glass border-border text-muted-foreground hover:text-foreground"}`}
                                >
                                    Automated (AI Evaluated)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInterviewType("Manual")}
                                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${interviewType === "Manual" ? "bg-purple-500/15 border-purple-500/50 text-purple-400" : "glass border-border text-muted-foreground hover:text-foreground"}`}
                                >
                                    Manual (Live Observation)
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Job Role</label>
                            <input
                                type="text"
                                required
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="e.g., React.js Developer, Full Stack Engineer"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Difficulty Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {["Easy", "Medium", "Hard"].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setDifficulty(level)}
                                        className={`py-3 rounded-xl text-sm font-semibold border transition-all ${difficulty === level
                                                ? level === "Easy" ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-500"
                                                    : level === "Medium" ? "bg-amber-500/15 border-amber-500/50 text-amber-500"
                                                        : "bg-red-500/15 border-red-500/50 text-red-500"
                                                : "glass border-border text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Number of Questions</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    max={50}
                                    value={numberOfQuestions}
                                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Vacancy Count</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={vacancyCount}
                                    onChange={(e) => setVacancyCount(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {interviewType === "Manual" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Candidate Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={candidateEmail}
                                        onChange={(e) => setCandidateEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="candidate@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Candidate Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={candidatePhone}
                                        onChange={(e) => setCandidatePhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl glass-strong text-foreground bg-transparent border border-border focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-amber-400" />
                                <p className="text-sm font-medium text-foreground">Summary</p>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• {numberOfQuestions} {difficulty.toLowerCase()} questions for <strong className="text-foreground">{jobRole || "..."}</strong></li>
                                <li>• AI generates unique technical questions automatically</li>
                                {interviewType === "Manual" ? (
                                    <>
                                        <li>• Send direct invite to <strong className="text-foreground">{candidateEmail || "candidate"}</strong></li>
                                        <li>• Recruiter joins live observing room</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Appears instantly in public available interviews feed</li>
                                        <li>• Top {vacancyCount} candidate(s) auto-selected based on AI score</li>
                                        <li>• Strict Anti-cheating enabled</li>
                                    </>
                                )}
                                <li>• Time limit: {numberOfQuestions} minutes</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating Questions...</>
                            ) : (
                                <><Brain className="h-5 w-5 mr-2" /> Create Interview</>
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
