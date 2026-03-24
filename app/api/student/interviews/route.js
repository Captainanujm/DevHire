import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — List active interviews available for students to take
export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // Auto-expire overdue interviews
        await RecruiterInterview.updateMany(
            { status: "Active", expiresAt: { $lte: new Date() } },
            { $set: { status: "Expired" } }
        );

        // Get all active open automated interviews
        const interviews = await RecruiterInterview.find({ 
            status: "Active", 
            interviewType: { $ne: "Manual" } 
        })
            .select("slug jobRole difficulty numberOfQuestions vacancyCount expiresAt totalAttempts createdAt")
            .sort({ createdAt: -1 })
            .lean();

        // Check which ones the student has already attempted
        const interviewIds = interviews.map(i => i._id);
        const attempts = await CandidateAttempt.find({
            interviewId: { $in: interviewIds },
            candidateId: user.id,
        }).select("interviewId status score totalQuestions").lean();

        const attemptMap = {};
        attempts.forEach(a => {
            attemptMap[a.interviewId.toString()] = {
                attempted: true,
                status: a.status,
                score: a.score,
                totalQuestions: a.totalQuestions,
            };
        });

        const result = interviews.map(iv => ({
            ...iv,
            slug: iv.slug,
            attempt: attemptMap[iv._id.toString()] || null,
        }));

        return NextResponse.json({ interviews: result });
    } catch (err) {
        console.error("Student interviews error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
