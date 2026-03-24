"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, GraduationCap, Star, Eye } from "lucide-react";

export default function CandidatesPage() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            try {
                const res = await fetch("/api/recruiter/students", { credentials: "include" });
                if (res.ok) setStudents(await res.json());
            } catch { }
            setLoading(false);
        }
        fetchStudents();
    }, []);

    const filtered = students.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-400" />
                            Candidates
                        </h1>
                        <p className="text-slate-400 mt-2">Browse and select candidates for interviews</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
                    />
                </div>

                {/* Students Grid */}
                {loading ? (
                    <div className="text-center py-16 text-slate-400">Loading candidates...</div>
                ) : filtered.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((student, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card rounded-xl p-5 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                        {student.name?.[0] || "U"}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{student.name}</p>
                                        <p className="text-slate-500 text-xs">{student.email}</p>
                                    </div>
                                </div>

                                {student.profile?.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {student.profile.skills.slice(0, 4).map((s, j) => (
                                            <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                                                {s}
                                            </span>
                                        ))}
                                        {student.profile.skills.length > 4 && (
                                            <span className="text-xs text-slate-500">+{student.profile.skills.length - 4}</span>
                                        )}
                                    </div>
                                )}

                                <Button
                                    size="sm"
                                    className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20"
                                >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Profile
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No candidates found</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
