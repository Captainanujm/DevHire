"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroDevHire() {
  return (
    <section className="relative w-full h-screen overflow-hidden 
      bg-[#070b16] text-white flex items-center justify-center select-none">

      {/* ==== MULTI-LAYER PREMIUM BACKGROUND ==== */}
      <div className="absolute inset-0 bg-gradient-to-br 
        from-[#0a0f1f] via-[#0c1124] to-[#060912]" />

      {/* Ambient Glow Left */}
      <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] 
        bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_70%)]
        blur-[180px] opacity-70" />

      {/* Ambient Glow Right (Purple Tint for Contrast) */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] 
        bg-[radial-gradient(circle,rgba(139,92,246,0.25),transparent_70%)]
        blur-[200px] opacity-70" />

      {/* Mid-Center Vignette Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] 
        bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)]
        blur-[160px] opacity-80" />

      {/* TOP EDGE LIGHT */}
      <div className="absolute top-0 w-full h-[140px] 
        bg-gradient-to-b from-sky-300/10 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">

        {/* TITLE */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight 
          bg-gradient-to-br from-sky-300 via-blue-200 to-indigo-300
          text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(59,130,246,0.35)]">
          Build Your Tech Future.
        </h1>

        {/* SUBTITLE */}
        <p className="mt-5 text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed">
          AI-powered hiring, mock interviews, and career acceleration — designed
          for the next generation of developers. Experience <span className="text-sky-300 font-medium">voice-based AI interview simulation</span> that feels real.
        </p>

        {/* CTA BUTTONS */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          
          {/* Primary CTA – Upgraded with neon aura */}
          <Button className="px-8 py-6 text-lg rounded-xl font-semibold
            bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 
            hover:opacity-95 transition-all hover:scale-105
            shadow-[0_0_30px_rgba(59,130,246,0.45)]
            hover:shadow-[0_0_50px_rgba(99,102,241,0.55)]">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Secondary CTA – Glassy */}
          <Button
            variant="outline"
            className="px-8 py-6 text-lg rounded-xl font-medium
              border-slate-600/60 bg-white/5 text-slate-200 
              hover:bg-white/10 backdrop-blur-xl hover:scale-105 transition
              shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            Learn More
          </Button>
        </div>

        {/* ==== PREMIUM STATS BAR ==== */}
        <div className="mt-16 w-full rounded-2xl bg-white/5 border border-white/10 
          backdrop-blur-xl py-10 shadow-[0_0_35px_rgba(255,255,255,0.04)]">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">

            <Stat number="12k+" label="Developers Upgraded" glow="from-sky-300 to-blue-300" />
            <Stat number="450+" label="Companies Hiring" glow="from-blue-300 to-indigo-300" />
            <Stat number="98%" label="Success Rate" glow="from-indigo-300 to-purple-300" />

          </div>
        </div>

      </div>
    </section>
  );
}

function Stat({ number, label, glow }) {
  return (
    <div className="flex flex-col items-center">
      <p className={`text-4xl font-bold bg-gradient-to-r ${glow} 
        text-transparent bg-clip-text drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]`}>
        {number}
      </p>
      <p className="text-slate-400 mt-2 text-sm tracking-wide">{label}</p>
    </div>
  );
}
