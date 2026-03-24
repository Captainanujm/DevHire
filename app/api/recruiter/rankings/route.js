import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — Aggregate rankings across all recruiter's interviews
export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "recruiter") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const interviewId = searchParams.get("interviewId");

        // Get recruiter's interviews
        const interviewFilter = { recruiterId: user.id };
        if (interviewId) {
            interviewFilter._id = interviewId;
        }

        const interviews = await RecruiterInterview.find(interviewFilter)
            .select("_id jobRole difficulty vacancyCount status slug numberOfQuestions")
            .sort({ createdAt: -1 })
            .lean();

        const interviewIds = interviews.map(i => i._id);

        // Aggregate all attempts across these interviews
        const rankings = await CandidateAttempt.aggregate([
            { $match: { interviewId: { $in: interviewIds }, status: { $in: ["Submitted", "Selected", "Rejected", "Pending"] } } },
            { $sort: { score: -1, timeTaken: 1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "candidateId",
                    foreignField: "_id",
                    as: "candidate",
                },
            },
            { $unwind: "$candidate" },
            {
                $lookup: {
                    from: "recruiterinterviews",
                    localField: "interviewId",
                    foreignField: "_id",
                    as: "interview",
                },
            },
            { $unwind: "$interview" },
            {
                $project: {
                    _id: 1,
                    score: 1,
                    totalQuestions: 1,
                    timeTaken: 1,
                    violations: 1,
                    status: 1,
                    submittedAt: 1,
                    "candidate.name": 1,
                    "candidate.email": 1,
                    "interview.jobRole": 1,
                    "interview.difficulty": 1,
                    "interview.slug": 1,
                    percentage: {
                        $cond: {
                            if: { $gt: ["$totalQuestions", 0] },
                            then: { $round: [{ $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] }, 0] },
                            else: 0,
                        },
                    },
                },
            },
        ]);

        // Stats
        const totalCandidates = rankings.length;
        const selectedCount = rankings.filter(r => r.status === "Selected").length;
        const avgPercentage = totalCandidates > 0
            ? Math.round(rankings.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalCandidates)
            : 0;

        return NextResponse.json({
            rankings,
            interviews,
            stats: {
                totalCandidates,
                selectedCount,
                avgPercentage,
                totalInterviews: interviews.length,
            },
        });
    } catch (err) {
        console.error("Rankings API error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
