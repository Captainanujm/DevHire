"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { INTERVIEW_ROLES, INTERVIEW_DIFFICULTIES } from "@/lib/interviewQuestions";
import { Play, ShieldCheck } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const handleStart = () => {
    if (!selectedRole || !selectedDifficulty) return;
    const params = new URLSearchParams({
      role: selectedRole,
      difficulty: selectedDifficulty,
    });
    router.push(`/dashboard/student/interviews/live?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
              AI Mock Interviews
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-300 max-w-2xl">
              Choose your target role and difficulty. DevHire’s AI will conduct a{" "}
              <span className="font-medium text-sky-300">15-question voice interview</span> and generate a report at the end.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 backdrop-blur">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200">Real-world role based questions</span>
          </div>
        </div>

        {/* Role selection */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-100">Select a role</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INTERVIEW_ROLES.map((role) => {
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-200
                    ${isActive
                      ? "border-sky-400/80 bg-slate-900/80 shadow-[0_0_25px_rgba(56,189,248,0.35)]"
                      : "border-slate-700/60 bg-slate-900/60 hover:border-sky-400/50 hover:bg-slate-900"
                    }`}
                >
                  <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative z-[1] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm md:text-base text-slate-50">
                        {role}
                      </p>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300">
                      Practice real interview-style questions tailored to {role}.
                    </p>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 text-sky-300 px-2.5 py-1 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-pulse" />
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Difficulty selection */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-slate-100">Select difficulty</h2>
          <div className="flex flex-wrap gap-3">
            {INTERVIEW_DIFFICULTIES.map((level) => {
              const isActive = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all border
                    ${isActive
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.3)]"
                      : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-emerald-400/60 hover:bg-slate-900"
                    }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            Easy – basic fundamentals & HR questions • Medium – more scenario-based • Hard – system design & in-depth concepts.
          </p>
        </section>

        {/* Start button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="text-xs md:text-sm text-slate-400">
            <span className="font-semibold text-slate-200">
              Flow:
            </span>{" "}
            Role → Difficulty → Live voice interview (15 questions) → Auto-generated report.
          </div>
          <button
            onClick={handleStart}
            disabled={!selectedRole || !selectedDifficulty}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all
              ${!selectedRole || !selectedDifficulty
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 text-slate-950 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40"
              }`}
          >
            <Play className="w-4 h-4" />
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
