"use client";

import { useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    window.location.href = "/role"; // redirect
  }

  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <AnimatedCard>
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Create Account
        </h1>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              placeholder="Enter your full name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Create a password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* 🔥 Animated Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 bg-red-950/40 border border-red-600/40 px-4 py-2 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <Button
            className="w-full mt-4"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Continue"}
          </Button>

          <p className="text-center mt-4 text-sm opacity-80">
            Already have an account?{" "}
            <a href="/login" className="text-cyan-300 underline">
              Login
            </a>
          </p>
        </div>
      </AnimatedCard>
    </div>
  );
}
