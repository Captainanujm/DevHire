import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — Get all active interviews that the student hasn't attempted
export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find all active, non-expired interviews
        const now = new Date();
        const activeInterviews = await RecruiterInterview.find({
            status: "Active",
            expiresAt: { $gt: now },
        })
            .select("slug jobRole difficulty numberOfQuestions vacancyCount expiresAt createdAt")
            .sort({ createdAt: -1 })
            .lean();

        // Find interviews the student has already attempted
        const attemptedInterviewIds = await CandidateAttempt.find({
            candidateId: user.id,
        }).distinct("interviewId");

        const attemptedSet = new Set(attemptedInterviewIds.map(id => id.toString()));

        // Filter out already attempted interviews
        const available = activeInterviews
            .filter(iv => !attemptedSet.has(iv._id.toString()))
            .map(iv => ({
                ...iv,
                link: `/interview/${iv.slug}`,
                timeLeft: getTimeRemaining(iv.expiresAt),
            }));

        // Also get student's past attempts with results
        const myAttempts = await CandidateAttempt.find({ candidateId: user.id })
            .populate({
                path: "interviewId",
                select: "jobRole difficulty numberOfQuestions slug",
            })
            .sort({ submittedAt: -1 })
            .lean();

        return NextResponse.json({ available, myAttempts });
    } catch (err) {
        console.error("Student available interviews error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

function getTimeRemaining(expiresAt) {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}d ${h}h left`;
}
