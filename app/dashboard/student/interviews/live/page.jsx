"use client";

import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, Camera, AlertTriangle, SkipForward, Loader2, Code2, Send, Play } from "lucide-react";

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

// Pick the best male voice available
function getMaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  // Prefer deep, natural-sounding male voices
  const preferred = [
    "Google UK English Male",
    "Microsoft David",
    "Microsoft Mark",
    "Google US English",
    "Daniel",
    "James",
    "Alex",
    "en-GB",
    "en-US",
  ];
  for (const pref of preferred) {
    const v = voices.find(
      (v) => v.name.includes(pref) && (v.name.toLowerCase().includes("male") || !v.name.toLowerCase().includes("female"))
    );
    if (v) return v;
  }
  // Fallback: first English male or first English voice
  const english = voices.filter((v) => v.lang.startsWith("en"));
  const male = english.find((v) => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("james"));
  return male || english[0] || voices[0];
}

export default function LiveInterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <LiveInterview />
    </Suspense>
  );
}

function LiveInterview() {
  const params = useSearchParams();
  const router = useRouter();
  const role = params.get("role") || "Full Stack Developer";
  const difficulty = params.get("difficulty") || "Medium";

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("verbal");
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(120);
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(`${AI_NAME} is preparing your interview…`);

  const [code, setCode] = useState("// Write your solution here\n\nfunction solution() {\n  \n}\n");
  const [codeLang, setCodeLang] = useState("javascript");
  const [codeSubmitted, setCodeSubmitted] = useState(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [cameraPermission, setCameraPermission] = useState("pending");
  const [showCameraWarning, setShowCameraWarning] = useState(false);

  const [fillerCounts, setFillerCounts] = useState({});
  const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const transcriptRef = useRef("");
  const voiceRef = useRef(null);

  const TOTAL = questions.length || 5;

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
      if (!isAiTalking && !isLoading) { startListening(); startTimer(); }
    }
  };

  // =============== GENERATE QUESTIONS ===============
  const generateQuestions = async () => {
    setIsLoading(true);
    setLoadingMsg(`${AI_NAME} is generating your interview questions…`);
    try {
      const res = await fetch("/api/interview/ai-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });
      const data = await res.json();
      if (res.ok && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        return data.questions;
      }
      throw new Error(data.error || "Failed");
    } catch {
      const fallback = [
        { question: `What are the most important technical skills for a ${role}, and how have you applied them?`, type: "verbal" },
        { question: `Tell me about a challenging bug you faced recently. How did you debug and resolve it?`, type: "verbal" },
        { question: `Write a function that takes an array of integers and returns the two numbers that add up to a given target. For example, given [2, 7, 11, 15] and target 9, return [2, 7].`, type: "coding" },
        { question: `If you were designing a scalable real-time notification system, what would your architecture look like?`, type: "verbal" },
        { question: `Describe a situation where you had to work under a tight deadline. How did you manage priorities?`, type: "verbal" },
      ];
      setQuestions(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  // =============== TTS (Male Natural Voice) ===============
  const speakQuestion = useCallback((text) => {
    try { window.speechSynthesis.cancel(); } catch { }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 0.95;
    utter.volume = 1;
    // Use the selected male voice
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
        if (questionType !== "coding") startListening();
        startTimer();
      }
    };
    utter.onerror = () => {
      setIsAiTalking(false);
      if (!showCameraWarning) startTimer();
    };
    window.speechSynthesis.speak(utter);
  }, [showCameraWarning, questionType]);

  // =============== SPEECH RECOGNITION ===============
  const startListening = useCallback(() => {
    if (showCameraWarning || isSubmittingRef.current) return;
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
      r.onerror = () => { };
      r.onend = () => { if (!isSubmittingRef.current && !showCameraWarning) try { r.start(); } catch { } };
      recognitionRef.current = r;
      r.start();
    } catch { }
  }, [showCameraWarning]);

  // =============== TIMER ===============
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    const dur = questionType === "coding" ? 300 : 120;
    let t = dur;
    setTimer(t);
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimer(t);
      if (t <= 0) { clearInterval(timerRef.current); handleSubmitAnswer(); }
    }, 1000);
  }, [questionType]);

  // =============== SUBMIT ANSWER ===============
  const handleSubmitAnswer = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsScoring(true);
    try { recognitionRef.current?.stop(); } catch { }
    try { window.speechSynthesis.cancel(); } catch { }
    clearInterval(timerRef.current);

    const isCoding = questionType === "coding";
    const answer = isCoding ? `[CODE SUBMISSION]\n${code}` : (transcriptRef.current.trim() || "No answer provided");
    const answerFillers = countFillerWords(transcriptRef.current);

    try {
      const res = await fetch("/api/interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, role, type: questionType }),
      });
      let scoreData = {};
      try { scoreData = await res.json(); } catch { }

      const results = JSON.parse(localStorage.getItem("interviewResults") || "[]");
      results.push({
        question, answer, type: questionType, fillerWordCounts: answerFillers,
        technicalScore: scoreData.technicalScore || 0,
        communicationScore: scoreData.communicationScore || 0,
        correctness: scoreData.correctness || "N/A",
        grammarIssues: scoreData.grammarIssues || [],
        fillerWords: scoreData.fillerWords || [],
        missingPoints: scoreData.missingPoints || [],
        improvement: scoreData.improvement || "",
      });
      localStorage.setItem("interviewResults", JSON.stringify(results));
    } catch {
      const results = JSON.parse(localStorage.getItem("interviewResults") || "[]");
      results.push({ question, answer, type: questionType, fillerWordCounts: answerFillers, technicalScore: 0, communicationScore: 0, correctness: "Error", grammarIssues: [], fillerWords: [], missingPoints: [], improvement: "Scoring temporarily unavailable." });
      localStorage.setItem("interviewResults", JSON.stringify(results));
    }

    setIsScoring(false);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      router.push("/dashboard/student/interviews/report");
      return;
    }

    const nextQ = questions[nextIdx];
    const nextQuestion = typeof nextQ === "string" ? nextQ : nextQ.question;
    const nextType = typeof nextQ === "string" ? "verbal" : (nextQ.type || "verbal");

    setCurrentIdx(nextIdx);
    setQuestion(nextQuestion);
    setQuestionType(nextType);
    setTranscript("");
    transcriptRef.current = "";
    setFillerCounts({});
    setCode("// Write your solution here\n\nfunction solution() {\n  \n}\n");
    setCodeSubmitted(false);
    isSubmittingRef.current = false;
    speakQuestion(nextQuestion);
  };

  // Submit code only (mark as submitted, show checkmark)
  const handleSubmitCode = () => {
    if (code.trim().length > 30) {
      setCodeSubmitted(true);
    }
  };

  // =============== MOUNT ===============
  useEffect(() => {
    localStorage.removeItem("interviewResults");
    startMedia();
    (async () => {
      const qs = await generateQuestions();
      if (qs && qs.length > 0) {
        const first = qs[0];
        const firstQ = typeof first === "string" ? first : first.question;
        const firstType = typeof first === "string" ? "verbal" : (first.type || "verbal");
        setQuestion(firstQ);
        setQuestionType(firstType);
        setTimeout(() => speakQuestion(firstQ), 1500);
      }
    })();
    return () => {
      try { recognitionRef.current?.stop(); } catch { }
      try { window.speechSynthesis.cancel(); } catch { }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
    };
  }, []);

  const maxTime = questionType === "coding" ? 300 : 120;
  const timerPercent = (timer / maxTime) * 100;
  const timerColor = timer > maxTime * 0.33 ? "bg-emerald-500" : timer > maxTime * 0.1 ? "bg-amber-500" : "bg-red-500";
  const isCodingQuestion = questionType === "coding";

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 md:px-6 py-6">
      {/* Camera Warning */}
      {showCameraWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md mx-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto"><Camera className="w-8 h-8 text-red-400" /></div>
            <h2 className="text-2xl font-bold text-foreground">Camera Required</h2>
            <p className="text-muted-foreground">Turn on your camera to continue the interview with {AI_NAME}.</p>
            <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-xl px-4 py-2"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>Interview paused</span></div>
            <button onClick={cameraPermission === "denied" ? startMedia : toggleVideo} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:scale-105 transition-transform">
              {cameraPermission === "denied" ? "Grant Permission" : "Turn On Camera"}
            </button>
          </div>
        </div>
      )}

      {/* Scoring Overlay */}
      {isScoring && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-foreground font-medium">{AI_NAME} is evaluating your {isCodingQuestion ? "code" : "answer"}…</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Question {currentIdx + 1}{" "}
            <span className="text-muted-foreground font-normal text-lg">/ {TOTAL}</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">{role} • {difficulty}</p>
            {isCodingQuestion && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs font-medium">
                <Code2 className="w-3 h-3" /> Coding Challenge
              </span>
            )}
          </div>
        </div>
        {totalFillers > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertTriangle className="w-3.5 h-3.5" /><span>{totalFillers} filler{totalFillers !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="w-full h-1.5 bg-secondary/50 dark:bg-white/5 rounded-full mb-5 overflow-hidden">
        <div className={`h-full ${timerColor} transition-all duration-1000 rounded-full`} style={{ width: `${timerPercent}%` }} />
      </div>

      {isCodingQuestion ? (
        /* === CODING LAYOUT === */
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                {AI_NAME} — Coding Challenge
              </h2>
              <div className="p-4 rounded-xl border border-border bg-card">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />{loadingMsg}</div>
                ) : (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{question}</p>
                )}
              </div>
              {isAiTalking && <p className="text-blue-400 text-sm animate-pulse">🔊 {AI_NAME} is reading the problem…</p>}
              {!isAiTalking && !isLoading && <p className="text-violet-400 text-sm">💻 Write your solution below, then click <strong>Submit Code</strong></p>}
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-emerald-400">Camera</h2>
                <div className="flex gap-1.5">
                  <button type="button" onClick={toggleMic} className={`p-1.5 rounded-full border text-xs ${micEnabled ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"}`}>
                    {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                  </button>
                  <button type="button" onClick={toggleVideo} className={`p-1.5 rounded-full border text-xs ${videoEnabled ? "border-blue-500/50 text-blue-400" : "border-red-500/50 text-red-400"}`}>
                    {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
                  </button>
                </div>
              </div>
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-32 rounded-xl border border-border object-cover bg-black ${videoEnabled ? "" : "opacity-20"}`} />
            </div>
          </div>

          {/* Code Editor */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
                <select value={codeLang} onChange={(e) => setCodeLang(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-background border border-border text-foreground">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                {codeSubmitted && <span className="text-xs text-emerald-400 flex items-center gap-1">✓ Code saved</span>}
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  disabled={code.trim().length < 30}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${code.trim().length < 30
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : codeSubmitted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:scale-105"
                    }`}
                >
                  {codeSubmitted ? (
                    <><Play className="w-4 h-4" /> Code Submitted</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Code</>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border" style={{ height: "320px" }}>
              <Suspense fallback={<div className="h-full flex items-center justify-center bg-[#1e1e1e] text-foreground/50"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading editor…</div>}>
                <Editor
                  height="320px"
                  language={codeLang}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => { setCode(val || ""); setCodeSubmitted(false); }}
                  options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, automaticLayout: true, tabSize: 2 }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      ) : (
        /* === VERBAL LAYOUT === */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> {AI_NAME}
            </h2>
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ${isAiTalking ? "animate-pulse shadow-blue-500/40" : ""}`}>
                {isAiTalking ? <div className="w-16 h-16 bg-white/20 rounded-full animate-ping" /> : isLoading ? <Loader2 className="w-8 h-8 text-foreground/80 animate-spin" /> : <Mic className="w-8 h-8 text-foreground/80" />}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card min-h-[100px]">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />{loadingMsg}</div>
              ) : (
                <p className="text-foreground leading-relaxed">{question}</p>
              )}
            </div>
            {isAiTalking && <p className="text-center text-blue-400 text-sm animate-pulse">🔊 {AI_NAME} is speaking…</p>}
            {!isAiTalking && !isLoading && !isScoring && <p className="text-center text-emerald-400 text-sm">🎙️ Your turn — speak your answer</p>}
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-emerald-400">Your Camera</h2>
              <div className="flex gap-2">
                <button type="button" onClick={toggleMic} className={`p-2 rounded-full border transition-colors ${micEnabled ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-400"}`}>
                  {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button type="button" onClick={toggleVideo} className={`p-2 rounded-full border transition-colors ${videoEnabled ? "border-blue-500/50 bg-blue-500/10 text-blue-400" : "border-red-500/50 bg-red-500/10 text-red-400"}`}>
                  {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              </div>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-56 md:h-64 rounded-xl border border-border object-cover bg-black ${videoEnabled ? "" : "opacity-20"}`} />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-muted-foreground">Your Answer (Voice):</p>
                {totalFillers > 0 && <span className="text-xs text-amber-400">{Object.entries(fillerCounts).slice(0, 3).map(([w, c]) => `"${w}" ×${c}`).join(", ")}</span>}
              </div>
              <div className="p-4 rounded-xl border border-border bg-card min-h-[80px] max-h-[120px] overflow-y-auto">
                {transcript ? <p className="text-foreground text-sm leading-relaxed">{transcript}</p> : <span className="text-muted-foreground italic text-sm">{isAiTalking ? "Waiting…" : isLoading ? "Loading…" : "🎙️ Speak now…"}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <div className="mt-5 flex items-center justify-between glass-card rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${!isLoading && !isAiTalking && timer > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Generating…" : isAiTalking ? `${AI_NAME} speaking…` : isScoring ? "Evaluating…" : `Time: ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`}
          </p>
          {isCodingQuestion && !isAiTalking && !isLoading && <span className="text-xs text-violet-400 ml-2">5 min for coding</span>}
        </div>
        <button
          type="button"
          onClick={handleSubmitAnswer}
          disabled={isAiTalking || isLoading || showCameraWarning || isScoring}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${isAiTalking || isLoading || showCameraWarning || isScoring
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105"
            }`}
        >
          <SkipForward className="w-4 h-4" />
          {currentIdx + 1 >= TOTAL ? "Finish Interview" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
