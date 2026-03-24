import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import PracticeQuestion from "@/models/PracticeQuestion";
import { getStaticQuestions, INTERVIEW_ROLES, INTERVIEW_DIFFICULTIES } from "@/lib/interviewQuestions";

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const difficulty = searchParams.get("difficulty");

        if (!role || !difficulty) {
            return NextResponse.json({ error: "role and difficulty are required" }, { status: 400 });
        }

        // Fetch from DB first
        const dbQuestions = await PracticeQuestion.find({ role, difficulty, isActive: true })
            .select("question")
            .lean();

        let questions;
        if (dbQuestions.length > 0) {
            questions = dbQuestions.map(q => q.question);
        } else {
            // Fall back to static questions
            questions = getStaticQuestions(role, difficulty);
        }

        return NextResponse.json({ questions, source: dbQuestions.length > 0 ? "db" : "static" });
    } catch (err) {
        console.error("Practice questions fetch error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
