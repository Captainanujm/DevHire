"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export default function LiveInterview() {
  const params = useSearchParams();
  const router = useRouter();

  const role = params.get("role") || "Full Stack Developer";
  const difficulty = params.get("difficulty") || "Medium";
  const TOTAL = 5;

  // ---------------- STATE ----------------
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(60);
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [mediaError, setMediaError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // ---------------- CAMERA + MIC ----------------
  const startMedia = async () => {
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera/Mic Error:", err);
      setMediaError(
        "Cannot access camera/mic. Allow permissions in your browser and ensure a camera is connected."
      );
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
    track.enabled = !track.enabled;
    setVideoEnabled(track.enabled);
  };

  // ---------------- QUESTION FETCH ----------------
  const fetchQuestion = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          difficulty,
          askedQuestions,
        }),
      });

      if (!res.ok) {
        console.error("Question API status:", res.status);
        throw new Error("Question fetch failed");
      }

      const data = await res.json();

      if (!data.question) throw new Error("Invalid question payload");

      setQuestion(data.question);
      setAskedQuestions((prev) => [...prev, data.question]);
      speakQuestion(data.question);
    } catch (err) {
      console.error("Failed to fetch question:", err);

      const fallback = `Tell me about your experience with ${role}.`;
      setQuestion(fallback);
      setAskedQuestions((prev) => [...prev, fallback]);
      speakQuestion(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- TTS ----------------
  const speakQuestion = (text) => {
    try {
      window.speechSynthesis.cancel();
    } catch {}

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;

    utter.onstart = () => {
      setIsAiTalking(true);
      setTranscript("");
    };

    utter.onend = () => {
      setIsAiTalking(false);
      startListening();
      startTimer();
    };

    window.speechSynthesis.speak(utter);
  };

  // ---------------- SPEECH RECOGNITION ----------------
  const startListening = () => {
    if (!micEnabled) return;

    const Recognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!Recognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (e) => {
        if (isAiTalking) return;

        let finalText = "";
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalText += e.results[i][0].transcript;
          }
        }
        if (finalText.trim()) {
          setTranscript((prev) => prev + finalText + " ");
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
      };

      recognition.onend = () => {
        // restart only if user still speaking and mic on
        if (!isAiTalking && micEnabled) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition failed:", err);
    }
  };

  // ---------------- TIMER ----------------
  const startTimer = () => {
    clearInterval(timerRef.current);
    let t = 60;
    setTimer(t);

    timerRef.current = setInterval(() => {
      t -= 1;
      setTimer(t);

      // if user already spoke enough, stop timer
      if (t > 0 && transcript.length > 8) return;

      if (t <= 0) {
        clearInterval(timerRef.current);
        handleNext(transcript.length < 8);
      }
    }, 1000);
  };

  // ---------------- NEXT QUESTION + SCORE ----------------
  const handleNext = async (skipped = false) => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);

    const answer = skipped ? "" : transcript;

    try {
      const res = await fetch("/api/interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, role }),
      });

      let scoreData = {};
      try {
        scoreData = await res.json();
      } catch {
        scoreData = {};
      }

      const results = JSON.parse(
        localStorage.getItem("interviewResults") || "[]"
      );
      results.push({
        question,
        answer: answer || "No answer",
        ...scoreData,
      });
      localStorage.setItem("interviewResults", JSON.stringify(results));
    } catch (err) {
      console.error("Score API error:", err);
    }

    if (index + 1 >= TOTAL) {
      router.push("/dashboard/student/interviews/report");
      return;
    }

    setIndex((prev) => prev + 1);
    setTranscript("");
    fetchQuestion();
  };

  // ---------------- MOUNT / UNMOUNT ----------------
  useEffect(() => {
    localStorage.removeItem("interviewResults");
    startMedia();
    fetchQuestion();

    return () => {
      recognitionRef.current?.stop();
      try {
        window.speechSynthesis.cancel();
      } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- UI ----------------
  return (
    <div className="pt-24 px-6 min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Question {index + 1} / {TOTAL}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: AI INTERVIEWER */}
        <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-semibold text-sky-300 mb-3">
            AI Interviewer
          </h2>

          <div className="flex justify-center mb-6">
            <div
              className={`w-28 h-28 rounded-full bg-gradient-to-br 
              from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg
              ${isAiTalking ? "animate-pulse" : ""}`}
            >
              {isAiTalking && (
                <div className="w-20 h-20 bg-white/20 rounded-full animate-ping" />
              )}
            </div>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/10 min-h-[100px]">
            {isLoading ? (
              <span className="text-slate-400">Generating…</span>
            ) : (
              question
            )}
          </div>

          {isAiTalking && (
            <p className="mt-2 text-center text-sky-400 text-sm animate-pulse">
              AI is speaking…
            </p>
          )}
        </div>

        {/* RIGHT: USER VIDEO */}
        <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex justify-between mb-3">
            <h2 className="text-lg font-semibold text-emerald-300">
              Your Video
            </h2>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2 rounded-full border ${
                  micEnabled
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-red-500 bg-red-500/20"
                }`}
              >
                {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-2 rounded-full border ${
                  videoEnabled
                    ? "border-sky-500 bg-sky-500/20"
                    : "border-red-500 bg-red-500/20"
                }`}
              >
                {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-64 rounded-xl border border-white/10 object-cover ${
                videoEnabled ? "" : "opacity-30"
              }`}
            />
            {mediaError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl text-center px-4 text-sm text-red-300">
                {mediaError}
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-sm text-slate-400 mb-1">Your Answer:</p>

            <div className="p-4 bg-black/30 rounded-xl border border-white/10 min-h-[80px]">
              {transcript ? (
                transcript
              ) : (
                <span className="text-slate-500 italic">
                  {isAiTalking ? "Waiting for AI…" : "Listening…"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEXT BUTTON + TIMER */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => handleNext(false)}
          disabled={isAiTalking || isLoading}
          className={`px-6 py-3 rounded-xl ${
            isAiTalking || isLoading
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          Next →
        </button>

        <p className="text-slate-400 text-sm">Auto skip in: {timer}s</p>
      </div>
    </div>
  );
}
