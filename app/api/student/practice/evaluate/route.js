import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import PracticeQuestion from "@/models/PracticeQuestion";
import { getStaticQuestions } from "@/lib/interviewQuestions";
import Groq from "groq-sdk";

async function evaluateWithGroq(question, answer, role) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
        const groq = new Groq({ apiKey });
        const prompt = `You are an expert interviewer evaluating a practice interview answer.

ROLE: ${role}
QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer || "No answer provided"}

Evaluate the answer and respond with a JSON object ONLY (no markdown, no extra text):
{
  "score": number from 0 to 10,
  "feedback": "2-3 sentences of constructive feedback highlighting what was good and what was missing",
  "improvements": ["key point to improve 1", "key point to improve 2"],
  "sampleAnswer": "A comprehensive, high-quality sample answer for this question (3-5 sentences)"
}`;

        const chat = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 800,
        });

        let text = chat.choices[0]?.message?.content?.trim();
        if (!text) return null;

        text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start === -1 || end === -1) return null;

        return JSON.parse(text.substring(start, end + 1));
    } catch (err) {
        console.warn("Groq practice eval failed:", err.message);
        return null;
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { role, difficulty, answers } = body; // answers: [{question, answer}]

        if (!role || !difficulty || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Fetch sample answers from DB (PracticeQuestion) or fall back to static
        const dbQuestions = await PracticeQuestion.find({ role, difficulty, isActive: true }).lean();

        const results = [];
        for (const item of answers) {
            const dbQ = dbQuestions.find(q => q.question === item.question);
            let result = await evaluateWithGroq(item.question, item.answer, role);

            if (!result) {
                // Fallback if AI fails
                result = {
                    score: item.answer?.trim() ? 5 : 0,
                    feedback: item.answer?.trim()
                        ? "Your answer was received but AI evaluation is temporarily unavailable."
                        : "No answer was provided for this question.",
                    improvements: ["Try to elaborate with specific examples", "Structure your answer with clear points"],
                    sampleAnswer: dbQ?.sampleAnswer || "A strong answer for this question would include relevant technical details, practical examples from your experience, and clear concise explanations.",
                };
            }

            // If DB has a sample answer override it
            if (dbQ?.sampleAnswer) result.sampleAnswer = dbQ.sampleAnswer;

            results.push({
                question: item.question,
                yourAnswer: item.answer || "",
                score: result.score,
                feedback: result.feedback,
                improvements: result.improvements || [],
                sampleAnswer: result.sampleAnswer,
            });
        }

        const avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);

        return NextResponse.json({ results, avgScore });
    } catch (err) {
        console.error("Practice evaluate error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
