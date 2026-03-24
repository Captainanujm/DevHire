import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken, signToken } from "@/lib/auth";

export async function PATCH(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = verifyToken(token);
    const { role } = await req.json();

    const dbUser = await User.findById(id);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (role === "admin" && dbUser.email !== "captainanuj2004@gmail.com") {
      return NextResponse.json({ error: "Unauthorized for admin role" }, { status: 403 });
    }

    if (!["student", "recruiter", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await User.findByIdAndUpdate(id, { role });

    // Re-sign access token with the new role
    const newAccessToken = signToken({ id, role });

    const res = NextResponse.json({ success: true });
    res.cookies.set("token", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("Set-role API error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
