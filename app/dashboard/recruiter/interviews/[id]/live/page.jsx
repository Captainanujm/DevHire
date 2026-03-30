"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Loader2, AlertTriangle, ArrowLeft, Video,
    Users, Clock, UserCircle, Bot, XCircle
} from "lucide-react";
import Link from "next/link";

export default function RecruiterLiveObservationPage() {
    const { id } = useParams();
    const router = useRouter();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [callStarted, setCallStarted] = useState(false);
    const [askingQuestion, setAskingQuestion] = useState(false);
    const [aiVisible, setAiVisible] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const socketRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        fetchInterviewDetails();
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (peerRef.current) peerRef.current.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
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

    const triggerAiQuestion = async () => {
        if (!interview || !socketRef.current) return;
        setAskingQuestion(true);
        try {
            let qs = window.cachedQuestions;
            if (!qs) {
                const res = await fetch(`/api/recruiter/practice-questions?role=${encodeURIComponent(interview.jobRole)}`, { credentials: "include" });
                const data = await res.json();
                qs = data.questions || [];
                
                if (qs.length === 0) {
                    qs = [
                        { question: `Can you explain your experience with the skills required for the ${interview.jobRole} role?` },
                        { question: `Tell me about a challenging bug you faced recently and how you resolved it.` },
                        { question: `How do you handle working under tight deadlines?` },
                        { question: `Describe your approach to learning new technologies.` }
                    ];
                }

                window.cachedQuestions = qs;
            }
            if (qs.length > 0) {
                const randomQ = qs[Math.floor(Math.random() * qs.length)].question;
                socketRef.current.emit("trigger-ai-question", { roomId: interview.slug, question: randomQ });
                setAiVisible(true);
            }
        } catch (e) {
            console.error(e);
        }
        setAskingQuestion(false);
    };

    const stopAiQuestion = () => {
        if (socketRef.current && interview) {
            socketRef.current.emit("hide-ai-question", { roomId: interview.slug });
            setAiVisible(false);
        }
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            setCallStarted(true);

            // Using setTimeout is a small hack to ensure DOM elements have rendered
            // after setCallStarted(true) before we attach srcObject.
            setTimeout(() => {
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            }, 100);
            
            const socket = io("http://localhost:3001");
            socketRef.current = socket;
            
            socket.emit("join-room", interview.slug);
            
            const peer = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:global.stun.twilio.com:3478" }
                ]
            });
            peerRef.current = peer;
            
            stream.getTracks().forEach(t => peer.addTrack(t, stream));
            
            peer.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
            
            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", { roomId: interview.slug, candidate: event.candidate, sender: "recruiter" });
                }
            };
            
            peer.onnegotiationneeded = async () => {
                 const offer = await peer.createOffer();
                 await peer.setLocalDescription(offer);
                 socket.emit("offer", { roomId: interview.slug, offer, sender: "recruiter" });
            };
            
            socket.on("answer", async (payload) => {
                 if (payload.sender === "candidate") {
                     await peer.setRemoteDescription(new RTCSessionDescription(payload.answer));
                 }
            });
            
            socket.on("ice-candidate", async (payload) => {
                 if (payload.sender === "candidate" && payload.candidate) {
                     try {
                         if (peer.remoteDescription) {
                             await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
                         }
                     } catch(e) {}
                 }
            });

            socket.on("user-connected", async () => {
                 // Regenerate offer when candidate joins the room
                 try {
                     const offer = await peer.createOffer();
                     await peer.setLocalDescription(offer);
                     socket.emit("offer", { roomId: interview.slug, offer, sender: "recruiter" });
                 } catch (e) {}
            });
            
        } catch (err) {
            setError("Failed to access camera for calling. Please ensure device permissions are granted.");
        }
    };

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

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 glass-card rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.1)] relative">
                {!callStarted ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <Video className="w-16 h-16 text-purple-500 mx-auto mb-6 opacity-80" />
                        <h2 className="text-3xl font-bold mb-4 text-foreground">Launch Interview</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm">When you and the candidate are both ready, click start below to initiate the secure WebRTC video link.</p>
                        <button onClick={startCall} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-purple-500/30">Connect to Room</button>
                    </div>
                ) : (
                    <div className="w-full h-full relative group">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-black" />
                        
                        {/* Remote Stream UI overlays */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur border border-white/10 px-6 py-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            {!aiVisible ? (
                                <button onClick={triggerAiQuestion} disabled={askingQuestion} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    {askingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                    Trigger AI Question
                                </button>
                            ) : (
                                <button onClick={stopAiQuestion} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-red-500/20">
                                    <XCircle className="w-4 h-4" />
                                    Dismiss AI
                                </button>
                            )}
                        </div>
                        
                        <div className="absolute top-6 right-6 w-64 aspect-video border-2 border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-black transition-transform duration-300 hover:scale-105 hover:border-purple-500/80">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
