"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, Code2, BookOpen, Plus, Pencil, Trash2,
    Loader2, CheckCircle2, XCircle, ChevronDown, X, Tag,
} from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const ROLES = [
    "Full Stack Developer", "React Developer", ".NET Developer",
    "JavaScript Developer", "Android Developer", "Data Science",
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function Badge({ diff }) {
    const cls = diff === "Easy"
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : diff === "Medium"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-red-500/10 text-red-400 border-red-500/20";
    return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{diff}</span>;
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

// ─────────────────── CODING PROBLEMS ───────────────────
function CodingProblemsTab() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const emptyForm = { title: "", difficulty: "Easy", description: "", example: "", tags: "" };
    const [form, setForm] = useState(emptyForm);

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function fetchProblems() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/coding-problems", { credentials: "include" });
            const data = await res.json();
            setProblems(data.problems || []);
        } catch {
            showToast("Failed to load problems", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProblems(); }, []);

    function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true); }
    function openEdit(p) {
        setEditing(p);
        setForm({
            title: p.title, difficulty: p.difficulty,
            description: p.description, example: p.example || "",
            tags: (p.tags || []).join(", "),
        });
        setShowModal(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            const body = {
                ...form,
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
            };
            const url = editing ? `/api/admin/coding-problems/${editing._id}` : "/api/admin/coding-problems";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, {
                method, credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Failed");
            showToast(editing ? "Problem updated!" : "Problem added!");
            setShowModal(false);
            fetchProblems();
        } catch {
            showToast("Failed to save", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this problem?")) return;
        try {
            await fetch(`/api/admin/coding-problems/${id}`, { method: "DELETE", credentials: "include" });
            showToast("Deleted!");
            fetchProblems();
        } catch {
            showToast("Failed to delete", "error");
        }
    }

    return (
        <div>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${toast.type === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
                <p className="text-slate-400 text-sm">{problems.length} problem{problems.length !== 1 ? "s" : ""} in database</p>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4" /> Add Problem
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
            ) : problems.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Code2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No coding problems yet</p>
                    <p className="text-slate-600 text-sm mt-1">Add your first problem to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {problems.map(p => (
                        <motion.div key={p._id} layout className="glass-card rounded-xl p-4 flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-white font-semibold">{p.title}</span>
                                    <Badge diff={p.difficulty} />
                                    {!p.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Inactive</span>}
                                </div>
                                <p className="text-slate-400 text-sm line-clamp-2">{p.description}</p>
                                {p.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {p.tags.map(t => (
                                            <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                                                <Tag className="h-2.5 w-2.5" />{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <Modal title={editing ? "Edit Problem" : "Add Coding Problem"} onClose={() => setShowModal(false)}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Two Sum" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Difficulty *</label>
                                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
                                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Description *</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={4} placeholder="Describe the problem..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Example / Test Case</label>
                                <textarea value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))}
                                    rows={3} placeholder="Input: nums = [2,7], target = 9&#10;Output: [0,1]" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none font-mono" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Tags (comma-separated)</label>
                                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                    placeholder="array, hash-map, two-pointers" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.title || !form.description}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editing ? "Update" : "Add Problem"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────── PRACTICE QUESTIONS ───────────────────
function PracticeQuestionsTab() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [filterRole, setFilterRole] = useState("All");
    const [filterDiff, setFilterDiff] = useState("All");

    const emptyForm = { role: ROLES[0], difficulty: "Easy", question: "", sampleAnswer: "" };
    const [form, setForm] = useState(emptyForm);

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function fetchQuestions() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/practice-questions", { credentials: "include" });
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch {
            showToast("Failed to load questions", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchQuestions(); }, []);

    function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true); }
    function openEdit(q) {
        setEditing(q);
        setForm({ role: q.role, difficulty: q.difficulty, question: q.question, sampleAnswer: q.sampleAnswer || "" });
        setShowModal(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            const url = editing ? `/api/admin/practice-questions/${editing._id}` : "/api/admin/practice-questions";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, {
                method, credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed");
            showToast(editing ? "Question updated!" : "Question added!");
            setShowModal(false);
            fetchQuestions();
        } catch {
            showToast("Failed to save", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this question?")) return;
        try {
            await fetch(`/api/admin/practice-questions/${id}`, { method: "DELETE", credentials: "include" });
            showToast("Deleted!");
            fetchQuestions();
        } catch {
            showToast("Failed to delete", "error");
        }
    }

    const filtered = questions.filter(q =>
        (filterRole === "All" || q.role === filterRole) &&
        (filterDiff === "All" || q.difficulty === filterDiff)
    );

    return (
        <div>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${toast.type === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none">
                        <option value="All">All Roles</option>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none">
                        <option value="All">All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <span className="px-3 py-1.5 text-xs text-slate-500 self-center">{filtered.length} question{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4" /> Add Question
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No practice questions found</p>
                    <p className="text-slate-600 text-sm mt-1">Add questions or change your filter</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(q => (
                        <motion.div key={q._id} layout className="glass-card rounded-xl p-4 flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{q.role}</span>
                                    <Badge diff={q.difficulty} />
                                    {!q.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Inactive</span>}
                                </div>
                                <p className="text-white text-sm mt-1">{q.question}</p>
                                {q.sampleAnswer && (
                                    <p className="text-slate-500 text-xs mt-1.5 line-clamp-1">
                                        Sample: {q.sampleAnswer}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => openEdit(q)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(q._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <Modal title={editing ? "Edit Question" : "Add Practice Question"} onClose={() => setShowModal(false)}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Role *</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50">
                                    {ROLES.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Difficulty *</label>
                                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50">
                                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Question *</label>
                                <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                                    rows={3} placeholder="Enter the interview question..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Sample Answer (optional)</label>
                                <textarea value={form.sampleAnswer} onChange={e => setForm(f => ({ ...f, sampleAnswer: e.target.value }))}
                                    rows={4} placeholder="A good answer would explain..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.question}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editing ? "Update" : "Add Question"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────── MAIN PAGE ───────────────────
export default function AdminPage() {
    const [tab, setTab] = useState("coding");

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
                            <ShieldCheck className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
                            <p className="text-slate-400 text-sm">Manage DevHire question banks and content</p>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Coding Problems", icon: Code2, color: "text-blue-400", bg: "from-blue-600/10 to-blue-600/5", border: "border-blue-500/20" },
                        { label: "Practice Questions", icon: BookOpen, color: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20" },
                        { label: "Question Bank", icon: ShieldCheck, color: "text-violet-400", bg: "from-violet-600/10 to-violet-600/5", border: "border-violet-500/20" },
                    ].map(({ label, icon: Icon, color, bg, border }) => (
                        <motion.div key={label} variants={item} whileHover={{ scale: 1.02, y: -2 }} className={`glass-card rounded-xl p-4 bg-gradient-to-br ${bg} border ${border} cursor-default transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]`}>
                            <Icon className={`h-5 w-5 ${color} mb-2`} />
                            <p className="text-white font-semibold text-sm">{label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">Manage from here</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 glass-card rounded-xl p-1 mb-6 w-fit">
                    {[
                        { id: "coding", label: "Coding Problems", icon: Code2 },
                        { id: "practice", label: "Practice Questions", icon: BookOpen },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id
                                ? "bg-gradient-to-r from-blue-600/30 to-violet-600/30 text-white border border-white/10"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        {tab === "coding" ? <CodingProblemsTab /> : <PracticeQuestionsTab />}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
