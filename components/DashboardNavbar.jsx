"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const studentLinks = [
  { href: "/dashboard/student/analytics", label: "Analytics" },
  { href: "/dashboard/student/interviews", label: "Interviews" },
  { href: "/resume-builder", label: "Resume Tools" }
];

export default function DashboardNavbar() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user");
      }
    }

    fetchUser();
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-background/80 border-b border-border shadow-sm">
      <div className="w-full flex items-center justify-between h-16 px-6 md:px-10">

        {/* LEFT */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          DevHire
        </h1>

        {/* CENTER */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          {user?.role === "student" && studentLinks.map((link) => {
             const isActive = pathname.startsWith(link.href);
             return (
               <Link key={link.href} href={link.href} className="relative px-4 py-2 rounded-full transition-colors">
                 {isActive && (
                   <motion.div
                     layoutId="navbar-active"
                     className="absolute inset-0 bg-white/10 dark:bg-white/5 rounded-full"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                 )}
                 <span className={`relative z-10 ${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                   {link.label}
                 </span>
               </Link>
             );
          })}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <Button size="icon" variant="ghost" className="rounded-full hover:bg-accent">
            <Bell size={18} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-accent"
          >
            {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
          </Button>

          {/* Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer border border-border">
                <AvatarImage
                  src={user?.profileImage || ""}
                  alt="Profile"
                />
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40 bg-popover border border-border text-popover-foreground"
            >
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => (window.location.href = "/dashboard/admin")} className="font-semibold text-emerald-500">
                  Admin Portal
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>
                Edit Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  document.cookie =
                    "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  window.location.href = "/login";
                }}
                className="text-red-500"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
