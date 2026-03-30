import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { connectDB } from "@/lib/db";
import PracticeQuestion from "@/models/PracticeQuestion";
import CodingProblem from "@/models/CodingProblem";

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
        clean = clean.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
    }

    let parsed;
    const arrayMatch = clean.match(/\[[\s\S]*?\]/);
    if (arrayMatch) {
        parsed = JSON.parse(arrayMatch[0]);
    } else {
        // If AI returned a single object instead of an array, wrap it
        const objMatch = clean.match(/\{[\s\S]*?\}/);
        if (objMatch) {
            parsed = [JSON.parse(objMatch[0])];
        } else {
            throw new Error("AI returned invalid JSON format");
        }
    }

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
        
        console.warn("Both AI APIs failed. Attempting to fetch from Admin Database fallback...");
        
        try {
            await connectDB();
            
            // Try to fetch questions specifically for this role
            let dbQuestions = await PracticeQuestion.find({ role: jobRole, isActive: true }).lean();
            
            // If we have enough for this specific difficulty, narrow it down
            const diffQuestions = dbQuestions.filter(q => q.difficulty === difficulty);
            if (diffQuestions.length >= count) {
                dbQuestions = diffQuestions;
            }

            if (dbQuestions.length > 0) {
                 const shuffleArray = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
                 const shuffled = shuffleArray(dbQuestions);
                 const mapped = [];
                 for (let i = 0; i < count; i++) {
                     const q = shuffled[i % shuffled.length];
                     const isCoding = i === 2 || /implement|code|write a function/i.test(q.question);
                     mapped.push({ question: q.question, type: isCoding ? "coding" : "verbal" });
                 }
                 return mapped;
            }
        } catch (dbErr) {
            console.error("Database fallback failed or empty:", dbErr.message);
        }

        console.warn("Database fallback empty. Returning generic hardcoded fallback questions.");
        
        // Return absolute last-resort dummy questions
        const verbalPool = [
            `Tell me about a time you faced a significant challenge in your work as a ${jobRole} and how you overcame it.`,
            `What are the most important technical skills a ${jobRole} should have, and how have you developed them?`,
            `Describe a project you are most proud of in the ${jobRole} domain. What was your role and what impact did it have?`,
            `How do you stay updated with the latest trends and technologies relevant to a ${jobRole} position?`,
            `Explain a complex technical concept related to ${jobRole} that you recently learned or applied.`,
            `Tell me about a time you had a disagreement with a teammate. How did you handle it and what was the outcome?`,
            `If you were tasked with designing a system from scratch for a ${jobRole} project, what architecture would you choose and why?`,
            `What strategies do you use to debug difficult issues in your ${jobRole} work?`,
            `Describe how you would mentor a junior ${jobRole}. What key lessons would you share?`,
            `What motivates you to pursue a career as a ${jobRole}, and where do you see yourself growing in the next few years?`,
        ];
        const codingPool = [
            `Write a function that reverses a linked list, relevant to core data structures for a ${jobRole}.`,
            `Implement a function to find the two numbers in an array that add up to a given target sum.`,
            `Write a function to check if a given string of brackets is balanced (e.g., "([]{})" is valid).`,
            `Implement a basic LRU cache with get and put operations.`,
            `Write a function that finds the longest substring without repeating characters.`,
        ];

        // Shuffle pools to add variety between different interview sessions
        const shuffleArray = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
        const shuffledVerbal = shuffleArray(verbalPool);
        const shuffledCoding = shuffleArray(codingPool);

        const fallback = [];
        let vIdx = 0;
        let cIdx = 0;
        for (let i = 0; i < count; i++) {
            if (i === 2) {
                fallback.push({ question: shuffledCoding[cIdx % shuffledCoding.length], type: "coding" });
                cIdx++;
            } else {
                fallback.push({ question: shuffledVerbal[vIdx % shuffledVerbal.length], type: "verbal" });
                vIdx++;
            }
        }
        return fallback;
    }
}

export async function generateNextQuestion(jobRole, difficulty, index, previousQuestion, previousAnswer) {
    const isCodingDesired = index === 2; // 3rd question is coding by default
    
    const prompt = `You are a senior technical interviewer for a ${jobRole} role. 
The difficulty level is ${difficulty}.

PREVIOUS QUESTION ASKED:
"${previousQuestion}"

CANDIDATE'S ANSWER:
"${previousAnswer}"

Generate exactly ONE follow-up question. The question should logically follow the candidate's last answer, probing deeper into their response or pivoting to a related concept if their answer was complete.
${isCodingDesired ? 'IMPORTANT: This MUST be a CODING QUESTION (e.g. "Write a function to...", "Implement...").' : 'This should be a VERBAL/TECHNICAL question, NOT a coding question unless absolutely necessary.'}

Return ONLY a JSON array with exactly ONE object containing "question" and "type" ("verbal" or "coding").
Example format:
[
  {"question":"That's a good point. How would you handle...","type":"verbal"}
]`;

    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) await sleep(1000);
            const text = await generateWithGemini(prompt);
            return parseAndValidateQuestions(text, 1);
        } catch (err) {
            console.warn(`Gemini next_q attempt failed: ${err.message}`);
        }
    }

    try {
        const text = await generateWithGroq(prompt);
        return parseAndValidateQuestions(text, 1);
    } catch (err) {
        console.error("Groq next_q failed:", err.message);

        // Attempt to fetch from Admin DB Practice questions
        try {
            await connectDB();
            let dbQuestions = await PracticeQuestion.find({ role: jobRole, isActive: true }).lean();
            if (dbQuestions.length > 0) {
                const q = dbQuestions[Math.floor(Math.random() * dbQuestions.length)];
                return [{
                    question: q.question,
                    type: isCodingDesired ? "coding" : "verbal"
                }];
            }
        } catch (dbErr) {
            console.error("DB Context fallback failed:", dbErr.message);
        }

        // Randomized context questions if AI completely fails
        const fallbackVerbal = [
            `Can you elaborate more on your previous answer? What are some trade-offs?`,
            `That's an interesting approach. Can you provide a real-world example of applying this in a ${jobRole} context?`,
            `How would your approach change if the requirements scaled significantly?`,
            `What are the security or edge-case implications of what you just mentioned?`,
            `Are there alternative tools or methods better suited for this scenario?`,
            `Could you explain how you would test that solution?`
        ];
        const randomVerbal = fallbackVerbal[Math.floor(Math.random() * fallbackVerbal.length)];

        return [{
            question: isCodingDesired 
               ? `Write a robust function or code snippet to demonstrate a concept you mentioned earlier, relevant to a ${jobRole}. Ensure you account for edge cases.`
               : randomVerbal,
            type: isCodingDesired ? "coding" : "verbal"
        }];
    }
}

export async function fetchQuestionsFromDB(jobRole, difficulty, count) {
    try {
        await connectDB();
        
        let codingPool = await CodingProblem.aggregate([
            { $match: { role: jobRole, difficulty, isActive: true } },
            { $sample: { size: 2 } }
        ]);
        if (codingPool.length < 2) {
            codingPool = await CodingProblem.aggregate([
                { $match: { role: jobRole, isActive: true } },
                { $sample: { size: 2 } }
            ]);
        }
        
        let verbalPool = await PracticeQuestion.aggregate([
            { $match: { role: jobRole, difficulty, isActive: true } },
            { $sample: { size: count } }
        ]);
        if (verbalPool.length < count) {
             verbalPool = await PracticeQuestion.aggregate([
                 { $match: { role: jobRole, isActive: true } },
                 { $sample: { size: count } }
             ]);
        }

        const mapped = [];
        let cIdx = 0;
        let vIdx = 0;
        
        for (let i = 0; i < count; i++) {
            // Reserve index 2 and the last index for coding questions, or wherever needed
            const wantsCoding = (i === 2 || i === count - 1 || vIdx >= verbalPool.length);
            
            if (wantsCoding && cIdx < codingPool.length) {
                const q = codingPool[cIdx++];
                let testCasesText = "";
                if (q.testCases && q.testCases.length > 0) {
                    testCasesText = "\n\n[TEST_CASES]\n" + JSON.stringify(q.testCases.map(tc => ({input: tc.input, expected: tc.expectedOutput})));
                }
                mapped.push({ question: q.title + "\n\n" + q.description + testCasesText, type: "coding" });
            } else if (vIdx < verbalPool.length) {
                mapped.push({ question: verbalPool[vIdx++].question, type: "verbal" });
            } else if (cIdx < codingPool.length) {
                const q = codingPool[cIdx++];
                let testCasesText = "";
                if (q.testCases && q.testCases.length > 0) {
                    testCasesText = "\n\n[TEST_CASES]\n" + JSON.stringify(q.testCases.map(tc => ({input: tc.input, expected: tc.expectedOutput})));
                }
                mapped.push({ question: q.title + "\n\n" + q.description + testCasesText, type: "coding" });
            } else {
                mapped.push({ question: "Please explain an advanced concept related to " + jobRole, type: "verbal" });
            }
        }
        
        return mapped;
    } catch (err) {
        console.error("DB Fetch failed:", err.message);
        return [];
    }
}


