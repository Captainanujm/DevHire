"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    BarChart3,
    Code2,
    FileText,
    Home,
    Settings,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    ClipboardList,
    Trophy,
    FileBarChart,
    Sparkles,
    BookOpen,
    Briefcase,
    ShieldCheck,
    Dumbbell,
} from "lucide-react";

const studentNav = [
    { label: "Dashboard", href: "/dashboard/student", icon: Home },
    { label: "Available Interviews", href: "/dashboard/student/interviews/available", icon: Briefcase },
    { label: "Interview Invites", href: "/dashboard/student/interviews/invites", icon: Sparkles },
    { label: "Practice Mode", href: "/dashboard/student/interviews/practice", icon: BookOpen },
    { label: "Coding Lab", href: "/dashboard/student/coding", icon: Code2 },
    { label: "Analytics", href: "/dashboard/student/analytics", icon: BarChart3 },
    { label: "Resume Builder", href: "/resume-builder", icon: FileText },
];

const adminNav = [
    { label: "Admin Dashboard", href: "/dashboard/admin", icon: ShieldCheck },
    { label: "Manage Recruiters", href: "/dashboard/recruiter/interviews", icon: Briefcase },
    { label: "Student View", href: "/dashboard/student", icon: Home },
];

const recruiterNav = [
    { label: "Dashboard", href: "/dashboard/recruiter", icon: Home },
    { label: "Interviews", href: "/dashboard/recruiter/interviews", icon: Brain },
    { label: "Candidates", href: "/dashboard/recruiter/students", icon: Users },
    { label: "Rankings", href: "/dashboard/recruiter/ranking", icon: Trophy },
];

export default function Sidebar({ role = "student" }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = role === "recruiter" ? recruiterNav : role === "admin" ? adminNav : studentNav;

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const sidebarWidth = collapsed ? "w-[72px]" : "w-[260px]";

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            <span className="text-lg font-bold text-gradient-blue">DevHire</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {collapsed && <Sparkles className="h-5 w-5 text-blue-400 mx-auto" />}

                {!isMobile && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((navItem) => {
                    const isActive = pathname === navItem.href ||
                        (navItem.href !== `/dashboard/${role}` && pathname.startsWith(navItem.href));

                    return (
                        <Link key={navItem.href} href={navItem.href} className="relative block">
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-bg"
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-violet-600/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div
                                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-violet-500"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <navItem.icon className={`h-5 w-5 flex-shrink-0 relative z-10 transition-colors ${isActive ? "text-blue-400" : ""}`} />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="text-sm font-medium whitespace-nowrap overflow-hidden relative z-10"
                                        >
                                            {navItem.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-3 py-4 border-t border-border">
                <Link href="/profile">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Settings</span>}
                    </div>
                </Link>
            </div>
        </div>
    );

    // Mobile overlay
    if (isMobile) {
        return (
            <>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-strong text-foreground md:hidden"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                                onClick={() => setMobileOpen(false)}
                            />
                            <motion.aside
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed top-0 left-0 bottom-0 w-[260px] z-50 bg-background/95 backdrop-blur-2xl border-r border-border"
                            >
                                {sidebarContent}
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 bottom-0 z-40 bg-background/80 backdrop-blur-2xl border-r border-border hidden md:block`}
        >
            {sidebarContent}
        </motion.aside>
    );
}
