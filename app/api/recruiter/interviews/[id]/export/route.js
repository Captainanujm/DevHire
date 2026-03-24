import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — Export results as CSV
export async function GET(req, { params }) {
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

        const attempts = await CandidateAttempt.find({ interviewId: id })
            .populate("candidateId", "name email")
            .sort({ score: -1, timeTaken: 1 })
            .lean();

        // Build CSV
        const headers = "Rank,Name,Email,Score,Total Questions,Time Taken (sec),Violations,Status,Submitted At\n";
        const rows = attempts.map((a, i) => {
            const name = a.candidateId?.name || "N/A";
            const email = a.candidateId?.email || "N/A";
            return `${i + 1},"${name}","${email}",${a.score},${a.totalQuestions},${a.timeTaken},${a.violations},${a.status},${a.submittedAt ? new Date(a.submittedAt).toISOString() : "N/A"}`;
        }).join("\n");

        const csv = headers + rows;

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="interview-${interview.slug}-results.csv"`,
            },
        });
    } catch (err) {
        console.error("Export error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
