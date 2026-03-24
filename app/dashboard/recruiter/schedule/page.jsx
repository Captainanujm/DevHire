"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calendar, Clock, User, Mail, Plus, CheckCircle, XCircle, Search,
} from "lucide-react";

export default function SchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        candidateEmail: "",
        date: "",
        time: "",
        role: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    async function createSchedule() {
        if (!form.candidateEmail || !form.date || !form.time) return;
        setLoading(true);
        try {
            const res = await fetch("/api/recruiter/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            });
            if (res.ok) {
                setSuccess("Interview scheduled successfully!");
                setShowForm(false);
                setForm({ candidateEmail: "", date: "", time: "", role: "", notes: "" });
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch { }
        setLoading(false);
    }

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-violet-400" />
                            Interview Schedule
                        </h1>
                        <p className="text-slate-400 mt-2">Schedule and manage candidate interviews</p>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Interview
                    </Button>
                </div>

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {success}
                    </motion.div>
                )}

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="glass-card rounded-2xl p-6 mb-8"
                    >
                        <h3 className="text-white font-semibold mb-4">Schedule New Interview</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-300 text-sm mb-1.5 block">Candidate Email</Label>
                                <Input
                                    type="email"
                                    placeholder="candidate@email.com"
                                    value={form.candidateEmail}
                                    onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 text-sm mb-1.5 block">Role</Label>
                                <Input
                                    placeholder="e.g. React Developer"
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 text-sm mb-1.5 block">Date</Label>
                                <Input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white h-11"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 text-sm mb-1.5 block">Time</Label>
                                <Input
                                    type="time"
                                    value={form.time}
                                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white h-11"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label className="text-slate-300 text-sm mb-1.5 block">Notes (optional)</Label>
                            <Input
                                placeholder="Additional notes..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={createSchedule}
                                disabled={loading}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                            >
                                {loading ? "Scheduling..." : "Confirm Schedule"}
                            </Button>
                            <Button onClick={() => setShowForm(false)} variant="ghost" className="text-slate-400">
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Calendar placeholder */}
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-6">Upcoming Interviews</h3>
                    <div className="text-center py-12 text-slate-500 text-sm">
                        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No scheduled interviews</p>
                        <p className="text-xs mt-1">Click &quot;Schedule Interview&quot; to get started</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
