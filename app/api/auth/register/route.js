import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  const { name, email, password } = await req.json();

  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = signToken({ id: user._id, role: user.role });

  const res = NextResponse.json({
    success: true,
    role: user.role, // ✅ return role
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return res;
}
