import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, signRefreshToken } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import { validateRegister, sanitizeString } from "@/lib/validate";

// POST — Register candidate for a specific interview
export async function POST(req, { params }) {
    try {
        await connectDB();
        const { slug } = await params;

        // Verify interview exists and is active
        const interview = await RecruiterInterview.findOne({ slug });
        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }
        if (interview.status !== "Active" || new Date(interview.expiresAt) <= new Date()) {
            return NextResponse.json({ error: "Interview has expired" }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password } = body;

        const errors = validateRegister({ name, email, password });
        if (errors.length > 0) {
            return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
        }

        const cleanEmail = sanitizeString(email).toLowerCase();
        const cleanName = sanitizeString(name);

        // Check if email already exists
        let user = await User.findOne({ email: cleanEmail });
        if (user) {
            // If user exists, verify password and let them proceed
            const match = await bcrypt.compare(password, user.passwordHash);
            if (!match) {
                return NextResponse.json({ error: "Email already registered. Please use correct password or login." }, { status: 400 });
            }
        } else {
            const passwordHash = await bcrypt.hash(password, 10);
            user = await User.create({
                name: cleanName,
                email: cleanEmail,
                passwordHash,
                role: "student",
            });
        }

        const accessToken = signToken({ id: user._id, role: user.role || "student" });
        const refreshToken = signRefreshToken({ id: user._id });

        user.refreshToken = refreshToken;
        await user.save();

        const res = NextResponse.json({ success: true, role: user.role || "student" });
        res.cookies.set("token", accessToken, { httpOnly: true, path: "/", maxAge: 60 * 15, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
        res.cookies.set("refreshToken", refreshToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax", secure: process.env.NODE_ENV === "production" });

        return res;
    } catch (err) {
        console.error("Candidate register error:", err);
        if (err.code === 11000) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
