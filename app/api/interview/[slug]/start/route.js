import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";
import User from "@/models/User";
import { fetchQuestionsFromDB } from "@/lib/generateQuestions";

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

        const isManual = interview.interviewType === "Manual";

        const userDoc = await User.findById(user.id);
        if (!userDoc) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ── Guard for Manual Interviews ──
        if (isManual) {
            if (!interview.targetCandidate || interview.targetCandidate.email !== userDoc.email) {
                return NextResponse.json({ error: "You are not authorized to take this targeted interview." }, { status: 403 });
            }
        }

        // Check for existing attempt
        const existing = await CandidateAttempt.findOne({
            interviewId: interview._id,
            candidateId: user.id,
        });

        if (existing) {
            if (existing.status === "InProgress") {
                // Manual interview — resume with just the video call
                if (isManual) {
                    return NextResponse.json({
                        attemptId: existing._id,
                        questions: [],
                        jobRole: interview.jobRole,
                        interviewType: "Manual",
                        dailyRoomUrl: interview.dailyRoomUrl,
                        startedAt: existing.startedAt,
                        resumed: true,
                    });
                }

                // Automated interview — resume with saved AI-generated questions
                const questions = (existing.generatedQuestions || []).map((q, i) => ({
                    index: i,
                    displayIndex: i,
                    question: q.question,
                    type: q.type || "verbal",
                }));

                return NextResponse.json({
                    attemptId: existing._id,
                    questions,
                    jobRole: interview.jobRole,
                    interviewType: interview.interviewType,
                    dailyRoomUrl: interview.dailyRoomUrl,
                    startedAt: existing.startedAt,
                    resumed: true,
                    totalQuestions: existing.totalQuestions || 5
                });
            }
            return NextResponse.json({ error: "You have already attempted this interview" }, { status: 400 });
        }

        // ── Rate limit removed for testing ─────────────────────


        // ── Manual Interview: No AI questions, just video call ──────────────
        if (isManual) {
            const attempt = await CandidateAttempt.create({
                interviewId: interview._id,
                candidateId: user.id,
                totalQuestions: 0,
                questionMapping: [],
                generatedQuestions: [],
                startedAt: new Date(),
            });

            if (userDoc) {
                userDoc.lastInterviewAt = new Date();
                await userDoc.save();
            }

            return NextResponse.json({
                attemptId: attempt._id,
                questions: [],
                jobRole: interview.jobRole,
                interviewType: "Manual",
                dailyRoomUrl: interview.dailyRoomUrl,
                startedAt: attempt.startedAt,
            }, { status: 201 });
        }

        // ── Automated Interview: Fetch randomized questions from DB ──
        console.log(`🧠 Fetching randomized DB questions for candidate ${user.id} — ${interview.jobRole} ${interview.difficulty}`);
        const dbQuestions = await fetchQuestionsFromDB(
            interview.jobRole,
            interview.difficulty,
            interview.numberOfQuestions || 5
        );

        // Store ALL fetched per-candidate questions in the attempt
        const attempt = await CandidateAttempt.create({
            interviewId: interview._id,
            candidateId: user.id,
            totalQuestions: interview.numberOfQuestions || 5,
            questionMapping: Array.from({ length: interview.numberOfQuestions || 5 }).map((_, i) => ({ originalIndex: i, optionMapping: [] })),
            generatedQuestions: dbQuestions,
            startedAt: new Date(),
        });

        // Update lastInterviewAt on the user
        if (userDoc) {
            userDoc.lastInterviewAt = new Date();
            await userDoc.save();
        }

        // Build question list for the frontend (only pass the first question to start)
        const questions = dbQuestions.length > 0 ? [{
            index: 0,
            displayIndex: 0,
            question: dbQuestions[0].question,
            type: dbQuestions[0].type || "verbal",
        }] : [];

        return NextResponse.json({
            attemptId: attempt._id,
            questions,
            jobRole: interview.jobRole,
            interviewType: interview.interviewType,
            dailyRoomUrl: interview.dailyRoomUrl,
            startedAt: attempt.startedAt,
            totalQuestions: attempt.totalQuestions
        }, { status: 201 });
    } catch (err) {
        console.error("Start attempt error:", err.message, err.stack);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
