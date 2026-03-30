import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GROQ_API_KEY;
console.log("Testing with Groq API Key:", apiKey);
const groq = new Groq({ apiKey });

async function run() {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello?" }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 10,
        });
        console.log("Success:", chat.choices[0]?.message?.content);
    } catch (err) {
        console.log("Failed:", err.message);
    }
}
run();
