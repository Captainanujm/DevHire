import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";
import User from "@/models/User";

// Fisher-Yates shuffle — returns a new shuffled array with original indices
function shuffleWithIndices(arr) {
    const indices = arr.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices; // e.g. [2, 0, 3, 1] — the order to display questions
}

// Build the candidate's view of questions from a shuffled mapping
function buildQuestions(questions, shuffledIndices) {
    return shuffledIndices.map((origIdx, displayIdx) => ({
        index: origIdx,           // original index — used when scoring
        displayIndex: displayIdx, // 0-based display order
        question: questions[origIdx].question,
        type: questions[origIdx].type || "verbal",
    }));
}

// POST — Start an interview attempt
export async function POST(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { slug } = await params;
        const interview = await RecruiterInterview.findOne({ slug });

        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        if (interview.status !== "Active" || new Date(interview.expiresAt) <= new Date()) {
            return NextResponse.json({ error: "Interview has expired" }, { status: 403 });
        }

        // ── Rate limit: 1 AI interview per calendar day ─────────────────────
        const userDoc = await User.findById(user.id);
        if (userDoc) {
            const now = new Date();
            const last = userDoc.lastInterviewAt;
            if (last) {
                const sameDay =
                    last.getFullYear() === now.getFullYear() &&
                    last.getMonth() === now.getMonth() &&
                    last.getDate() === now.getDate();
                if (sameDay) {
                    return NextResponse.json({
                        error: "daily_limit",
                        message: "You have used your free interview for today. Come back tomorrow!"
                    }, { status: 429 });
                }
            }
        }

        // Check for existing attempt
        const existing = await CandidateAttempt.findOne({
            interviewId: interview._id,
            candidateId: user.id,
        });

        if (existing) {
            if (existing.status === "InProgress") {
                // Resume with saved mapping
                const mapping = existing.questionMapping || [];
                const shuffledIndices = mapping.length > 0
                    ? mapping.map(m => m.originalIndex)
                    : interview.questions.map((_, i) => i);

                const questions = buildQuestions(interview.questions, shuffledIndices);

                return NextResponse.json({
                    attemptId: existing._id,
                    questions,
                    jobRole: interview.jobRole,
                    interviewType: interview.interviewType,
                    dailyRoomUrl: interview.dailyRoomUrl,
                    startedAt: existing.startedAt,
                    resumed: true,
                });
            }
            return NextResponse.json({ error: "You have already attempted this interview" }, { status: 400 });
        }

        // Generate randomized question order for this candidate
        const shuffledIndices = shuffleWithIndices(interview.questions);
        const questionMapping = shuffledIndices.map(origIdx => ({
            originalIndex: origIdx,
            optionMapping: [], // no MCQ options; kept for schema compatibility
        }));

        // Create new attempt
        const attempt = await CandidateAttempt.create({
            interviewId: interview._id,
            candidateId: user.id,
            totalQuestions: interview.questions.length,
            questionMapping,
            startedAt: new Date(),
        });

        // Update lastInterviewAt on the user
        if (userDoc) {
            userDoc.lastInterviewAt = new Date();
            await userDoc.save();
        }

        // Build shuffled question list (no answers / options exposed)
        const questions = buildQuestions(interview.questions, shuffledIndices);

        return NextResponse.json({
            attemptId: attempt._id,
            questions,
            jobRole: interview.jobRole,
            interviewType: interview.interviewType,
            dailyRoomUrl: interview.dailyRoomUrl,
            startedAt: attempt.startedAt,
        }, { status: 201 });
    } catch (err) {
        console.error("Start attempt error:", err.message, err.stack);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
