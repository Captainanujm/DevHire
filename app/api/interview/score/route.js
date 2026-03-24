// AI answer/code scoring — handles both verbal and coding questions
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

function getPrompt(question, answer, role, type) {
    if (type === "coding" || answer.startsWith("[CODE SUBMISSION]")) {
        const codeOnly = answer.replace("[CODE SUBMISSION]", "").trim();
        return `You are a senior coding interview evaluator. Evaluate this code submission.

PROBLEM: ${question}
CANDIDATE'S CODE:
\`\`\`
${codeOnly}
\`\`\`
ROLE: ${role || "Software Developer"}

Evaluate the code for:
- Correctness: Does it solve the problem?
- Time/Space complexity
- Code quality, naming, readability
- Edge case handling

Return a JSON object:
{
  "correctness": "Correct" or "Partially Correct" or "Incorrect",
  "technicalScore": number 0-10 (based on correctness, efficiency, quality),
  "communicationScore": number 0-10 (code readability, naming, structure),
  "grammarIssues": ["code issues like bugs, edge cases missed"],
  "fillerWords": [],
  "missingPoints": ["optimizations or edge cases missed"],
  "improvement": "Specific advice on how to improve this solution"
}

Return ONLY valid JSON. No markdown.`;
    }

    return `You are a senior interview evaluator. Score this interview answer.

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}
ROLE: ${role || "Software Developer"}

Return a JSON object:
{
  "correctness": "Correct" or "Partially Correct" or "Incorrect",
  "technicalScore": number 0-10,
  "communicationScore": number 0-10,
  "grammarIssues": ["grammar issues, or empty array"],
  "fillerWords": ["filler words like um, uh, like"],
  "missingPoints": ["key points missed"],
  "improvement": "One paragraph of specific, actionable advice"
}

Be fair and constructive. Return ONLY valid JSON. No markdown.`;
}

async function scoreWithGroq(question, answer, role, type) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const groq = new Groq({ apiKey });
    const chat = await groq.chat.completions.create({
        messages: [{ role: "user", content: getPrompt(question, answer, role, type) }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 1024,
    });

    let text = chat.choices[0]?.message?.content?.trim();
    if (!text) return null;

    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    return JSON.parse(text.substring(start, end + 1));
}

async function scoreWithGemini(question, answer, role, type) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(getPrompt(question, answer, role, type));
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    return JSON.parse(text.substring(start, end + 1));
}

function validateScore(score) {
    return {
        correctness: score.correctness || "N/A",
        technicalScore: Math.min(10, Math.max(0, Number(score.technicalScore) || 0)),
        communicationScore: Math.min(10, Math.max(0, Number(score.communicationScore) || 0)),
        grammarIssues: Array.isArray(score.grammarIssues) ? score.grammarIssues : [],
        fillerWords: Array.isArray(score.fillerWords) ? score.fillerWords : [],
        missingPoints: Array.isArray(score.missingPoints) ? score.missingPoints : [],
        improvement: score.improvement || "No feedback available.",
    };
}

export async function POST(req) {
    try {
        const { question, answer, role, type } = await req.json();

        if (!question || !answer || answer === "No answer provided") {
            return NextResponse.json(validateScore({
                correctness: "No Answer", technicalScore: 0, communicationScore: 0,
                improvement: "No answer was provided.",
            }));
        }

        // Try Groq first
        try {
            const score = await scoreWithGroq(question, answer, role, type);
            if (score) {
                console.log(`✅ Groq score: Tech=${score.technicalScore}, Comm=${score.communicationScore}`);
                return NextResponse.json(validateScore(score));
            }
        } catch (err) {
            console.warn("Groq scoring failed:", err.message?.substring(0, 100));
        }

        // Fallback to Gemini
        try {
            const score = await scoreWithGemini(question, answer, role, type);
            if (score) {
                console.log(`✅ Gemini score: Tech=${score.technicalScore}, Comm=${score.communicationScore}`);
                return NextResponse.json(validateScore(score));
            }
        } catch (err) {
            console.warn("Gemini scoring failed:", err.message?.substring(0, 100));
        }

        return NextResponse.json(validateScore({
            correctness: "Error", technicalScore: 0, communicationScore: 0,
            grammarIssues: ["AI scoring temporarily unavailable"],
            improvement: "Scoring system temporarily unavailable.",
        }));

    } catch (error) {
        console.error("❌ Score API Error:", error.message);
        return NextResponse.json(validateScore({
            correctness: "Error", technicalScore: 0, communicationScore: 0,
            improvement: "Server error occurred.",
        }), { status: 500 });
    }
}