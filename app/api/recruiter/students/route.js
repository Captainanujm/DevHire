import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        if (payload.role !== "recruiter") {
            return NextResponse.json({ error: "Recruiter access only" }, { status: 403 });
        }

        await connectDB();
        const students = await User.find({ role: "student" })
            .select("name email profileImage profile")
            .limit(100)
            .lean();

        return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
