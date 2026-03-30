import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing with API Key:", apiKey);
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
    try {
        const result = await model.generateContent("Hello?");
        console.log("Success:", result.response.text());
    } catch (err) {
        console.log("Failed:", err.message);
    }
}
run();
