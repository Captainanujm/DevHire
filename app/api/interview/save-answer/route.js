import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/InterviewSession";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        verifyToken(token);
        const { sessionId, questionIndex, text, duration } = await req.json();

        await connectDB();
        const session = await InterviewSession.findById(sessionId);
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

        session.answers.push({
            questionIndex,
            text,
            timestamp: new Date(),
            duration: duration || 0,
        });

        await session.save();

        return NextResponse.json({ success: true, answersCount: session.answers.length });
    } catch (error) {
        console.error("Save answer error:", error);
        return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
    }
}
