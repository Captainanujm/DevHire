import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

        const { slug } = await params;
        const interview = await RecruiterInterview.findOne({ slug });
        if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

        const attempt = await CandidateAttempt.findOne({
            interviewId: interview._id,
            candidateId: user.id,
            status: "InProgress",
        });

        if (!attempt) return NextResponse.json({ error: "No active attempt found" }, { status: 400 });

        const body = await req.json();
        const { currentQuestion, currentAnswer, questionIndex } = body;

        if (!attempt.generatedQuestions) attempt.generatedQuestions = [];

        // Next index
        const nextIdx = parseInt(questionIndex) + 1;

        // Check if we hit the limit
        if (nextIdx >= attempt.totalQuestions || nextIdx >= attempt.generatedQuestions.length) {
             return NextResponse.json({ nextQuestion: null, isFinished: true });
        }

        console.log(`🧠 Fetching next pre-populated DB question for candidate ${user.id} - Next Q${nextIdx}`);
        const nextQ = attempt.generatedQuestions[nextIdx];

        const formattedQuestion = {
            index: nextIdx,
            displayIndex: nextIdx,
            question: nextQ.question,
            type: nextQ.type || "verbal",
        };

        return NextResponse.json({
            nextQuestion: formattedQuestion,
            isFinished: false
        });

    } catch (err) {
        console.error("Next question error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
