import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/InterviewSession";
import { getStaticQuestions } from "@/lib/interviewQuestions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        const { role, difficulty, questionIndex, sessionId } = await req.json();

        await connectDB();

        // If sessionId exists, return next question from existing session
        if (sessionId) {
            const session = await InterviewSession.findById(sessionId);
            if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

            if (questionIndex >= session.questions.length) {
                return NextResponse.json({ done: true, sessionId: session._id });
            }

            return NextResponse.json({
                question: session.questions[questionIndex],
                questionIndex,
                total: session.questions.length,
                sessionId: session._id,
            });
        }

        // Create new session with questions
        let questions = [];

        // Try AI-generated questions first
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const randomSeed = Math.random().toString(36).substring(2, 8);
            const prompt = `You are a senior technical interviewer at a top tech company conducting a real interview. Generate exactly 5 unique ${difficulty} level interview questions for a ${role} position.

Session ID: ${randomSeed} (use this to ensure uniqueness)

Rules:
- Each question MUST be different from common/generic questions
- Question 1: A technical question about core ${role} concepts or tools
- Question 2: A behavioral question (e.g., "Tell me about a time when...")
- Question 3: A scenario-based problem solving question
- Question 4: A technical deep-dive or system design question
- Question 5: A question about handling challenges, teamwork, or growth
- ${difficulty === "Easy" ? "Keep questions at entry-level, focusing on fundamentals" : difficulty === "Medium" ? "Include trade-offs, real-world scenarios, and practical knowledge" : "Include advanced system design, complex algorithms, and architectural decisions"}
- Make questions specific to ${role}, not generic
- Questions should require 1-2 minute verbal answers

Return ONLY a valid JSON array of exactly 5 question strings. No markdown, no explanation.
Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

            console.log("Generating AI questions for:", role, difficulty);
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            console.log("AI response:", text.substring(0, 200));

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length >= 3) {
                    questions = parsed;
                    console.log(`Successfully generated ${questions.length} AI questions`);
                }
            }
        } catch (aiError) {
            console.error("AI question generation failed:", aiError.message || aiError);
        }

        // Fallback to static questions
        if (!questions || questions.length === 0) {
            questions = getStaticQuestions(role, difficulty);
        }

        if (questions.length === 0) {
            questions = [
                `Tell me about your experience as a ${role}.`,
                `What are the key skills needed for a ${role}?`,
                `Describe a challenging project you worked on.`,
                `How do you stay updated with the latest technologies?`,
                `Where do you see yourself in 5 years?`,
            ];
        }

        // Create session
        const session = await InterviewSession.create({
            userId: payload.id,
            role,
            difficulty,
            questions,
            answers: [],
            timestamps: { startedAt: new Date() },
        });

        return NextResponse.json({
            sessionId: session._id,
            question: questions[0],
            questionIndex: 0,
            total: questions.length,
        });
    } catch (error) {
        console.error("Interview question error:", error);
        return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
    }
}