"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, TrendingUp, MessageSquare, AlertTriangle,
  ChevronDown, ChevronUp, ArrowLeft, Target,
  CheckCircle2, XCircle, Lightbulb, Code2, Bot
} from "lucide-react";

const AI_NAME = "Nexus";

function ScoreRing({ score, max = 10, label, color }) {
  const pct = Math.round((score / max) * 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" strokeWidth="6" className="stroke-white/10" />
          <circle
            cx="40" cy="40" r="36" fill="none" strokeWidth="6"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/{max}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2 font-medium">{label}</p>
    </div>
  );
}

export default function InterviewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [expandedQ, setExpandedQ] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("interviewResults") || "[]");
    setResponses(data);
    setLoading(false);

    // Fetch AI-generated summary
    if (data.length > 0) {
      (async () => {
        try {
          const res = await fetch("/api/interview/report-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responses: data, role: "Software Developer" }),
          });
          const result = await res.json();
          setAiSummary(result.summary || "");
        } catch {
          setAiSummary(`${AI_NAME} was unable to generate a summary at this time.`);
        } finally {
          setSummaryLoading(false);
        }
      })();
    } else {
      setSummaryLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-lg">Generating Report…</span>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">No interview data found.</p>
        <button
          onClick={() => router.push("/dashboard/student/interviews")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold"
        >
          Start an Interview
        </button>
      </div>
    );
  }

  const technicalAvg = Math.round(
    responses.reduce((acc, r) => acc + (r.technicalScore || 0), 0) / responses.length
  );
  const communicationAvg = Math.round(
    responses.reduce((acc, r) => acc + (r.communicationScore || 0), 0) / responses.length
  );
  const overallScore = Math.round((technicalAvg + communicationAvg) / 2);

  // Aggregate filler words across all responses
  const allFillerCounts = {};
  responses.forEach((r) => {
    const counts = r.fillerWordCounts || {};
    Object.entries(counts).forEach(([word, count]) => {
      allFillerCounts[word] = (allFillerCounts[word] || 0) + count;
    });
    // Also count from API-returned fillerWords
    (r.fillerWords || []).forEach((w) => {
      const lower = w.toLowerCase();
      allFillerCounts[lower] = (allFillerCounts[lower] || 0) + 1;
    });
  });
  const totalFillers = Object.values(allFillerCounts).reduce((a, b) => a + b, 0);
  const sortedFillers = Object.entries(allFillerCounts).sort((a, b) => b[1] - a[1]);

  // Generate improvement tips based on scores
  const tips = [];
  if (technicalAvg < 5) {
    tips.push("Review core concepts for your target role. Practice explaining technical topics in simple terms.");
    tips.push("Study common interview questions and prepare structured answers using the STAR method.");
  } else if (technicalAvg < 7) {
    tips.push("Good technical foundation! Focus on deepening your knowledge in weaker areas.");
    tips.push("Practice explaining complex concepts with real-world examples from your projects.");
  } else {
    tips.push("Excellent technical skills! Keep practicing to maintain your edge.");
  }

  if (communicationAvg < 5) {
    tips.push("Work on structuring your answers with a clear beginning, middle, and conclusion.");
    tips.push("Practice speaking slowly and clearly. Record yourself to identify areas for improvement.");
  } else if (communicationAvg < 7) {
    tips.push("Your communication is decent. Focus on being more concise and avoiding vague statements.");
  } else {
    tips.push("Great communication skills! You articulate your thoughts well.");
  }

  if (totalFillers > 5) {
    tips.push(`You used ${totalFillers} filler words. Practice pausing silently instead of saying "um" or "uh".`);
    tips.push("Before answering, take a brief moment to organize your thoughts. This reduces filler words naturally.");
  } else if (totalFillers > 0) {
    tips.push("Minimal filler words detected — good job! Keep practicing to eliminate them entirely.");
  }

  const getGrade = (score) => {
    if (score >= 9) return { label: "Excellent", color: "text-emerald-400" };
    if (score >= 7) return { label: "Good", color: "text-blue-400" };
    if (score >= 5) return { label: "Average", color: "text-amber-400" };
    return { label: "Needs Work", color: "text-red-400" };
  };

  const grade = getGrade(overallScore);

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 md:px-6 py-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            {AI_NAME}&apos;s Interview Report
          </h1>
          <p className="text-muted-foreground">
            AI-generated analysis of your {responses.length}-question interview by {AI_NAME}
          </p>
        </div>

        {/* Score Overview */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Overall Grade */}
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-1">Overall Grade</p>
              <p className={`text-5xl font-bold ${grade.color}`}>{overallScore}/10</p>
              <p className={`text-lg font-semibold ${grade.color} mt-1`}>{grade.label}</p>
            </div>

            {/* Score Rings */}
            <div className="flex items-center gap-8">
              <ScoreRing score={technicalAvg} label="Technical" color="#38bdf8" />
              <ScoreRing score={communicationAvg} label="Communication" color="#a78bfa" />
            </div>
          </div>

          {/* Score Bars */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Technical Skills</span>
                <span className="text-blue-400 font-medium">{technicalAvg}/10</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all" style={{ width: `${technicalAvg * 10}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Communication</span>
                <span className="text-violet-400 font-medium">{communicationAvg}/10</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded-full transition-all" style={{ width: `${communicationAvg * 10}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Nexus AI Summary */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{AI_NAME}&apos;s Assessment</h2>
              <p className="text-xs text-muted-foreground">AI-generated performance summary</p>
            </div>
          </div>
          {summaryLoading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-muted-foreground">{AI_NAME} is writing your personalized report…</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {aiSummary.split("\n").filter(Boolean).map((paragraph, i) => (
                <p key={i} className="text-foreground/90 leading-relaxed mb-3 last:mb-0">{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        {/* Filler Words + Grammar — Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filler Words */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">Filler Words</h2>
            </div>
            {totalFillers === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-sm">No filler words detected — excellent clarity!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Total: <span className="text-amber-400 font-semibold">{totalFillers}</span> filler words detected
                </p>
                <div className="space-y-2">
                  {sortedFillers.map(([word, count]) => (
                    <div key={word} className="flex items-center gap-3">
                      <span className="text-sm text-foreground font-medium w-24 truncate">"{word}"</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/60 rounded-full"
                          style={{ width: `${Math.min((count / totalFillers) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grammar Issues */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-foreground">Grammar Notes</h2>
            </div>
            {responses.every((r) => !r.grammarIssues || r.grammarIssues.length === 0) ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-sm">No major grammar issues detected!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {responses
                  .flatMap((r) => r.grammarIssues || [])
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      {g}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* How to Improve */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-foreground">How to Improve</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Question-by-Question Breakdown</h2>

          {responses.map((res, i) => {
            const isExpanded = expandedQ === i;
            return (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : i)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{res.question}</p>
                        {(res.type === "coding" || (res.answer && res.answer.startsWith("[CODE SUBMISSION]"))) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 text-[10px] font-medium flex-shrink-0">
                            <Code2 className="w-2.5 h-2.5" /> Code
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Tech: {res.technicalScore || 0}/10</span>
                        <span>Comm: {res.communicationScore || 0}/10</span>
                        <span className={res.correctness === "Correct" ? "text-emerald-400" : res.correctness === "Partially Correct" ? "text-amber-400" : "text-red-400"}>
                          {res.correctness || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {(res.type === "coding" || (res.answer && res.answer.startsWith("[CODE SUBMISSION]"))) ? "Your Code:" : "Your Answer:"}
                      </p>
                      {(res.type === "coding" || (res.answer && res.answer.startsWith("[CODE SUBMISSION]"))) ? (
                        <pre className="text-sm text-foreground bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto font-mono">
                          <code>{(res.answer || "").replace("[CODE SUBMISSION]", "").trim() || "No code submitted"}</code>
                        </pre>
                      ) : (
                        <p className="text-sm text-foreground bg-white/[0.02] p-3 rounded-lg">
                          {res.answer || "No answer provided"}
                        </p>
                      )}
                    </div>
                    {res.missingPoints && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Missing Points:</p>
                        <p className="text-sm text-amber-300">{Array.isArray(res.missingPoints) ? res.missingPoints.join(", ") : res.missingPoints}</p>
                      </div>
                    )}
                    {res.improvement && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">How to Improve:</p>
                        <p className="text-sm text-emerald-300">{res.improvement}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center pt-4 pb-8">
          <button
            onClick={() => router.push("/dashboard/student/interviews")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interviews
          </button>
        </div>
      </div>
    </div>
  );
}
