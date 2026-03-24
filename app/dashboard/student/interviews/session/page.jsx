"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Mic, MicOff, Clock, ArrowRight, MessageSquare, Sparkles,
    StopCircle, Volume2, ChevronRight,
} from "lucide-react";

import { Suspense } from "react";

export default function InterviewSessionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>}>
            <InterviewSession />
        </Suspense>
    );
}

function InterviewSession() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("id");

    const [question, setQuestion] = useState("");
    const [questionIndex, setQuestionIndex] = useState(0);
    const [total, setTotal] = useState(0);
    const [answer, setAnswer] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [ending, setEnding] = useState(false);
    const [answerStartTime, setAnswerStartTime] = useState(null);
    const [useVoice, setUseVoice] = useState(false);

    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Fetch initial question
    useEffect(() => {
        if (!sessionId) return;
        fetchQuestion(0);
    }, [sessionId]);

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    async function fetchQuestion(idx) {
        setLoading(true);
        try {
            const res = await fetch("/api/interview/question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, questionIndex: idx }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.done) {
                await endInterview();
                return;
            }
            setQuestion(data.question);
            setQuestionIndex(data.questionIndex);
            setTotal(data.total);
            setAnswer("");
            setTranscript("");
            setAnswerStartTime(Date.now());
        } catch { }
        setLoading(false);
    }

    // Speech-to-text
    function startRecording() {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Speech recognition not supported. Please type your answer.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t + " ";
                } else {
                    interimTranscript += t;
                }
            }
            if (finalTranscript) {
                setTranscript((prev) => prev + finalTranscript);
                setAnswer((prev) => prev + finalTranscript);
            }
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        setUseVoice(true);
    }

    function stopRecording() {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    }

    async function submitAnswer() {
        if (!answer.trim()) return;
        setSubmitting(true);

        const duration = answerStartTime ? Math.round((Date.now() - answerStartTime) / 1000) : 60;

        try {
            await fetch("/api/interview/save-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, questionIndex, text: answer, duration }),
                credentials: "include",
            });

            // Move to next question
            if (questionIndex + 1 < total) {
                fetchQuestion(questionIndex + 1);
            } else {
                await endInterview();
            }
        } catch { }
        setSubmitting(false);
    }

    async function endInterview() {
        setEnding(true);
        try {
            await fetch("/api/interview/end", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
                credentials: "include",
            });
            router.push(`/dashboard/student/interviews/result?id=${sessionId}`);
        } catch { }
        setEnding(false);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    if (!sessionId) {
        return (
            <div className="text-center py-20 text-slate-400">
                <p>No session found. Please start a new interview.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-mono text-lg">{formatTime(timer)}</span>
                    </div>
                    <div className="glass-card rounded-xl px-4 py-2">
                        <span className="text-slate-400 text-sm">
                            Question <span className="text-white font-semibold">{questionIndex + 1}</span> of <span className="text-white">{total}</span>
                        </span>
                    </div>
                </div>

                <Button
                    onClick={endInterview}
                    disabled={ending}
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    <StopCircle className="h-4 w-4 mr-2" />
                    End Interview
                </Button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-white/5 mb-8">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((questionIndex + 1) / total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Question Card - Left */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={questionIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card rounded-2xl p-6 sticky top-24"
                        >
                            <div className="flex items-center gap-2 text-blue-400 text-sm mb-4">
                                <MessageSquare className="h-4 w-4" />
                                <span>Interview Question</span>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                                    <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                                    <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
                                </div>
                            ) : (
                                <p className="text-white text-lg leading-relaxed font-medium">{question}</p>
                            )}

                            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                                <Sparkles className="h-3 w-3" />
                                <span>AI-Generated Question</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Answer Area - Right */}
                <div className="lg:col-span-3">
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4">Your Answer</h3>

                        {/* Voice/Text Toggle */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex rounded-xl bg-white/5 p-1">
                                <button
                                    onClick={() => setUseVoice(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!useVoice ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    Type Answer
                                </button>
                                <button
                                    onClick={() => setUseVoice(true)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${useVoice ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    Voice Input
                                </button>
                            </div>
                        </div>

                        {useVoice ? (
                            <div className="space-y-4">
                                {/* Mic button */}
                                <div className="flex justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording
                                            ? "bg-red-500 animate-mic-pulse"
                                            : "bg-gradient-to-br from-blue-600 to-violet-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                                            }`}
                                    >
                                        {isRecording ? (
                                            <MicOff className="h-8 w-8 text-white" />
                                        ) : (
                                            <Mic className="h-8 w-8 text-white" />
                                        )}
                                    </motion.button>
                                </div>

                                <p className="text-center text-sm text-slate-400">
                                    {isRecording ? (
                                        <span className="text-red-400 flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            Recording... Click to stop
                                        </span>
                                    ) : (
                                        "Click the microphone to start speaking"
                                    )}
                                </p>

                                {/* Transcript panel */}
                                {answer && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                            <Volume2 className="h-3 w-3" />
                                            <span>Transcript</span>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed">{answer}</p>
                                    </div>
                                )}

                                {/* Also allow manual edit */}
                                <Textarea
                                    placeholder="Edit or add to your transcript..."
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[80px]"
                                />
                            </div>
                        ) : (
                            <Textarea
                                placeholder="Type your answer here... Be specific with examples and technical details."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[200px] text-base leading-relaxed"
                            />
                        )}

                        {/* Submit */}
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-xs text-slate-600">
                                {answer.trim().split(/\s+/).filter(Boolean).length} words
                            </p>
                            <Button
                                onClick={submitAnswer}
                                disabled={!answer.trim() || submitting}
                                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-40"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </div>
                                ) : questionIndex + 1 < total ? (
                                    <div className="flex items-center gap-2">
                                        Next Question
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Finish Interview
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
