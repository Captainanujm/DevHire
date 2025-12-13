// Remove these two lines:
// import dotenv from 'dotenv';
// dotenv.config(); 

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ FIX 1: Use the secure server-side variable name: GEMINI_API_KEY
// Assuming the user has GEMINI_API_KEY set in .env.local
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
  // This error log is correct, but the variable name in .env.local must match
  console.error("❌ GEMINI_API_KEY is missing in env. Check .env.local.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Ensure runtime is set if you are mixing APIs/environments
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { role, difficulty, askedQuestions = [] } = body;

    if (!role || !difficulty) {
      return NextResponse.json(
        { error: "role and difficulty are required" },
        { status: 400 }
      );
    }

    if (!genAI) {
      // fallback if api key not set - ensures client doesn't hang
      return NextResponse.json({
        question: `Tell me about your experience with ${role}. (Using fallback: Check server for missing API key)`,
      });
    }

    // ⚠️ FIX 2: Correct model name format - MUST include "models/" prefix
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const previous =
      askedQuestions.length > 0
        ? `Avoid asking anything similar to: ${askedQuestions
            .map((q) => `"${q}"`)
            .join(", ")}.`
        : "";

    const prompt = `
You are a technical interviewer.
Generate ONE clear interview question for a candidate applying for the role "${role}".
Difficulty level: ${difficulty}.

${previous}

Return ONLY the question text. No numbering, no quotation marks, no explanation.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^["'\-*\d.\s]+/, "").trim();

    return NextResponse.json({ question: cleaned || text });
  } catch (err) {
    console.error("Question API error:", err);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}