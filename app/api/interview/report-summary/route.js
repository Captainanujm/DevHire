// AI-powered interview report summary generation
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ summary: "Report summary unavailable — API key not configured." });
    }

    try {
        const { responses, role } = await req.json();
        if (!responses || responses.length === 0) {
            return NextResponse.json({ summary: "No interview data to summarize." });
        }

        const groq = new Groq({ apiKey });

        const breakdown = responses.map((r, i) => {
            const isCode = r.type === "coding" || (r.answer && r.answer.startsWith("[CODE SUBMISSION]"));
            return `Q${i + 1} (${isCode ? "Coding" : "Verbal"}): "${r.question}"
Answer: "${(r.answer || "").substring(0, 200)}"
Score: Tech ${r.technicalScore || 0}/10, Comm ${r.communicationScore || 0}/10, ${r.correctness || "N/A"}`;
        }).join("\n\n");

        const avgTech = (responses.reduce((a, r) => a + (r.technicalScore || 0), 0) / responses.length).toFixed(1);
        const avgComm = (responses.reduce((a, r) => a + (r.communicationScore || 0), 0) / responses.length).toFixed(1);

        const prompt = `You are Nexus, an AI interviewer at DevHire. Write a professional, personalized interview performance report for a candidate who just completed a ${role} interview.

Interview Data:
${breakdown}

Average Scores: Technical ${avgTech}/10, Communication ${avgComm}/10

Write a 3-4 paragraph summary that:
1. Starts with "Hi, this is Nexus from DevHire." 
2. Gives an honest overall assessment of the candidate's performance
3. Highlights their strongest answers and areas that need the most work
4. Provides 2-3 specific, actionable recommendations
5. Ends with an encouraging closing statement

Be professional but warm. Use the candidate's actual answers and scores to make it personalized.
Return ONLY the summary text, no JSON, no markdown headers.`;

        const chat = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 800,
        });

        const summary = chat.choices[0]?.message?.content?.trim();
        if (!summary) throw new Error("Empty response");

        return NextResponse.json({ summary });
    } catch (err) {
        console.error("Report summary error:", err.message);
        return NextResponse.json({ summary: "Nexus was unable to generate a personalized summary at this time. Please review your scores and improvement tips below." });
    }
}
