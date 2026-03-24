"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Crown, Check, Sparkles, Zap, Brain, Code2, FileText, BarChart3, Mic,
} from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "₹0",
        period: "/forever",
        description: "Perfect for getting started",
        gradient: "from-slate-600 to-slate-700",
        features: [
            "3 AI Mock Interviews/month",
            "Basic question bank",
            "Simple scoring",
            "Resume builder (1 template)",
        ],
        current: true,
    },
    {
        name: "Pro",
        price: "₹499",
        period: "/month",
        description: "For serious job seekers",
        gradient: "from-blue-600 to-violet-600",
        glow: "shadow-[0_0_40px_rgba(99,102,241,0.3)]",
        popular: true,
        features: [
            "Unlimited AI Mock Interviews",
            "Voice-based interviews",
            "Advanced scoring + AI feedback",
            "Full question bank (200+)",
            "Live coding editor",
            "All resume templates",
            "Detailed analytics",
            "Priority support",
        ],
    },
    {
        name: "Enterprise",
        price: "₹1999",
        period: "/month",
        description: "For recruiters and teams",
        gradient: "from-amber-600 to-orange-600",
        features: [
            "Everything in Pro",
            "Automated interview system",
            "Candidate ranking",
            "PDF report generation",
            "Multi-round interviews",
            "Custom question engine",
            "Team collaboration",
            "API access",
        ],
    },
];

export default function UpgradePage() {
    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-sm text-slate-300 mb-4">
                        <Crown className="h-4 w-4 text-amber-400" />
                        <span>Upgrade Your Plan</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white">Unlock Your Full Potential</h1>
                    <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                        Choose the plan that fits your career goals and accelerate your tech journey
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative glass-card rounded-2xl p-6 ${plan.glow || ""} ${plan.popular ? "border-blue-500/30 scale-105" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full text-xs font-semibold text-white">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-500 text-sm">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full py-5 font-semibold rounded-xl border-0 ${plan.current
                                        ? "bg-white/5 text-slate-400 cursor-default"
                                        : `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 shadow-lg`
                                    }`}
                                disabled={plan.current}
                            >
                                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
