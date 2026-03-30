import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";
import User from "@/models/User";

// GET — List personalized manual interview invites for the student
export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userDoc = await User.findById(user.id);
        if (!userDoc) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Auto-expire overdue interviews
        await RecruiterInterview.updateMany(
            { status: "Active", expiresAt: { $lte: new Date() } },
            { $set: { status: "Expired" } }
        );

        // Get all active invites targeted at this student's email
        const invites = await RecruiterInterview.find({ 
            status: "Active", 
            interviewType: "Manual",
            "targetCandidate.email": userDoc.email
        })
            .select("slug jobRole difficulty numberOfQuestions vacancyCount expiresAt totalAttempts createdAt recruiterId")
            .populate("recruiterId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        // Check which ones the student has already attempted
        const interviewIds = invites.map(i => i._id);
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

        const result = invites.map(iv => ({
            ...iv,
            attempt: attemptMap[iv._id.toString()] || null,
        }));

        return NextResponse.json({ invites: result });
    } catch (err) {
        console.error("Student invites error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
