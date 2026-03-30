"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Mic, MicOff, Video, VideoOff, Camera, AlertTriangle, SkipForward, Loader2, Code2, Send, Play, CheckCircle2 } from "lucide-react";
import AntiCheat from "@/components/AntiCheat";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

// Monaco Editor breaks on SSR. Dynamic import solves this.
const Editor = dynamic(() => import("@monaco-editor/react"), { 
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-blue-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
});

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
    const [questions, setQuestionsState] = useState([]);
    const [currentIdx, setCurrentIdxState] = useState(0);
    const [attemptId, setAttemptId] = useState(null);
    const [interviewData, setInterviewData] = useState(null);

    const [question, setQuestion] = useState("");
    const [questionType, setQuestionTypeState] = useState("verbal");
    const [transcript, setTranscript] = useState("");
    const [timer, setTimer] = useState(120);
    const [isAiTalking, setIsAiTalking] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [allAnswers, setAllAnswersState] = useState([]);
    const [totalQuestions, setTotalQuestions] = useState(5);

    const [code, setCodeState] = useState("// Write your solution here\n\nfunction solution() {\n  \n}\n");
    const [codeLang, setCodeLang] = useState("javascript");
    const [codeSubmitted, setCodeSubmitted] = useState(false);

    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [showCameraWarning, setShowCameraWarning] = useState(false);
    const [cameraPermission, setCameraPermission] = useState("pending"); // pending, granted, denied
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [violations, setViolations] = useState(0);
    const [liveAiQuestion, setLiveAiQuestion] = useState(null);

    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const streamRef = useRef(null);
    const socketRef = useRef(null);
    const peerRef = useRef(null);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const isSubmittingRef = useRef(false);
    const transcriptRef = useRef("");
    const voiceRef = useRef(null);
    const isManualRef = useRef(false);

    const [fillerCounts, setFillerCounts] = useState({});
    const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0);

    // Refs to avoid stale closures in timer/callbacks
    const currentIdxRef = useRef(0);
    const questionsRef = useRef([]);
    const questionTypeRef = useRef("verbal");
    const codeRef = useRef("");
    const allAnswersRef = useRef([]);
    const handleNextQuestionRef = useRef(null);

    // Wrapper setters that sync state + refs
    const setQuestions = (val) => { questionsRef.current = val; setQuestionsState(val); };
    const setCurrentIdx = (val) => { currentIdxRef.current = val; setCurrentIdxState(val); };
    const setQuestionType = (val) => { questionTypeRef.current = val; setQuestionTypeState(val); };
    const setCode = (val) => { codeRef.current = val; setCodeState(val); };
    const setAllAnswers = (val) => { allAnswersRef.current = val; setAllAnswersState(val); };

    const TOTAL = totalQuestions;

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
            
            if (peerRef.current) {
                stream.getTracks().forEach(t => peerRef.current.addTrack(t, stream));
            }

            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (fsErr) {
                console.warn("Fullscreen request failed", fsErr);
            }
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
        const setup = async () => {
            await startMedia();
            fetchInterview();
        };
        setup();

        return () => {
            try { recognitionRef.current?.stop(); } catch { }
            try { window.speechSynthesis.cancel(); } catch { }
            clearInterval(speechKeepAliveRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            clearInterval(timerRef.current);
            if (socketRef.current) socketRef.current.disconnect();
            if (peerRef.current) peerRef.current.close();
        };
    }, []);

    async function fetchInterview() {
        try {
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

            setQuestions(data.questions || []);
            setAttemptId(data.attemptId);
            setInterviewData(data);
            setTotalQuestions(data.totalQuestions || data.questions?.length || 5);
            
            if (data.interviewType === "Manual") {
                isManualRef.current = true;
                initWebRTC();
            } else {
                if (!data.resumed && data.questions && data.questions.length > 0) {
                    const first = data.questions[0];
                    setQuestion(first.question);
                    setQuestionType(first.type || "verbal");
                    setTimeout(() => speakQuestion(first.question, first.type || "verbal"), 1500);
                }
            }
        } catch (err) {
            setError(err.message || "Failed to load interview");
        } finally {
            setLoading(false);
        }
    }

    const initWebRTC = () => {
        const socket = io("http://localhost:3001");
        socketRef.current = socket;
        
        socket.emit("join-room", slug);

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
            ]
        });
        peerRef.current = peer;

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => peer.addTrack(t, streamRef.current));
        }

        peer.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", { roomId: slug, candidate: event.candidate, sender: "candidate" });
            }
        };

        socket.on("offer", async (payload) => {
            if (payload.sender === "recruiter") {
                // Ensure candidate has added their tracks before answering
                if (streamRef.current) {
                    const senders = peer.getSenders();
                    streamRef.current.getTracks().forEach(t => {
                        if (!senders.find(s => s.track === t)) {
                            peer.addTrack(t, streamRef.current);
                        }
                    });
                }
                
                await peer.setRemoteDescription(new RTCSessionDescription(payload.offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit("answer", { roomId: slug, answer, sender: "candidate" });
            }
        });

        socket.on("ice-candidate", async (payload) => {
            if (payload.sender === "recruiter" && payload.candidate) {
                try {
                    if (peer.remoteDescription) {
                        await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    }
                } catch(e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        });

        socket.on("trigger-ai-question", (payload) => {
            setLiveAiQuestion(payload.question);
            setIsAiTalking(true);
            speakQuestion(payload.question, "verbal");
        });

        socket.on("hide-ai-question", () => {
            setLiveAiQuestion(null);
            setIsAiTalking(false);
            try { window.speechSynthesis.cancel(); } catch {}
        });
    };

    // =============== TIMER ===============
    const showCameraWarningRef = useRef(false);
    useEffect(() => { showCameraWarningRef.current = showCameraWarning; }, [showCameraWarning]);
    const speechKeepAliveRef = useRef(null);
    const lastSpokenQuestionRef = useRef("");
    const utteranceRef = useRef(null);

    const speakQuestion = useCallback((text, type) => {
        // Prevent speaking the exact same question twice in a row (Chrome onend bug)
        if (lastSpokenQuestionRef.current === text && window.speechSynthesis.speaking) return;
        lastSpokenQuestionRef.current = text;

        setIsAiTalking(true);
        try { window.speechSynthesis.cancel(); } catch { }
        clearInterval(speechKeepAliveRef.current);

        let cleanText = text;
        const testCaseMatch = text.indexOf("[TEST_CASES]");
        if (testCaseMatch !== -1) {
             cleanText = cleanText.substring(0, testCaseMatch).trim();
        }
        
        // Remove code block markdown ticks for smoother speech
        cleanText = cleanText.replace(/```[a-z]*\n/g, "").replace(/```/g, "");

        const utter = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utter;
        utter.rate = 0.9;
        utter.pitch = 0.95;
        if (voiceRef.current) utter.voice = voiceRef.current;

        utter.onstart = () => {
            setTranscript("");
            transcriptRef.current = "";
            setFillerCounts({});
            setCodeSubmitted(false);

            // Chrome workaround: chrome pauses speechSynthesis after ~15s.
            // Periodically calling pause()/resume() keeps it alive.
            clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = setInterval(() => {
                if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);
        };
        utter.onend = () => {
            clearInterval(speechKeepAliveRef.current);
            setIsAiTalking(false);
            if (!showCameraWarningRef.current && !isManualRef.current) {
                if (type !== "coding") startListening();
                startTimer(type);
            }
        };
        utter.onerror = (e) => {
            // "interrupted" fires when we cancel speech intentionally (e.g. moving to next question)
            // — don't start the timer in that case
            clearInterval(speechKeepAliveRef.current);
            if (e.error === "interrupted") return;
            setIsAiTalking(false);
            if (!showCameraWarningRef.current && !isManualRef.current) startTimer(type);
        };
        window.speechSynthesis.speak(utter);
    }, []);

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
                for (let i = e.resultIndex; i < e.results.length; i++) {
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
            if (t <= 0) { clearInterval(timerRef.current); handleNextQuestionRef.current?.(); }
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

        // Read from refs to avoid stale closure values
        const curIdx = currentIdxRef.current;
        const curQuestions = questionsRef.current;
        const curQuestionType = questionTypeRef.current;
        const curCode = codeRef.current;
        const curAllAnswers = allAnswersRef.current;

        const isCoding = curQuestionType === "coding";
        const answer = isCoding ? `[CODE SUBMISSION]\n${curCode}` : (transcriptRef.current.trim() || "No answer provided");
        const answerFillers = countFillerWords(transcriptRef.current);

        // Keep local record
        const newAns = {
            questionIndex: curQuestions[curIdx]?.index, // the original index from mapping
            type: curQuestionType,
            transcript: answer,
            fillerCount: Object.values(answerFillers).reduce((a, b) => a + b, 0)
        };
        const updatedAnswers = [...curAllAnswers, newAns];
        setAllAnswers(updatedAnswers);

        const nextIdx = curIdx + 1;
        if (nextIdx >= totalQuestions) {
            // FINISH WHOLE INTERVIEW
            setIsScoring(false);
            submitInterview(updatedAnswers);
            return;
        }

        let nextQ = curQuestions[nextIdx];
        if (!nextQ) {
            setQuestion("Generating next AI question... Please wait.");
            try {
                const res = await fetch(`/api/interview/${slug}/next`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentQuestion: curQuestions[curIdx].question, currentAnswer: answer, questionIndex: curIdx }),
                    credentials: "include"
                });
                const data = await res.json();
                if (data.isFinished || !data.nextQuestion) {
                     submitInterview(updatedAnswers); return;
                }
                nextQ = data.nextQuestion;
                setQuestions([...curQuestions, nextQ]);
            } catch (err) {
                 console.error("Failed to generate contextual question", err);
                 submitInterview(updatedAnswers); return;
            }
        }

        setIsScoring(false);

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

    // Keep the ref always pointing to the latest handleNextQuestion
    handleNextQuestionRef.current = handleNextQuestion;

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
    const isManualInterview = interviewData?.interviewType === "Manual";

    // ====== MANUAL INTERVIEW: Pure video call, no AI ======
    if (isManualInterview) {
        return (
            <div className="h-full bg-background relative flex flex-col">
                <AntiCheat violations={violations} setViolations={setViolations} maxViolations={3} onAutoSubmit={() => submitInterview([])} />
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-6 py-4 glass-card">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Live Interview</h1>
                            <p className="text-xs text-muted-foreground">{interviewData?.jobRole} • Video Call with Recruiter</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to finish and submit this interview?")) {
                                submitInterview([]);
                            }
                        }}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Finish & Submit"}
                    </button>
                </div>

                {/* Full-screen Video Call */}
                <div className="flex-1 p-4 relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full rounded-2xl border border-border bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] object-cover"
                    />
                    {!remoteVideoRef.current?.srcObject && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="glass-card rounded-2xl p-8 text-center max-w-md animate-pulse">
                                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-foreground mb-2">Waiting for Recruiter</h2>
                                <p className="text-muted-foreground">The recruiter will appear here shortly...</p>
                            </div>
                        </div>
                    )}
                    
                    {liveAiQuestion && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
                            <div className="glass-card rounded-2xl p-6 bg-black/80 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.2)] backdrop-blur-xl animate-in slide-in-from-top-10 flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-full mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ${isAiTalking ? "animate-pulse shadow-blue-500/40" : ""}`}>
                                    {isAiTalking ? <div className="w-12 h-12 bg-white/20 rounded-full animate-ping" /> : <Mic className="w-8 h-8 text-white/80" />}
                                </div>
                                <h3 className="text-blue-400 font-semibold mb-2">Nexus AI</h3>
                                <p className="text-foreground text-lg leading-relaxed">{liveAiQuestion}</p>
                            </div>
                        </div>
                    )}
                    
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute bottom-8 right-8 w-64 aspect-video rounded-xl border-2 border-primary/20 bg-black shadow-2xl object-cover z-10"
                    />
                </div>
            </div>
        );
    }

    // ====== AUTOMATED INTERVIEW: AI-powered with TTS ======
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
                                    <iframe className="w-full h-48 rounded-xl border border-border object-cover bg-black" src={`${interviewData.dailyRoomUrl}#config.prejoinPageEnabled=false`} allow="camera; microphone; fullscreen; display-capture"></iframe>
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
                            <div className="rounded-xl overflow-hidden border border-border flex-1 min-h-[400px]">
                                <Editor height="100%" language={codeLang} theme="vs-dark" value={code} onChange={(v) => { setCode(v || ""); setCodeSubmitted(false); }} options={{ automaticLayout: true, minimap: { enabled: false }, selectOnLineNumbers: true, formatOnPaste: true, fontSize: 14 }} />
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
                                <iframe className="w-full aspect-video rounded-xl border border-border object-cover bg-black" src={`${interviewData.dailyRoomUrl}#config.prejoinPageEnabled=false`} allow="camera; microphone; fullscreen; display-capture"></iframe>
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
