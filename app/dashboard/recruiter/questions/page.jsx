"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ClipboardList, Plus, Trash2, Save, Brain, Sparkles,
} from "lucide-react";

export default function QuestionsBuilder() {
    const [questions, setQuestions] = useState([
        { id: 1, text: "", difficulty: "Medium", role: "" },
    ]);
    const [saving, setSaving] = useState(false);

    function addQuestion() {
        setQuestions([...questions, { id: Date.now(), text: "", difficulty: "Medium", role: "" }]);
    }

    function removeQuestion(id) {
        setQuestions(questions.filter((q) => q.id !== id));
    }

    function updateQuestion(id, field, value) {
        setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
    }

    async function saveQuestions() {
        setSaving(true);
        try {
            await fetch("/api/recruiter/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions }),
                credentials: "include",
            });
        } catch { }
        setSaving(false);
    }

    async function generateAI() {
        try {
            const res = await fetch("/api/interview/question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "Full Stack Developer", difficulty: "Medium" }),
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                if (data.question) {
                    setQuestions([...questions, { id: Date.now(), text: data.question, difficulty: "Medium", role: "Full Stack Developer" }]);
                }
            }
        } catch { }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ClipboardList className="h-8 w-8 text-emerald-400" />
                            Question Builder
                        </h1>
                        <p className="text-slate-400 mt-2">Create custom interview questions</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={generateAI} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
                            <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
                            AI Generate
                        </Button>
                        <Button onClick={saveQuestions} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save All"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-xl p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-400 font-medium">Question {i + 1}</span>
                                {questions.length > 1 && (
                                    <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <Textarea
                                placeholder="Enter your interview question..."
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 mb-3 min-h-[80px]"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-slate-400 text-xs mb-1 block">Role</Label>
                                    <Input
                                        placeholder="e.g. React Developer"
                                        value={q.role}
                                        onChange={(e) => updateQuestion(q.id, "role", e.target.value)}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-9 text-sm"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400 text-xs mb-1 block">Difficulty</Label>
                                    <select
                                        value={q.difficulty}
                                        onChange={(e) => updateQuestion(q.id, "difficulty", e.target.value)}
                                        className="w-full h-9 rounded-md bg-white/5 border border-white/10 text-white text-sm px-2"
                                    >
                                        <option value="Easy" className="bg-[#0a0e1a]">Easy</option>
                                        <option value="Medium" className="bg-[#0a0e1a]">Medium</option>
                                        <option value="Hard" className="bg-[#0a0e1a]">Hard</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Button onClick={addQuestion} variant="outline" className="w-full mt-4 border-dashed border-white/10 text-slate-400 hover:text-white hover:bg-white/5">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                </Button>
            </motion.div>
        </div>
    );
}
