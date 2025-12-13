import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match)
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });

  // User MUST have a role here
  const token = signToken({ id: user._id, role: user.role });

  const res = NextResponse.json({ role: user.role });
  res.cookies.set("token", token, { httpOnly: true });

  return res;
}
