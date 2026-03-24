import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — Get student's own interview results/attempts
export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const attempts = await CandidateAttempt.find({ candidateId: user.id })
            .populate({
                path: "interviewId",
                select: "jobRole difficulty numberOfQuestions slug vacancyCount",
            })
            .sort({ createdAt: -1 })
            .lean();

        const results = attempts.map(a => ({
            _id: a._id,
            interview: a.interviewId,
            score: a.score,
            totalQuestions: a.totalQuestions,
            percentage: a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0,
            timeTaken: a.timeTaken,
            violations: a.violations,
            status: a.status,
            submittedAt: a.submittedAt,
            startedAt: a.startedAt,
        }));

        return NextResponse.json({ results });
    } catch (err) {
        console.error("Student results error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
