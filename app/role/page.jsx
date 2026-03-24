"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GraduationCap, Briefcase, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    id: "student",
    label: "Student / Job Seeker",
    description: "Practice interviews, build your resume, and track your progress",
    icon: GraduationCap,
    gradient: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.3)",
    features: ["AI Mock Interviews", "Live Coding Practice", "Resume Builder", "Analytics Dashboard"],
  },
  {
    id: "recruiter",
    label: "Recruiter / Employer",
    description: "Find top talent, schedule interviews, and evaluate candidates",
    icon: Briefcase,
    gradient: "from-violet-500 to-purple-500",
    glow: "rgba(139,92,246,0.3)",
    features: ["Candidate Search", "Automated Interviews", "Ranking System", "Report Generation"],
  },
  {
    id: "admin",
    label: "Platform Admin",
    description: "Manage practice questions, coding problems, and monitor platform health",
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.3)",
    features: ["Add Coding Problems", "Manage Practice Questions", "System Analytics", "User Moderation"],
  },
];

export default function Role() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => {
        if (data.user?.email) setUserEmail(data.user.email);
      })
      .catch(console.error);
  }, []);

  async function proceed() {
    if (!role) return;
    try {
      setLoading(true);
      const res = await fetch("/api/auth/set-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return;
      localStorage.setItem("role", role);
      router.push("/profile");
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(56,189,248,0.1),transparent_60%)] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_60%)] blur-[100px]" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <span className="text-2xl font-bold text-gradient-blue">DevHire</span>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Choose Your Path</h1>
          <p className="text-muted-foreground mt-2">Select the role that best describes you</p>
        </div>

        {/* Role Cards */}
        <div className={`grid gap-6 mb-8 ${userEmail === "captainanuj2004@gmail.com" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {(userEmail === "captainanuj2004@gmail.com" ? roles : roles.filter(r => r.id !== "admin")).map((r) => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole(r.id)}
              className={`relative cursor-pointer rounded-2xl transition-all duration-300 ${role === r.id
                ? "ring-2 ring-blue-500/50"
                : ""
                }`}
              style={{
                boxShadow: role === r.id ? `0 0 40px ${r.glow}` : "none",
              }}
            >
              <div className={`glass-card rounded-2xl p-6 h-full ${role === r.id ? "border-blue-500/30" : ""}`}>
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${r.gradient} mb-4`}>
                  <r.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-1">{r.label}</h3>
                <p className="text-muted-foreground text-sm mb-4">{r.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {r.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${r.gradient}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Selected indicator */}
                {role === r.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={proceed}
            disabled={!role || loading}
            className="px-8 py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Continue
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
