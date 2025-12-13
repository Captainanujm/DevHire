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
import { useEffect, useState } from "react";

export default function DashboardNavbar() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);

  // ✅ Fetch user profile
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
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-gradient-to-r from-[#0f0f1aa0] via-[#15152790] to-[#0f0f1aa0] border-b border-white/10 shadow-[0_0_40px_rgba(120,60,255,0.25)]">
      <div className="w-full flex items-center justify-between h-16 px-6 md:px-10">

        {/* LEFT */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          DevHire
        </h1>

        {/* CENTER */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium">
          <Link href="/dashboard/student/analytics" className="text-gray-300 hover:text-white">
            Analytics
          </Link>
          <Link href="/dashboard/student/interviews" className="text-gray-300 hover:text-white">
            Interviews
          </Link>
          <Link href="/resume-tools" className="text-gray-300 hover:text-white">
            Resume Tools
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <Button size="icon" variant="ghost" className="rounded-full bg-white/10">
            <Bell size={18} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-white/10"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* ✅ Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer border border-white/20 bg-white/10">
                <AvatarImage
                  src={user?.profileImage || ""}
                  alt="Profile"
                />
                <AvatarFallback className="bg-purple-600">
                  {user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40 bg-black/40 backdrop-blur-xl border border-white/10 text-white"
            >
              <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>
                Edit Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  document.cookie =
                    "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  window.location.href = "/login";
                }}
                className="text-red-400"
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
