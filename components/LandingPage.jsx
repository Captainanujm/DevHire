"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Code2,
  FileText,
  BarChart3,
  Users,
  Mic,
  Shield,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Brain,
    title: "AI Mock Interviews",
    description: "Voice-powered AI interviews that simulate real-world scenarios with instant feedback",
    gradient: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]",
  },
  {
    icon: Code2,
    title: "Live Coding Editor",
    description: "In-browser Monaco editor with real-time code execution and test validation",
    gradient: "from-cyan-500 to-blue-600",
    glow: "group-hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Generate polished, ATS-friendly resumes with AI-powered bullet point optimization",
    gradient: "from-emerald-500 to-teal-600",
    glow: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Track your progress with detailed performance dashboards and trend analysis",
    gradient: "from-amber-500 to-orange-600",
    glow: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]",
  },
  {
    icon: Users,
    title: "Recruiter Tools",
    description: "Schedule interviews, rank candidates, and generate comprehensive reports",
    gradient: "from-pink-500 to-rose-600",
    glow: "group-hover:shadow-[0_0_40px_rgba(236,72,153,0.3)]",
  },
  {
    icon: Mic,
    title: "Voice Analysis",
    description: "Speech-to-text scoring with WPM tracking, filler detection, and confidence metrics",
    gradient: "from-sky-500 to-indigo-600",
    glow: "group-hover:shadow-[0_0_40px_rgba(56,189,248,0.3)]",
  },
];

const stats = [
  { number: "12K+", label: "Developers Upgraded", icon: Users },
  { number: "450+", label: "Companies Hiring", icon: Shield },
  { number: "98%", label: "Success Rate", icon: Zap },
  { number: "50K+", label: "Interviews Conducted", icon: Mic },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Frontend Developer at Google",
    text: "DevHire's AI mock interviews helped me nail my tech interviews. The voice analysis feature pointed out habits I never noticed.",
    avatar: "SC",
  },
  {
    name: "Raj Patel",
    role: "Full Stack Engineer at Meta",
    text: "The coding editor and real-time feedback gave me confidence. I practiced 50+ problems and landed my dream role.",
    avatar: "RP",
  },
  {
    name: "Emily Rodriguez",
    role: "SDE-2 at Amazon",
    text: "The AI resume builder and analytics dashboard transformed my job search. From 2% callback to 40% in just weeks.",
    avatar: "ER",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050510] text-white">
      {/* ====== ANIMATED BACKGROUND ====== */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(56,189,248,0.15),transparent_60%)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent_60%)] blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.08),transparent_70%)] blur-[100px]" />
        {/* Interactive cursor glow */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none transition-all duration-700 ease-out"
          style={{
            left: mousePos.x - 200,
            top: mousePos.y - 200,
            background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-40" />

      {/* ====== NAVBAR ====== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 glass border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <h1 className="text-2xl font-bold text-gradient-blue">DevHire</h1>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ====== HERO SECTION ====== */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-sm text-slate-300 mb-8"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Powered by Google Gemini AI</span>
            <ChevronRight className="h-3 w-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight"
          >
            <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Build Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              Tech Future.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered mock interviews, live coding assessments, resume building, and career analytics — 
            your complete platform for landing the dream developer role.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg rounded-2xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white border-0 shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Start Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-2xl font-medium border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 backdrop-blur-xl hover:scale-105 transition-all shadow-[inset_0_1px_rgba(255,255,255,0.1)]"
              >
                Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Hero visual - Floating UI mock */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            whileHover={{ y: -10, rotateX: 5, rotateY: -5 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0.4 }}
            style={{ perspective: 1000 }}
            className="mt-20 relative mx-auto max-w-4xl cursor-default"
          >
            <div className="glass-card rounded-3xl p-1 glow-blue transform-gpu transition-all duration-300">
              <div className="rounded-[22px] bg-gradient-to-br from-[#0a0f1f]/90 to-[#0d1117]/90 backdrop-blur-xl p-8 border border-white/5 shadow-2xl">
                {/* Mock dashboard header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  <span className="ml-4 text-xs font-medium tracking-wider text-slate-400/80 uppercase">DevHire Active Session</span>
                </div>
                {/* Mock content */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 glass rounded-lg p-6">
                    <div className="text-sm text-slate-500 mb-2">AI Interview in Progress</div>
                    <div className="text-xl font-semibold text-white mb-4">Tell me about your experience with React hooks...</div>
                    <div className="flex gap-3">
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Recording</div>
                      <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">AI Analyzing</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="glass rounded-lg p-4">
                      <div className="text-xs text-slate-500">Score</div>
                      <div className="text-2xl font-bold text-gradient-blue">92/100</div>
                    </div>
                    <div className="glass rounded-lg p-4">
                      <div className="text-xs text-slate-500">Time</div>
                      <div className="text-2xl font-bold text-gradient-purple">14:32</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 glass-card rounded-xl p-3 animate-float">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-slate-300">AI Feedback Ready</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 glass-card rounded-xl p-3 animate-float" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-slate-300">Top 5% Performance</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== STATS SECTION ====== */}
      <section id="stats" className="py-20 px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="glass-card rounded-2xl py-12 px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div key={i} variants={item} className="text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-3 text-blue-400 opacity-60" />
                  <p className="text-3xl md:text-4xl font-bold text-gradient-blue">{stat.number}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====== FEATURES SECTION ====== */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
              A comprehensive platform designed to prepare you for every aspect of the tech hiring process
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                className={`group glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default ${feature.glow}`}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Loved by Developers
            </h2>
            <p className="mt-4 text-slate-500 text-lg">Real stories from engineers who landed their dream roles</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={item} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== CTA SECTION ====== */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden">
            {/* BG glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-blue-500/20 to-transparent blur-[80px]" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Level Up?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of developers who accelerated their careers with DevHire&apos;s AI-powered platform.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-10 py-6 text-lg rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-105 transition-all"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-gradient-blue">DevHire</h2>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <p className="text-sm text-slate-600">© 2026 DevHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
