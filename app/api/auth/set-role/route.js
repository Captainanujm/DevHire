import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = verifyToken(token);
  const { role } = await req.json();

  await User.findByIdAndUpdate(id, { role });

  return NextResponse.json({ success: true });
}
