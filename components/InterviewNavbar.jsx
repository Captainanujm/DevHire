"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InterviewNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-border bg-background shrink-0">
      <Link href="/">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent cursor-pointer">
          DevHire
        </h1>
      </Link>
      
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full hover:bg-accent"
        >
          {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
        </Button>
      </div>
    </nav>
  );
}
