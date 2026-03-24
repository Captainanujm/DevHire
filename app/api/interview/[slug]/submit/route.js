import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";
import Groq from "groq-sdk";

// AI Scoring functions identical to /api/interview/score
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

Return a JSON object:
{
  "technicalScore": number 0-10 (based on correctness, efficiency, quality),
  "communicationScore": number 0-10 (code readability, naming, structure),
  "feedback": "Specific advice on how to improve this solution (max 3 sentences)"
}

Return ONLY valid JSON. No markdown.`;
    }

    return `You are a senior interview evaluator. Score this interview answer.

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}
ROLE: ${role || "Software Developer"}

Evaluate the answer.
Return a JSON object:
{
  "technicalScore": number 0-10,
  "communicationScore": number 0-10,
  "feedback": "One paragraph of specific, constructive feedback"
}

Be fair and constructive. Return ONLY valid JSON. No markdown.`;
}

async function scoreWithGroq(question, answer, role, type) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
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

        const score = JSON.parse(text.substring(start, end + 1));
        return {
            technicalScore: Math.min(10, Math.max(0, Number(score.technicalScore) || 0)),
            communicationScore: Math.min(10, Math.max(0, Number(score.communicationScore) || 0)),
            feedback: score.feedback || "Feedback unavailable.",
        };
    } catch (err) {
         console.warn("Groq scoring failed for question:", err.message);
         return null;
    }
}

// POST — Submit interview answers
export async function POST(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { slug } = await params;
        const interview = await RecruiterInterview.findOne({ slug });
        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        const attempt = await CandidateAttempt.findOne({
            interviewId: interview._id,
            candidateId: user.id,
            status: "InProgress",
        });

        if (!attempt) {
            return NextResponse.json({ error: "No active attempt found" }, { status: 400 });
        }

        const body = await req.json();
        const { answers, violations = 0 } = body;

        const now = new Date();
        const timeTaken = Math.floor((now - new Date(attempt.startedAt)) / 1000);

        // Grade answers using AI
        let totalTechScore = 0;
        let totalCommScore = 0;
        const gradedAnswers = [];

        if (Array.isArray(answers)) {
            // Process sequentially to respect AI rate limits
            for (const ans of answers) {
                const originalQIndex = parseInt(ans.questionIndex);
                if (originalQIndex >= 0 && originalQIndex < interview.questions.length) {
                    const questionObj = interview.questions[originalQIndex];
                    const transcript = ans.transcript || "No answer provided";
                    const isCoding = ans.type === "coding";

                    let technicalScore = 0;
                    let communicationScore = 0;
                    let feedback = "No answer was provided.";

                    if (transcript && transcript !== "No answer provided") {
                        // Score with AI
                        const scoreData = await scoreWithGroq(questionObj.question, transcript, interview.jobRole, isCoding ? "coding" : "verbal");
                        
                        if (scoreData) {
                            technicalScore = scoreData.technicalScore;
                            communicationScore = scoreData.communicationScore;
                            feedback = scoreData.feedback;
                        } else {
                            feedback = "AI scoring temporarily unavailable.";
                        }
                    }

                    totalTechScore += technicalScore;
                    totalCommScore += communicationScore;

                    gradedAnswers.push({
                        questionIndex: originalQIndex,
                        type: ans.type || (isCoding ? "coding" : "verbal"),
                        transcript,
                        technicalScore,
                        communicationScore,
                        feedback,
                        fillerWords: ans.fillerWords || {},
                    });
                }
            }
        }

        const maxTotalScore = interview.questions.length * 10;
        // Overall score is an average of technical and communication (equally weighted for now)
        const overallScore = Math.round(((totalTechScore + totalCommScore) / (maxTotalScore * 2)) * 100) || 0;

        // Update attempt
        attempt.answers = gradedAnswers;
        attempt.technicalScore = totalTechScore;
        attempt.communicationScore = totalCommScore;
        attempt.overallScore = overallScore;
        attempt.timeTaken = timeTaken;
        attempt.violations = violations;
        attempt.submittedAt = now;
        attempt.status = "Submitted";
        await attempt.save();

        // Update total attempts count
        await RecruiterInterview.updateOne(
            { _id: interview._id },
            { $inc: { totalAttempts: 1 } }
        );

        return NextResponse.json({
            success: true,
            technicalScore: totalTechScore,
            communicationScore: totalCommScore,
            overallScore,
            timeTaken: attempt.timeTaken,
            totalQuestions: interview.questions.length,
        });
    } catch (err) {
        console.error("Submit attempt error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
