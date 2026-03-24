import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(jobRole, difficulty, count) {
    return `You are a senior technical interviewer. Generate exactly ${count} unique ${difficulty}-level interview questions for a ${jobRole} role. 

Structure (follow EXACTLY):
1. Behavioral question ("Tell me about a time when...")
2. Technical concept question (explain a concept, compare tools, trade-offs)
3. CODING QUESTION - a specific coding/DSA problem the candidate must solve by writing code (e.g., implement a function, solve an algorithm, write a data structure). Start with "Write a function" or "Implement" or "Code a solution"
${count > 3 ? "4. System design or architecture question" : ""}
${count > 4 ? "5. Question about growth, challenges, or teamwork" : ""}
${count > 5 ? "6. Add more technical or behavioral questions to reach the required count" : ""}

Difficulty Guidance: 
${difficulty === "Easy" ? "Entry-level fundamentals, easy coding problems." : difficulty === "Medium" ? "Intermediate with real-world scenarios, medium data structures algorithms." : "Advanced system design and complex algorithms."}

IMPORTANT: Return ONLY a JSON array of objects, each with "question" (string) and "type" (either "verbal" or "coding").
Question 3 MUST be type "coding". The rest should be type "verbal" unless specifically asking for code.

Return ONLY valid JSON. No markdown formatting, no code blocks, no extra text.
Example format: 
[
  {"question":"Tell me about a time...","type":"verbal"},
  {"question":"Explain the difference between...","type":"verbal"},
  {"question":"Write a function that reverses a linked list...","type":"coding"}
]`;
}

function parseAndValidateQuestions(text, count) {
    let clean = text.trim();
    if (clean.startsWith("```")) {
        clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const match = clean.match(/\[[\s\S]*?\]/);
    if (!match) throw new Error("AI returned invalid JSON format");

    let parsed = JSON.parse(match[0]);

    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("AI returned empty or invalid questions format");
    }

    // Ensure we have exactly the requested count
    if (parsed.length > count) {
        parsed = parsed.slice(0, count);
    }

    // Normalize: ensure each item has question and type
    return parsed.map((item, i) => {
        if (typeof item === "string") {
            const isCoding = i === 2 || /\b(write a function|implement|code a solution|write code|write a program|solve the following|given an array|given a string|return the|algorithm)\b/i.test(item);
            return { question: item, type: isCoding ? "coding" : "verbal" };
        }
        const q = item.question || item.q || item.text || String(item);
        const t = (item.type === "coding" || i === 2) ? "coding" : "verbal";
        return { question: q, type: t };
    });
}

async function generateWithGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function generateWithGroq(prompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured.");
    }

    const groq = new Groq({ apiKey });
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are an expert technical interviewer. Return ONLY valid JSON arrays, no markdown, no extra text.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 4096,
    });

    return chatCompletion.choices[0]?.message?.content || "";
}

export async function generateInterviewQuestions(jobRole, difficulty, count) {
    const prompt = buildPrompt(jobRole, difficulty, count);

    // Try Gemini with retry + exponential backoff
    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Gemini retry ${attempt}/${MAX_RETRIES}, waiting ${delay}ms...`);
                await sleep(delay);
            }

            const text = await generateWithGemini(prompt);
            return parseAndValidateQuestions(text, count);
        } catch (err) {
            lastError = err;
            const msg = err.message || "";
            console.warn(`Gemini attempt ${attempt + 1} failed: ${msg}`);

            // Only retry on rate limit / quota errors
            if (!msg.includes("quota") && !msg.includes("rate") && !msg.includes("429") && !msg.includes("Resource has been exhausted")) {
                if (msg.includes("JSON")) continue; // JSON parse error — retry once
                break; // Other errors — go to fallback immediately
            }
        }
    }

    // Fallback to Groq
    console.log("Gemini failed after retries, falling back to Groq...");
    try {
        const text = await generateWithGroq(prompt);
        return parseAndValidateQuestions(text, count);
    } catch (groqErr) {
        console.error("Groq fallback also failed:", groqErr.message);
        
        console.warn("Both AI APIs failed. Returning generic fallback questions for testing purposes.");
        
        // Return fallback dummy questions so the user can keep testing the platform
        const fallback = [];
        for (let i = 0; i < count; i++) {
            if (i === 2) {
                fallback.push({ question: `Write a function or algorithm to solve a core problem related to ${jobRole}.`, type: "coding" });
            } else {
                fallback.push({ question: `Can you explain a key concept or past experience relevant to ${jobRole}?`, type: "verbal" });
            }
        }
        return fallback;
    }
}
