"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, Code2, BookOpen, Plus, Pencil, Trash2,
    Loader2, CheckCircle2, XCircle, X, Tag, Briefcase,
    Users, Hash, Eye, EyeOff, ChevronDown, ChevronUp,
    ToggleLeft, ToggleRight, Search, Filter,
} from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

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
    return <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${cls}`}>{diff}</span>;
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
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

function Toast({ toast }) {
    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    className={`fixed top-6 right-6 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium backdrop-blur-sm ${toast.type === "success"
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/20 border-red-500/30 text-red-400"
                        }`}
                >
                    {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {toast.msg}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─────────────────── ROLES MANAGEMENT ───────────────────
function RolesTab() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ name: "" });

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function fetchRoles() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/roles", { credentials: "include" });
            const data = await res.json();
            setRoles(data.roles || []);
        } catch {
            showToast("Failed to load roles", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchRoles(); }, []);

    function openAdd() { setEditing(null); setForm({ name: "" }); setShowModal(true); }
    function openEdit(r) {
        setEditing(r);
        setForm({ name: r.name });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const url = editing ? `/api/admin/roles/${editing._id}` : "/api/admin/roles";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, {
                method, credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed");
            }
            showToast(editing ? "Role updated!" : "Role added!");
            setShowModal(false);
            fetchRoles();
        } catch (err) {
            showToast(err.message || "Failed to save", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this role? This cannot be undone.")) return;
        try {
            await fetch(`/api/admin/roles/${id}`, { method: "DELETE", credentials: "include" });
            showToast("Role deleted!");
            fetchRoles();
        } catch {
            showToast("Failed to delete", "error");
        }
    }

    async function handleToggle(role) {
        try {
            await fetch(`/api/admin/roles/${role._id}`, {
                method: "PUT", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !role.isActive }),
            });
            showToast(role.isActive ? "Role deactivated" : "Role activated");
            fetchRoles();
        } catch {
            showToast("Failed to update", "error");
        }
    }

    return (
        <div>
            <Toast toast={toast} />

            <div className="flex items-center justify-between mb-6">
                <p className="text-slate-400 text-sm">{roles.length} role{roles.length !== 1 ? "s" : ""} configured</p>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
                    <Plus className="h-4 w-4" /> Add Role
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
            ) : roles.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No roles defined yet</p>
                    <p className="text-slate-600 text-sm mt-1">Add roles like "Full Stack Developer", "Data Science", etc.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map(r => (
                        <motion.div key={r._id} layout
                            className="glass-card rounded-xl p-4 flex items-center justify-between gap-3 group hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg ${r.isActive ? "bg-emerald-500/10" : "bg-slate-700/30"} transition-colors`}>
                                    <Briefcase className={`h-4 w-4 ${r.isActive ? "text-emerald-400" : "text-slate-500"}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`font-semibold text-sm truncate ${r.isActive ? "text-white" : "text-slate-500 line-through"}`}>{r.name}</p>
                                    <p className="text-xs text-slate-600">{r.isActive ? "Active" : "Inactive"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleToggle(r)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                    title={r.isActive ? "Deactivate" : "Activate"}>
                                    {r.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                </button>
                                <button onClick={() => openEdit(r)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors">
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDelete(r._id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <Modal title={editing ? "Edit Role" : "Add New Role"} onClose={() => setShowModal(false)}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block">Role Name *</label>
                                <input value={form.name} onChange={e => setForm({ name: e.target.value })}
                                    onKeyDown={e => e.key === "Enter" && handleSave()}
                                    placeholder="e.g. Full Stack Developer"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.name.trim()}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editing ? "Update" : "Add Role"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────── CODING PROBLEMS WITH TEST CASES ───────────────────
function CodingProblemsTab() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const emptyForm = {
        title: "", difficulty: "Easy", description: "", example: "", tags: "",
        testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    };
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

    function openAdd() {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    }

    function openEdit(p) {
        setEditing(p);
        setForm({
            title: p.title,
            difficulty: p.difficulty,
            description: p.description,
            example: p.example || "",
            tags: (p.tags || []).join(", "),
            testCases: p.testCases?.length > 0
                ? p.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput, isHidden: tc.isHidden || false }))
                : [{ input: "", expectedOutput: "", isHidden: false }],
        });
        setShowModal(true);
    }

    function addTestCase() {
        setForm(f => ({ ...f, testCases: [...f.testCases, { input: "", expectedOutput: "", isHidden: false }] }));
    }

    function removeTestCase(idx) {
        setForm(f => ({
            ...f,
            testCases: f.testCases.filter((_, i) => i !== idx),
        }));
    }

    function updateTestCase(idx, field, value) {
        setForm(f => ({
            ...f,
            testCases: f.testCases.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc),
        }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            const body = {
                title: form.title,
                difficulty: form.difficulty,
                description: form.description,
                example: form.example,
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                testCases: form.testCases.filter(tc => tc.input && tc.expectedOutput),
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

    const filtered = problems.filter(p =>
        !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <Toast toast={toast} />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search problems..."
                            className="pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 w-56 transition-all" />
                    </div>
                    <span className="text-slate-500 text-xs">{filtered.length} problem{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                    <Plus className="h-4 w-4" /> Add Problem
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Code2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No coding problems found</p>
                    <p className="text-slate-600 text-sm mt-1">Add your first problem to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(p => (
                        <motion.div key={p._id} layout className="glass-card rounded-xl overflow-hidden">
                            <div className="p-4 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-white font-semibold">{p.title}</span>
                                        <Badge diff={p.difficulty} />
                                        {!p.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Inactive</span>}
                                        {p.testCases?.length > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                                <Hash className="h-2.5 w-2.5" />
                                                {p.testCases.length} test{p.testCases.length !== 1 ? "s" : ""}
                                            </span>
                                        )}
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
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                        {expandedId === p._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded test cases view */}
                            <AnimatePresence>
                                {expandedId === p._id && p.testCases?.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-white/5 overflow-hidden"
                                    >
                                        <div className="p-4 space-y-2">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Test Cases</p>
                                            {p.testCases.map((tc, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                                    <span className="text-xs font-mono text-slate-500 mt-0.5 shrink-0">#{i + 1}</span>
                                                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-xs text-slate-500 mb-1">Input</p>
                                                            <pre className="text-xs text-slate-300 font-mono bg-black/20 rounded-lg p-2 overflow-x-auto">{tc.input}</pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 mb-1">Expected Output</p>
                                                            <pre className="text-xs text-emerald-400 font-mono bg-black/20 rounded-lg p-2 overflow-x-auto">{tc.expectedOutput}</pre>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 mt-0.5">
                                                        {tc.isHidden ? (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                                                                <EyeOff className="h-2.5 w-2.5" />Hidden
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 flex items-center gap-1">
                                                                <Eye className="h-2.5 w-2.5" />Visible
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <Modal title={editing ? "Edit Coding Problem" : "Add Coding Problem"} onClose={() => setShowModal(false)}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Two Sum"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Difficulty *</label>
                                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
                                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Description *</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={4} placeholder="Describe the problem..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Example</label>
                                <textarea value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))}
                                    rows={2} placeholder="Input: nums = [2,7], target = 9&#10;Output: [0,1]"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none font-mono" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Tags (comma-separated)</label>
                                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                    placeholder="array, hash-map, two-pointers"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                            </div>

                            {/* Test Cases Section */}
                            <div className="border-t border-white/10 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                        <Hash className="h-3 w-3" /> Test Cases
                                    </label>
                                    <button onClick={addTestCase} type="button"
                                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                        <Plus className="h-3 w-3" /> Add Test Case
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {form.testCases.map((tc, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono text-slate-500">Test Case #{i + 1}</span>
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="checkbox" checked={tc.isHidden}
                                                            onChange={e => updateTestCase(i, "isHidden", e.target.checked)}
                                                            className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/20 h-3.5 w-3.5" />
                                                        <span className="text-xs text-slate-400">Hidden</span>
                                                    </label>
                                                    {form.testCases.length > 1 && (
                                                        <button onClick={() => removeTestCase(i)}
                                                            className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs text-slate-500 mb-0.5 block">Input</label>
                                                    <textarea value={tc.input} onChange={e => updateTestCase(i, "input", e.target.value)}
                                                        rows={2} placeholder="[2, 7, 11, 15]"
                                                        className="w-full px-2.5 py-2 rounded-lg bg-black/20 border border-white/5 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500/30 resize-none" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 mb-0.5 block">Expected Output</label>
                                                    <textarea value={tc.expectedOutput} onChange={e => updateTestCase(i, "expectedOutput", e.target.value)}
                                                        rows={2} placeholder="[0, 1]"
                                                        className="w-full px-2.5 py-2 rounded-lg bg-black/20 border border-white/5 text-emerald-400 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 resize-none" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.title || !form.description}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
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
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [filterRole, setFilterRole] = useState("All");
    const [filterDiff, setFilterDiff] = useState("All");

    const [form, setForm] = useState({ role: "", difficulty: "Easy", question: "", sampleAnswer: "" });

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function fetchRoles() {
        try {
            const res = await fetch("/api/admin/roles", { credentials: "include" });
            const data = await res.json();
            const activeRoles = (data.roles || []).filter(r => r.isActive);
            setRoles(activeRoles);
            // Set default role for form if available
            if (activeRoles.length > 0 && !form.role) {
                setForm(f => ({ ...f, role: activeRoles[0].name }));
            }
        } catch { /* silent */ }
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

    useEffect(() => {
        fetchRoles();
        fetchQuestions();
    }, []);

    function openAdd() {
        setEditing(null);
        setForm({ role: roles.length > 0 ? roles[0].name : "", difficulty: "Easy", question: "", sampleAnswer: "" });
        setShowModal(true);
    }

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

    // Get unique role names from questions that exist
    const allRoleNames = [...new Set([...roles.map(r => r.name), ...questions.map(q => q.role)])];

    const filtered = questions.filter(q =>
        (filterRole === "All" || q.role === filterRole) &&
        (filterDiff === "All" || q.difficulty === filterDiff)
    );

    return (
        <div>
            <Toast toast={toast} />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all">
                        <option value="All">All Roles</option>
                        {allRoleNames.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-all">
                        <option value="All">All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <span className="px-3 py-2 text-xs text-slate-500 self-center">{filtered.length} question{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-amber-500/20">
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
                        <motion.div key={q._id} layout className="glass-card rounded-xl p-4 flex items-start justify-between gap-4 hover:border-white/20 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">{q.role}</span>
                                    <Badge diff={q.difficulty} />
                                    {!q.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Inactive</span>}
                                </div>
                                <p className="text-white text-sm mt-1.5 leading-relaxed">{q.question}</p>
                                {q.sampleAnswer && (
                                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 italic">
                                        💡 {q.sampleAnswer}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
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
                                {roles.length > 0 ? (
                                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50">
                                        {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                    </select>
                                ) : (
                                    <div>
                                        <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                            placeholder="e.g. Full Stack Developer"
                                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                                        <p className="text-xs text-amber-500/70 mt-1">💡 Add roles in the Roles tab to see a dropdown here</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Difficulty *</label>
                                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50">
                                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Question *</label>
                                <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                                    rows={3} placeholder="Enter the interview question..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Sample Answer (optional)</label>
                                <textarea value={form.sampleAnswer} onChange={e => setForm(f => ({ ...f, sampleAnswer: e.target.value }))}
                                    rows={4} placeholder="A good answer would explain..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.question || !form.role}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
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

// ─────────────────── MAIN ADMIN PAGE ───────────────────
export default function AdminPage() {
    const [tab, setTab] = useState("roles");
    const [stats, setStats] = useState({ roles: 0, problems: 0, questions: 0 });

    useEffect(() => {
        // Seed admin on first load
        fetch("/api/auth/seed-admin").catch(() => { });

        // Fetch stats
        async function loadStats() {
            try {
                const [rolesRes, problemsRes, questionsRes] = await Promise.all([
                    fetch("/api/admin/roles", { credentials: "include" }),
                    fetch("/api/admin/coding-problems", { credentials: "include" }),
                    fetch("/api/admin/practice-questions", { credentials: "include" }),
                ]);
                const [rolesData, problemsData, questionsData] = await Promise.all([
                    rolesRes.json(), problemsRes.json(), questionsRes.json(),
                ]);
                setStats({
                    roles: (rolesData.roles || []).length,
                    problems: (problemsData.problems || []).length,
                    questions: (questionsData.questions || []).length,
                });
            } catch { /* silent */ }
        }
        loadStats();
    }, [tab]);

    const tabs = [
        { id: "roles", label: "Roles", icon: Briefcase, gradient: "from-emerald-600/30 to-teal-600/30" },
        { id: "coding", label: "Coding Problems", icon: Code2, gradient: "from-blue-600/30 to-violet-600/30" },
        { id: "practice", label: "Practice Questions", icon: BookOpen, gradient: "from-amber-500/30 to-orange-600/30" },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
                            <ShieldCheck className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
                            <p className="text-slate-400 text-sm">Manage roles, question banks & coding problems</p>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Roles", count: stats.roles, icon: Briefcase, color: "text-emerald-400", bg: "from-emerald-600/10 to-teal-600/5", border: "border-emerald-500/20", onclick: () => setTab("roles") },
                        { label: "Coding Problems", count: stats.problems, icon: Code2, color: "text-blue-400", bg: "from-blue-600/10 to-blue-600/5", border: "border-blue-500/20", onclick: () => setTab("coding") },
                        { label: "Practice Questions", count: stats.questions, icon: BookOpen, color: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20", onclick: () => setTab("practice") },
                    ].map(({ label, count, icon: Icon, color, bg, border, onclick }) => (
                        <motion.div key={label} variants={item} whileHover={{ scale: 1.02, y: -2 }}
                            onClick={onclick}
                            className={`glass-card rounded-xl p-5 bg-gradient-to-br ${bg} border ${border} cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]`}>
                            <div className="flex items-center justify-between mb-3">
                                <Icon className={`h-5 w-5 ${color}`} />
                                <span className={`text-2xl font-bold ${color}`}>{count}</span>
                            </div>
                            <p className="text-white font-semibold text-sm">{label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">Click to manage</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 glass-card rounded-xl p-1 mb-6 w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id
                                ? `bg-gradient-to-r ${t.gradient} text-white border border-white/10 shadow-sm`
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <t.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{t.label}</span>
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
                        transition={{ duration: 0.2 }}
                    >
                        {tab === "roles" && <RolesTab />}
                        {tab === "coding" && <CodingProblemsTab />}
                        {tab === "practice" && <PracticeQuestionsTab />}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
