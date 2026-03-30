import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — Get interview details with candidate attempts
export async function GET(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const filter = user.role === "admin" ? { _id: id } : { _id: id, recruiterId: user.id };
        const interview = await RecruiterInterview.findOne(filter).lean();
        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        // Auto-expire if needed
        if (interview.status === "Active" && new Date(interview.expiresAt) <= new Date()) {
            await RecruiterInterview.updateOne({ _id: id }, { $set: { status: "Expired" } });
            interview.status = "Expired";
        }

        // Get all attempts with candidate info
        const attempts = await CandidateAttempt.find({ interviewId: id })
            .populate("candidateId", "name email")
            .sort({ overallScore: -1, timeTaken: 1 })
            .lean();

        return NextResponse.json({
            interview: {
                ...interview,
                link: `/interview/${interview.slug}`,
            },
            attempts,
            stats: {
                totalAttempts: attempts.length,
                avgScore: attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + (b.overallScore || 0), 0) / attempts.length) : 0,
                topScore: attempts.length > 0 ? attempts[0].overallScore : 0,
            },
        });
    } catch (err) {
        console.error("Get interview detail error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE — Delete interview
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const filter = user.role === "admin" ? { _id: id } : { _id: id, recruiterId: user.id };
        const interview = await RecruiterInterview.findOneAndDelete(filter);
        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        // Clean up attempts
        await CandidateAttempt.deleteMany({ interviewId: id });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete interview error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
