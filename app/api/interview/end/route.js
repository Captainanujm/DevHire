import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/InterviewSession";
import { generateScoreSummary } from "@/lib/scoringEngine";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        verifyToken(token);
        const { sessionId } = await req.json();

        await connectDB();
        const session = await InterviewSession.findById(sessionId);
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

        // Generate scores
        const scoreSummary = generateScoreSummary(session.answers, session.role);

        session.timestamps.endedAt = new Date();
        session.status = "completed";
        session.scoreSummary = scoreSummary;

        await session.save();

        return NextResponse.json({ success: true, sessionId: session._id, scoreSummary });
    } catch (error) {
        console.error("End interview error:", error);
        return NextResponse.json({ error: "Failed to end interview" }, { status: 500 });
    }
}
