"use client";

import { useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  async function login() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) window.location.href = `/dashboard/${data.role}`;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <AnimatedCard>
        <h1 className="text-3xl font-semibold mb-6 text-center">Welcome Back</h1>

        <Input 
          placeholder="Email" 
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <Input 
          className="mt-4" 
          type="password" 
          placeholder="Password" 
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <Button className="w-full mt-6" onClick={login}>
          Login
        </Button>

        <p className="text-center mt-4 text-sm opacity-80">
          New here?{" "}
          <a href="/register" className="text-cyan-300 underline">
            Create account
          </a>
        </p>
      </AnimatedCard>
    </div>
  );
}
