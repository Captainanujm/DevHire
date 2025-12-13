export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    // ⚠️ FIX: Use secure server-side variable name
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ SCORE API: GEMINI_API_KEY is not set.");
        return NextResponse.json(
            { error: "API Key Missing. Cannot evaluate answer." },
            { status: 500 }
        );
    }

    try {
        const { question, answer, role } = await req.json();

        const genAI = new GoogleGenerativeAI(apiKey);

        // ⚠️ FIX: Correct model name format - MUST include "models/" prefix
        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash"
        });

        const prompt = `
You are an interview evaluator AI.

Evaluate the following user answer strictly:

QUESTION: ${question}

ANSWER: ${answer}

ROLE: ${role}

Return a JSON EXACTLY in this format:

{
  "correctness": "Correct / Partially Correct / Incorrect",
  "technicalScore": 0-10,
  "communicationScore": 0-10,
  "grammarIssues": ["issue1", "issue2"],
  "fillerWords": ["um", "uh", "..."],
  "missingPoints": ["point1", "point2"],
  "improvement": "actionable improvement text"
}
ONLY return pure JSON. No explanation.
`;

        const result = await model.generateContent(prompt);
        let txt = result.response.text().trim();

        // Robust JSON parsing (handles markdown wrappers)
        if (txt.startsWith("```json")) {
            txt = txt.substring(7);
        }
        if (txt.endsWith("```")) {
            txt = txt.substring(0, txt.length - 3);
        }
        
        const jsonStart = txt.indexOf("{");
        const jsonEnd = txt.lastIndexOf("}");
        const cleanJson = txt.substring(jsonStart, jsonEnd + 1);

        const score = JSON.parse(cleanJson);

        return NextResponse.json(score);
    } catch (error) {
        console.error("❌ Score API Runtime Error:", error);
        
        // Return structured error response
        return NextResponse.json(
            { 
                correctness: "Error",
                technicalScore: 0,
                communicationScore: 0,
                grammarIssues: ["Evaluation API failed."],
                fillerWords: [],
                missingPoints: ["Could not score due to API error."],
                improvement: "Failed to evaluate answer. Check backend logs."
            },
            { status: 500 }
        );
    }
}