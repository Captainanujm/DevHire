// AI question generation with coding question detection
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

async function generateWithGroq(role, difficulty, seed) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const groq = new Groq({ apiKey });

    const prompt = `You are a senior technical interviewer. Generate exactly 5 unique ${difficulty}-level interview questions for a ${role} role. Session: ${seed}

Structure (follow EXACTLY):
1. Behavioral question ("Tell me about a time when...")
2. Technical concept question (explain a concept, compare tools, trade-offs)
3. CODING QUESTION - a specific coding/DSA problem the candidate must solve by writing code (e.g., implement a function, solve an algorithm, write a data structure). Start with "Write a function" or "Implement" or "Code a solution"
4. System design or architecture question
5. Question about growth, challenges, or teamwork

Difficulty: ${difficulty === "Easy" ? "Entry-level fundamentals" : difficulty === "Medium" ? "Intermediate with real-world scenarios" : "Advanced system design and complex algorithms"}

IMPORTANT: Return a JSON array of objects, each with "question" (string) and "type" (either "verbal" or "coding").
Questions 1,2,4,5 should be type "verbal". Question 3 MUST be type "coding".

Return ONLY valid JSON. No markdown, no code blocks.
Example: [{"question":"Tell me about...","type":"verbal"},{"question":"Write a function that...","type":"coding"}]`;

    const chat = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
        max_tokens: 1500,
    });

    const text = chat.choices[0]?.message?.content?.trim();
    if (!text) return null;

    const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const match = clean.match(/\[[\s\S]*?\]/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed) || parsed.length < 3) return null;

    // Normalize: ensure each item has question and type
    return parsed.map((item) => {
        if (typeof item === "string") {
            const isCoding = /\b(write a function|implement|code a solution|write code|write a program|solve the following|given an array|given a string|return the|algorithm)\b/i.test(item);
            return { question: item, type: isCoding ? "coding" : "verbal" };
        }
        const q = item.question || item.q || item.text || String(item);
        const t = item.type === "coding" ? "coding" : "verbal";
        return { question: q, type: t };
    });
}

async function generateWithGemini(role, difficulty, seed) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 5 ${difficulty} interview questions for ${role}. Session: ${seed}. Question 3 must be a coding/DSA problem. Return JSON array of objects with "question" and "type" ("verbal" or "coding"). No markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed) || parsed.length < 3) return null;

    return parsed.map((item) => {
        if (typeof item === "string") {
            return { question: item, type: "verbal" };
        }
        return { question: item.question || String(item), type: item.type === "coding" ? "coding" : "verbal" };
    });
}

export async function POST(req) {
    try {
        const { role, difficulty } = await req.json();
        if (!role || !difficulty) {
            return NextResponse.json({ error: "Role and difficulty required" }, { status: 400 });
        }

        const seed = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

        // Try Groq first
        try {
            const questions = await generateWithGroq(role, difficulty, seed);
            if (questions) {
                console.log(`✅ Groq: ${questions.length} questions (${questions.filter(q => q.type === "coding").length} coding)`);
                return NextResponse.json({ questions, provider: "groq" });
            }
        } catch (err) {
            console.warn("Groq failed:", err.message?.substring(0, 100));
        }

        // Fallback to Gemini
        try {
            const questions = await generateWithGemini(role, difficulty, seed);
            if (questions) {
                console.log(`✅ Gemini: ${questions.length} questions`);
                return NextResponse.json({ questions, provider: "gemini" });
            }
        } catch (err) {
            console.warn("Gemini failed:", err.message?.substring(0, 100));
        }

        return NextResponse.json({ error: "AI providers unavailable" }, { status: 500 });
    } catch (error) {
        console.error("❌ Question API Error:", error.message);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
