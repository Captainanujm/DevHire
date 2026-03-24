import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        await connectDB();
        const user = await User.findById(payload.id).select("-passwordHash");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
}
