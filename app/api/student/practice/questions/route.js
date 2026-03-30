import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import PracticeQuestion from "@/models/PracticeQuestion";
import { getStaticQuestions } from "@/lib/interviewQuestions";
import { fetchQuestionsFromDB } from "@/lib/generateQuestions";

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

        let questions = [];
        let source = "static";

        // Fetch from DB using our aggregate $sample script (100% reliable random questions)
        console.log(`Fetching randomized DB practice questions for ${role}`);
        try {
            const dbMapped = await fetchQuestionsFromDB(role, difficulty, 5);
            questions = dbMapped.map(q => q.question);
            source = "db";
        } catch (err) {
            console.warn("Generation failed for practice, falling back to static questions");
            questions = getStaticQuestions(role, difficulty).slice(0, 5);
            source = "static";
        }

        return NextResponse.json({ questions, source });
    } catch (err) {
        console.error("Practice questions fetch error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
