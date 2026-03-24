import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";
import { getUserFromRequest } from "@/lib/auth";

// GET — Public interview info (no questions exposed)
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { slug } = await params;

        const interview = await RecruiterInterview.findOne({ slug })
            .select("jobRole difficulty numberOfQuestions vacancyCount expiresAt status createdAt")
            .lean();

        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        // Auto-expire check
        if (interview.status === "Active" && new Date(interview.expiresAt) <= new Date()) {
            await RecruiterInterview.updateOne({ slug }, { $set: { status: "Expired" } });
            interview.status = "Expired";
        }

        const isExpired = interview.status !== "Active";

        // Check if current user already attempted
        let hasAttempted = false;
        let user = null;
        try {
            user = getUserFromRequest(req);
        } catch {
            user = null;
        }
        let attemptStatus = null;
        if (user) {
            const existing = await CandidateAttempt.findOne({
                interviewId: interview._id,
                candidateId: user.id,
            });
            if (existing) attemptStatus = existing.status;
        }

        return NextResponse.json({
            interview: {
                _id: interview._id,
                jobRole: interview.jobRole,
                difficulty: interview.difficulty,
                numberOfQuestions: interview.numberOfQuestions,
                vacancyCount: interview.vacancyCount,
                expiresAt: interview.expiresAt,
                status: interview.status,
                isExpired,
            },
            hasAttempted: attemptStatus === "Completed",
            attemptStatus,
            isAuthenticated: !!user,
        });
    } catch (err) {
        console.error("Get public interview error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
