"use client";

import { useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Role() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function proceed() {
    if (!role) return;

    try {
      setLoading(true);

      const res = await fetch("/api/auth/set-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        console.error("Failed to update role:", res.status);
        return;
      }
      localStorage.setItem("role", role);
      router.push("/profile");
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatedCard>
        <h1 className="text-xl font-semibold text-center">Choose Your Role</h1>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant={role === "student" ? "default" : "outline"}
            onClick={() => setRole("student")}
          >
            Student
          </Button>

          <Button
            variant={role === "recruiter" ? "default" : "outline"}
            onClick={() => setRole("recruiter")}
          >
            Recruiter
          </Button>
        </div>

        <Button
          className="w-full mt-6"
          disabled={!role || loading}
          onClick={proceed}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </AnimatedCard>
    </div>
  );
}
