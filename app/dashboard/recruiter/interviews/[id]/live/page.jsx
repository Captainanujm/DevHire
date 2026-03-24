"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2, AlertTriangle, ArrowLeft, Video,
    Users, Clock, UserCircle
} from "lucide-react";
import Link from "next/link";

export default function RecruiterLiveObservationPage() {
    const { id } = useParams();
    const router = useRouter();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviewDetails();
    }, [id]);

    async function fetchInterviewDetails() {
        try {
            const res = await fetch(`/api/recruiter/interviews/${id}`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setInterview(data.interview);
            
            if (data.interview.interviewType !== "Manual" || !data.interview.dailyRoomUrl) {
                setError("This interview is not configured for Live Observation.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <Link href={`/dashboard/recruiter/interviews/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Interview
                </Link>
                <div className="glass-card rounded-2xl p-12 text-center border-red-500/10">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4 opacity-80" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Observation Unavailable</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 shrink-0 flex items-center justify-between">
                <div>
                    <Link href={`/dashboard/recruiter/interviews/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-3 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Details
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Video className="h-6 w-6 text-purple-500" />
                        Live Observation Room
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Discreetly observe the candidate's live interview session.
                    </p>
                </div>
                
                <div className="hidden sm:block text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">Target Candidate</span>
                        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                            <UserCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-foreground">{interview?.targetCandidate?.email || "Unknown"}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 glass-card rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
                <iframe
                    className="w-full h-full border-0 bg-black"
                    src={`${interview.dailyRoomUrl}?join=1`}
                    allow="camera; microphone; fullscreen; display-capture"
                ></iframe>
            </motion.div>
        </div>
    );
}
