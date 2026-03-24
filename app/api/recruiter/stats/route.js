import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "recruiter") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const interviews = await RecruiterInterview.find({ recruiterId: user.id }).lean();
        const interviewIds = interviews.map(i => i._id);

        const totalInterviews = interviews.length;
        const activeInterviews = interviews.filter(i => i.status === "Active").length;
        const completedInterviews = interviews.filter(i => i.status === "Completed").length;

        // Get attempt stats
        const attempts = await CandidateAttempt.find({ interviewId: { $in: interviewIds } }).lean();
        const totalCandidates = attempts.length;
        const hiredCandidates = attempts.filter(a => a.status === "Selected").length;
        const successRate = totalCandidates > 0 ? Math.round((hiredCandidates / totalCandidates) * 100) : 0;

        return NextResponse.json({
            totalInterviews,
            activeInterviews,
            completedInterviews,
            totalCandidates,
            hiredCandidates,
            successRate,
        });
    } catch (err) {
        console.error("Recruiter stats error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
