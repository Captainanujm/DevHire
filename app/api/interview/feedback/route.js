import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/InterviewSession";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        verifyToken(token);
        const { sessionId } = await req.json();

        await connectDB();
        const session = await InterviewSession.findById(sessionId);
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

        // Generate AI feedback
        let feedback = "";
        let improvements = [];

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const qa = session.questions.map((q, i) => {
                const ans = session.answers.find((a) => a.questionIndex === i);
                return `Q: ${q}\nA: ${ans?.text || "(no answer)"}`;
            }).join("\n\n");

            const prompt = `You are an expert technical interview coach. Analyze this ${session.role} interview (${session.difficulty} difficulty).

Interview Transcript:
${qa}

Scores:
- Technical: ${session.scoreSummary.technical}/100
- Communication: ${session.scoreSummary.communication}/100
- Overall: ${session.scoreSummary.overall}/100
- Words per minute: ${session.scoreSummary.wpm}
- Filler words used: ${session.scoreSummary.fillerCount}

Provide:
1. A 2-3 sentence overall feedback summary
2. Exactly 4 specific improvement suggestions

Return as JSON:
{
  "feedback": "Overall feedback here",
  "improvements": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"]
}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                feedback = parsed.feedback || "";
                improvements = parsed.improvements || [];
            }
        } catch {
            feedback = "Your interview performance has been evaluated. Review your scores to identify areas for improvement.";
            improvements = [
                "Practice answering questions with more specific examples",
                "Work on reducing filler words",
                "Structure your answers using the STAR method",
                "Research common interview patterns for your role",
            ];
        }

        // Save feedback to session
        session.scoreSummary.feedback = feedback;
        session.scoreSummary.improvements = improvements;
        await session.save();

        return NextResponse.json({
            feedback,
            improvements,
            scoreSummary: session.scoreSummary,
        });
    } catch (error) {
        console.error("Feedback error:", error);
        return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
    }
}
