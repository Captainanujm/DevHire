"use client";

import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, Camera, AlertTriangle, SkipForward, Loader2, Code2, Send, Play, CheckCircle2 } from "lucide-react";
import AntiCheat from "@/components/AntiCheat";
import { motion } from "framer-motion";

const Editor = lazy(() => import("@monaco-editor/react"));

const AI_NAME = "Nexus";
const FILLER_WORDS = ["um", "uh", "like", "you know", "actually", "basically", "so", "right", "well", "literally", "honestly", "i mean"];

function countFillerWords(text) {
    if (!text) return {};
    const lower = text.toLowerCase();
    const counts = {};
    FILLER_WORDS.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        const matches = lower.match(regex);
        if (matches && matches.length > 0) counts[word] = matches.length;
    });
    return counts;
}

function getMaleVoice() {
    const voices = window.speechSynthesis.getVoices();
    const preferred = ["Google UK English Male", "Microsoft David", "Microsoft Mark", "Google US English", "Daniel", "James", "Alex", "en-GB", "en-US"];
    for (const pref of preferred) {
        const v = voices.find(v => v.name.includes(pref) && (v.name.toLowerCase().includes("male") || !v.name.toLowerCase().includes("female")));
        if (v) return v;
    }
    const english = voices.filter(v => v.lang.startsWith("en"));
    const male = english.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david"));
    return male || english[0] || voices[0];
}

export default function InterviewAttemptPage() {
    const { slug } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [attemptId, setAttemptId] = useState(null);
    const [interviewData, setInterviewData] = useState(null);

    const [question, setQuestion] = useState("");
    const [questionType, setQuestionType] = useState("verbal");
    const [transcript, setTranscript] = useState("");
    const [timer, setTimer] = useState(120);
    const [isAiTalking, setIsAiTalking] = useState(false);
    const [isScoring, setIsScoring] = useState(false);

    const [code, setCode] = useState("// Write your solution here\n\nfunction solution() {\n  \n}\n");
    const [codeLang, setCodeLang] = useState("javascript");
    const [codeSubmitted, setCodeSubmitted] = useState(false);

    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [cameraPermission, setCameraPermission] = useState("pending");
    const [showCameraWarning, setShowCameraWarning] = useState(false);

    const [fillerCounts, setFillerCounts] = useState({});
    const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0);

    const [violations, setViolations] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Accumulated answers to send at the end
    const [allAnswers, setAllAnswers] = useState([]);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const isSubmittingRef = useRef(false);
    const transcriptRef = useRef("");
    const voiceRef = useRef(null);

    const TOTAL = questions.length;

    // Load voices
    useEffect(() => {
        const loadVoices = () => { voiceRef.current = getMaleVoice(); };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // =============== CAMERA + MIC ===============
    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            setCameraPermission("granted");
            setShowCameraWarning(false);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
            setCameraPermission("denied");
            setShowCameraWarning(true);
        }
    };

    const toggleMic = () => {
        const track = streamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMicEnabled(track.enabled);
    };

    const toggleVideo = () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) return;
        const ns = !track.enabled;
        track.enabled = ns;
        setVideoEnabled(ns);
        if (!ns) {
            setShowCameraWarning(true);
            clearInterval(timerRef.current);
            try { recognitionRef.current?.stop(); } catch { }
        } else {
            setShowCameraWarning(false);
            if (!isAiTalking && !loading && !submitted) { startListening(); startTimer(); }
        }
    };

    // =============== INITIAL FETCH ===============
    useEffect(() => {
        startMedia();
        fetchInterview();
        return () => {
            try { recognitionRef.current?.stop(); } catch { }
            try { window.speechSynthesis.cancel(); } catch { }
            streamRef.current?.getTracks().forEach((t) => t.stop());
            clearInterval(timerRef.current);
        };
    }, []);

    async function fetchInterview() {
        try {
            // Check if landing page already pre-fetched the data (avoids double rate-limit hit)
            const cached = sessionStorage.getItem(`interview_${slug}`);
            let data;
            if (cached) {
                data = JSON.parse(cached);
                sessionStorage.removeItem(`interview_${slug}`);
            } else {
                const res = await fetch(`/api/interview/${slug}/start`, { method: "POST", credentials: "include" });
                data = await res.json();
                if (!res.ok) {
                    if (res.status === 401) { router.push(`/interview/${slug}`); return; }
                    if (res.status === 429 || data.error === "daily_limit") {
                        router.push(`/interview/${slug}`);
                        return;
                    }
                    throw new Error(data.error || "Failed to start interview");
                }
            }

            setQuestions(data.questions);
            setAttemptId(data.attemptId);
            setInterviewData(data);

            if (data.questions && data.questions.length > 0) {
                const first = data.questions[0];
                setQuestion(first.question);
                setQuestionType(first.type || "verbal");
                setTimeout(() => speakQuestion(first.question, first.type || "verbal"), 1500);
            }
        } catch (err) {
            setError(err.message || "Failed to load interview");
        } finally {
            setLoading(false);
        }
    }

    // =============== TTS ===============
    const speakQuestion = useCallback((text, type) => {
        try { window.speechSynthesis.cancel(); } catch { }
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 0.95;
        if (voiceRef.current) utter.voice = voiceRef.current;

        utter.onstart = () => {
            setIsAiTalking(true);
            setTranscript("");
            transcriptRef.current = "";
            setFillerCounts({});
            setCodeSubmitted(false);
        };
        utter.onend = () => {
            setIsAiTalking(false);
            if (!showCameraWarning) {
                if (type !== "coding") startListening();
                startTimer(type);
            }
        };
        utter.onerror = () => {
            setIsAiTalking(false);
            if (!showCameraWarning) startTimer(type);
        };
        window.speechSynthesis.speak(utter);
    }, [showCameraWarning]);

    // =============== SPEECH RECOGNITION ===============
    const startListening = useCallback(() => {
        if (showCameraWarning || isSubmittingRef.current || submitted) return;
        const Recognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
        if (!Recognition) return;
        try { recognitionRef.current?.stop(); } catch { }
        try {
            const r = new Recognition();
            r.lang = "en-US";
            r.continuous = true;
            r.interimResults = true;
            r.onresult = (e) => {
                let f = "";
                for (let i = 0; i < e.results.length; i++) {
                    if (e.results[i].isFinal) f += e.results[i][0].transcript + " ";
                }
                if (f.trim()) {
                    transcriptRef.current += f;
                    setTranscript(transcriptRef.current);
                    setFillerCounts(countFillerWords(transcriptRef.current));
                }
            };
            r.onend = () => { if (!isSubmittingRef.current && !showCameraWarning && !submitted) try { r.start(); } catch { } };
            recognitionRef.current = r;
            r.start();
        } catch { }
    }, [showCameraWarning, submitted]);

    // =============== TIMER ===============
    const startTimer = useCallback((type) => {
        clearInterval(timerRef.current);
        const dur = type === "coding" ? 300 : 120; // 5 min coding, 2 min verbal
        let t = dur;
        setTimer(t);
        timerRef.current = setInterval(() => {
            t -= 1;
            setTimer(t);
            if (t <= 0) { clearInterval(timerRef.current); handleNextQuestion(); }
        }, 1000);
    }, []);

    // =============== NEXT QUESTION OR SUBMIT ===============
    const handleNextQuestion = async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsScoring(true);
        try { recognitionRef.current?.stop(); } catch { }
        try { window.speechSynthesis.cancel(); } catch { }
        clearInterval(timerRef.current);

        const isCoding = questionType === "coding";
        const answer = isCoding ? `[CODE SUBMISSION]\n${code}` : (transcriptRef.current.trim() || "No answer provided");
        const answerFillers = countFillerWords(transcriptRef.current);

        // Keep local record
        const newAns = {
            questionIndex: questions[currentIdx].index, // the original index from mapping
            type: questionType,
            transcript: answer,
            fillerCount: Object.values(answerFillers).reduce((a, b) => a + b, 0)
        };
        const updatedAnswers = [...allAnswers, newAns];
        setAllAnswers(updatedAnswers);

        setIsScoring(false);

        const nextIdx = currentIdx + 1;
        if (nextIdx >= questions.length) {
            // FINISH WHOLE INTERVIEW
            submitInterview(updatedAnswers);
            return;
        }

        const nextQ = questions[nextIdx];
        setCurrentIdx(nextIdx);
        setQuestion(nextQ.question);
        setQuestionType(nextQ.type || "verbal");
        setTranscript("");
        transcriptRef.current = "";
        setFillerCounts({});
        setCode("// Write your solution here\n\nfunction solution() {\n  \n}\n");
        setCodeSubmitted(false);
        isSubmittingRef.current = false;
        speakQuestion(nextQ.question, nextQ.type || "verbal");
    };

    const submitInterview = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/interview/${slug}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: finalAnswers, violations }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setResult(data);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Failed to submit interview");
        } finally {
            setSubmitting(false);
            isSubmittingRef.current = false;
        }
    };

    const handleSubmitCode = () => {
        if (code.trim().length > 30) setCodeSubmitted(true);
    };

    const [submitting, setSubmitting] = useState(false);

    // =============== RENDERERS ===============

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    );

    if (error) return (
        <div className="h-full flex items-center justify-center bg-background px-4">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-foreground mb-2">Error</h1>
                <p className="text-muted-foreground">{error}</p>
                <button onClick={() => router.push(`/interview/${slug}`)} className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Go Back</button>
            </div>
        </div>
    );

    if (submitted && result) return (
        <div className="h-full flex items-center justify-center bg-background px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Interview Submitted!</h1>
                <p className="text-muted-foreground mb-6">Your responses have been sent to the recruiter. They will be evaluated by our AI.</p>
                <div className="glass rounded-xl p-4 mb-6">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-lg font-semibold text-emerald-400">Under Review</p>
                </div>
                <button onClick={() => router.push("/dashboard/student")} className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700">Return to Dashboard</button>
            </motion.div>
        </div>
    );

    const maxTime = questionType === "coding" ? 300 : 120;
    const timerPercent = (timer / maxTime) * 100;
    const timerColor = timer > maxTime * 0.33 ? "bg-emerald-500" : timer > maxTime * 0.1 ? "bg-amber-500" : "bg-red-500";
    const isCodingQuestion = questionType === "coding";

    return (
        <div className="h-full bg-background relative px-4 md:px-6 py-4 flex flex-col">
            <AntiCheat violations={violations} setViolations={setViolations} maxViolations={3} onAutoSubmit={() => submitInterview(allAnswers)} />

            {/* Camera Warning Overlay */}
            {showCameraWarning && !submitted && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-8 max-w-md mx-4 text-center space-y-4">
                        <Camera className="w-12 h-12 text-red-400 mx-auto" />
                        <h2 className="text-2xl font-bold text-foreground">Camera Required</h2>
                        <p className="text-muted-foreground">Turn on your camera to continue.</p>
                        <button onClick={cameraPermission === "denied" ? startMedia : toggleVideo} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold">
                            {cameraPermission === "denied" ? "Grant Permission" : "Turn On Camera"}
                        </button>
                    </div>
                </div>
            )}

            {/* Submitting Overlay */}
            {submitting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-6 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                        <p className="text-foreground font-medium">Submitting interview and evaluating answers…</p>
                        <p className="text-sm text-muted-foreground">Please do not close this window.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">
                        Question {currentIdx + 1} <span className="text-muted-foreground font-normal text-lg">/ {TOTAL}</span>
                    </h1>
                </div>
                {totalFillers > 0 && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" /><span>{totalFillers} filler{totalFillers !== 1 ? "s" : ""}</span>
                    </div>
                )}
            </div>

            {/* Timer Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
                <div className={`h-full ${timerColor} transition-all duration-1000 rounded-full`} style={{ width: `${timerPercent}%` }} />
            </div>

            <div className="flex-1 flex flex-col">
                {isCodingQuestion ? (
                    // ====== CODING LAYOUT ======
                    <div className="space-y-4 flex-1 flex flex-col">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
                            <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-3">
                                <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> {AI_NAME}
                                </h2>
                                <div className="p-4 rounded-xl border border-border bg-card">
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{question}</p>
                                </div>
                                {isAiTalking && <p className="text-blue-400 text-sm animate-pulse">🔊 {AI_NAME} is reading the problem…</p>}
                                {!isAiTalking && <p className="text-violet-400 text-sm">💻 Write your solution below</p>}
                            </div>

                            <div className="glass-card rounded-2xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-sm font-semibold text-emerald-400">{interviewData?.interviewType === "Manual" ? "Live Room" : "Camera"}</h2>
                                    {interviewData?.interviewType !== "Manual" && (
                                        <div className="flex gap-1.5">
                                            <button onClick={toggleMic} className={`p-1.5 rounded-full border ${micEnabled ? "border-emerald-500/50 text-emerald-400" : "text-red-400"}`}>{micEnabled ? <Mic size={14} /> : <MicOff size={14} />}</button>
                                            <button onClick={toggleVideo} className={`p-1.5 rounded-full border ${videoEnabled ? "border-blue-500/50 text-blue-400" : "text-red-400"}`}>{videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}</button>
                                        </div>
                                    )}
                                </div>
                                {interviewData?.interviewType === "Manual" && interviewData?.dailyRoomUrl ? (
                                    <iframe className="w-full h-48 rounded-xl border border-border object-cover bg-black" src={`${interviewData.dailyRoomUrl}?join=1`} allow="camera; microphone; fullscreen; display-capture"></iframe>
                                ) : (
                                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-32 rounded-xl border border-border object-cover bg-black ${videoEnabled ? "" : "opacity-20"}`} />
                                )}
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="glass-card rounded-2xl p-4 space-y-3 flex-1 flex flex-col min-h-[300px]">
                            <div className="flex justify-between items-center shrink-0">
                                <select value={codeLang} onChange={(e) => setCodeLang(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-background text-foreground">
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                </select>
                                <button onClick={handleSubmitCode} disabled={code.trim().length < 30} className={`px-4 py-1.5 rounded-xl text-xs font-medium ${codeSubmitted ? "bg-emerald-500/20 text-emerald-400" : "bg-violet-600 text-white"}`}>
                                    {codeSubmitted ? "Saved" : "Quick Save"}
                                </button>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-border flex-1">
                                <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                                    <Editor height="100%" language={codeLang} theme="vs-dark" value={code} onChange={(v) => { setCode(v || ""); setCodeSubmitted(false); }} options={{ minimap: { enabled: false } }} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ====== VERBAL LAYOUT ======
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                        <div className="glass-card rounded-2xl p-6 flex flex-col">
                            <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2 mb-4 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> {AI_NAME}
                            </h2>
                            <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                                <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ${isAiTalking ? "animate-pulse shadow-blue-500/40" : ""}`}>
                                    {isAiTalking ? <div className="w-20 h-20 bg-white/20 rounded-full animate-ping" /> : <Mic className="w-12 h-12 text-white/80" />}
                                </div>
                                <div className="p-6 rounded-xl border border-border bg-card w-full text-center">
                                    <p className="text-foreground text-lg leading-relaxed">{question}</p>
                                </div>
                                {isAiTalking && <p className="text-blue-400 animate-pulse">🔊 {AI_NAME} is speaking…</p>}
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6 flex flex-col space-y-4">
                            <div className="flex justify-between items-center shrink-0">
                                <h2 className="text-lg font-semibold text-emerald-400">{interviewData?.interviewType === "Manual" ? "Live Observation Room" : "Your Camera"}</h2>
                                {interviewData?.interviewType !== "Manual" && (
                                    <div className="flex gap-2">
                                        <button onClick={toggleMic} className={`p-2 rounded-full border ${micEnabled ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "text-red-400"}`}>{micEnabled ? <Mic size={18} /> : <MicOff size={18} />}</button>
                                        <button onClick={toggleVideo} className={`p-2 rounded-full border ${videoEnabled ? "border-blue-500/50 bg-blue-500/10 text-blue-400" : "text-red-400"}`}>{videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}</button>
                                    </div>
                                )}
                            </div>
                            {interviewData?.interviewType === "Manual" && interviewData?.dailyRoomUrl ? (
                                <iframe className="w-full aspect-video rounded-xl border border-border object-cover bg-black" src={`${interviewData.dailyRoomUrl}?join=1`} allow="camera; microphone; fullscreen; display-capture"></iframe>
                            ) : (
                                <video ref={videoRef} autoPlay playsInline muted className={`w-full aspect-video rounded-xl border border-border object-cover bg-black ${videoEnabled ? "" : "opacity-20"}`} />
                            )}
                            <div className="flex-1 flex flex-col min-h-[120px]">
                                <p className="text-sm text-muted-foreground mb-2 shrink-0">Your Answer:</p>
                                <div className="flex-1 p-4 rounded-xl border border-border bg-card overflow-y-auto">
                                    {transcript ? <p className="text-foreground text-sm">{transcript}</p> : <span className="text-muted-foreground italic text-sm">{isAiTalking ? "Waiting…" : "🎙️ Speak now…"}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-5 shrink-0 flex items-center justify-between glass-card rounded-xl px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${!isAiTalking && timer > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                    <p className="text-muted-foreground text-sm">
                        {isAiTalking ? `${AI_NAME} speaking…` : `Time: ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`}
                    </p>
                </div>
                <button
                    onClick={handleNextQuestion}
                    disabled={isAiTalking || showCameraWarning || isScoring || submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-violet-600 text-white disabled:opacity-50"
                >
                    <SkipForward className="w-4 h-4" />
                    {currentIdx + 1 >= TOTAL ? "Finish & Submit" : "Next Question"}
                </button>
            </div>
        </div>
    );
}
