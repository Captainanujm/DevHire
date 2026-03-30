import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// POST — Run ranking for an interview
export async function POST(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "recruiter") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const interview = await RecruiterInterview.findOne({ _id: id, recruiterId: user.id });
        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        // MongoDB aggregation: rank by overallScore DESC, timeTaken ASC
        const ranked = await CandidateAttempt.aggregate([
            { $match: { interviewId: interview._id, status: { $in: ["Submitted", "Pending"] } } },
            { $sort: { overallScore: -1, timeTaken: 1 } },
            {
                $group: {
                    _id: null,
                    candidates: { $push: { attemptId: "$_id", candidateId: "$candidateId", score: "$overallScore", timeTaken: "$timeTaken" } },
                },
            },
        ]);

        if (!ranked.length || !ranked[0].candidates.length) {
            return NextResponse.json({ error: "No attempts to rank" }, { status: 400 });
        }

        const allCandidates = ranked[0].candidates;
        const selected = allCandidates.slice(0, interview.vacancyCount);
        const rejected = allCandidates.slice(interview.vacancyCount);

        // Update statuses
        if (selected.length > 0) {
            await CandidateAttempt.updateMany(
                { _id: { $in: selected.map(c => c.attemptId) } },
                { $set: { status: "Selected" } }
            );
        }
        if (rejected.length > 0) {
            await CandidateAttempt.updateMany(
                { _id: { $in: rejected.map(c => c.attemptId) } },
                { $set: { status: "Rejected" } }
            );
        }

        // Update interview
        await RecruiterInterview.updateOne(
            { _id: interview._id },
            {
                $set: {
                    selectedCandidates: selected.map(c => c.candidateId),
                    status: "Completed",
                },
            }
        );

        return NextResponse.json({
            success: true,
            selected: selected.length,
            rejected: rejected.length,
            total: allCandidates.length,
        });
    } catch (err) {
        console.error("Rank error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
