import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";
import { generateInterviewQuestions } from "@/lib/generateQuestions";
import { validateInterviewCreate, sanitizeString } from "@/lib/validate";
import crypto from "crypto";

// POST — Create new interview
export async function POST(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { jobRole, difficulty, numberOfQuestions, vacancyCount, interviewType, targetCandidate } = body;

        const errors = validateInterviewCreate({ jobRole, difficulty, numberOfQuestions, vacancyCount });
        if (errors.length > 0) {
            return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
        }

        if (interviewType === "Manual") {
            if (!targetCandidate || !targetCandidate.email) {
                return NextResponse.json({ error: "Candidate Email is required for Manual mode" }, { status: 400 });
            }
        }

        const cleanRole = sanitizeString(jobRole);
        const questCount = parseInt(numberOfQuestions);
        const vacCount = parseInt(vacancyCount);

        const slug = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days

        let dailyRoomUrl = null;
        if (interviewType === "Manual") {
            // Replaced Daily.co paid API with free Jitsi meet URL
            dailyRoomUrl = `https://meet.jit.si/devhire-${slug}`;
        }

        const interview = await RecruiterInterview.create({
            recruiterId: user.id,
            slug,
            jobRole: cleanRole,
            difficulty,
            numberOfQuestions: questCount,
            questions: [], // Pre-generated questions are no longer needed
            vacancyCount: vacCount,
            expiresAt,
            interviewType: interviewType || "Automated",
            targetCandidate: interviewType === "Manual" ? targetCandidate : undefined,
            dailyRoomUrl,
        });

        return NextResponse.json({
            success: true,
            interview: {
                _id: interview._id,
                slug: interview.slug,
                jobRole: interview.jobRole,
                difficulty: interview.difficulty,
                numberOfQuestions: interview.numberOfQuestions,
                vacancyCount: interview.vacancyCount,
                interviewType: interview.interviewType,
                expiresAt: interview.expiresAt,
                status: interview.status,
                link: `/interview/${interview.slug}`,
            },
        }, { status: 201 });
    } catch (err) {
        console.error("Create interview error:", err);
        const message = err.message || "Failed to create interview";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET — List recruiter's interviews
export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const filter = user.role === "admin" ? {} : { recruiterId: user.id };

        // Auto-expire overdue interviews
        await RecruiterInterview.updateMany(
            { ...filter, status: "Active", expiresAt: { $lte: new Date() } },
            { $set: { status: "Expired" } }
        );

        const interviews = await RecruiterInterview.find(filter)
            .select("-questions")
            .sort({ createdAt: -1 })
            .lean();

        // Attach attempt counts
        const ids = interviews.map(i => i._id);
        const attemptCounts = await CandidateAttempt.aggregate([
            { $match: { interviewId: { $in: ids } } },
            { $group: { _id: "$interviewId", count: { $sum: 1 } } },
        ]);
        const countMap = {};
        attemptCounts.forEach(a => { countMap[a._id.toString()] = a.count; });

        const result = interviews.map(i => ({
            ...i,
            totalAttempts: countMap[i._id.toString()] || 0,
            link: `/interview/${i.slug}`,
        }));

        return NextResponse.json({ interviews: result });
    } catch (err) {
        console.error("List interviews error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
