import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, signRefreshToken } from "@/lib/auth";
import { validateLogin, sanitizeString } from "@/lib/validate";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    const errors = validateLogin({ email, password });
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    const cleanEmail = sanitizeString(email).toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const accessToken = signToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    const res = NextResponse.json({ role: user.role });
    res.cookies.set("token", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Server error. Please try again later." }, { status: 500 });
  }
}
