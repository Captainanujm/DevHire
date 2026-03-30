import mongoose from "mongoose";
import CandidateAttempt from "./models/CandidateAttempt.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

async function run() {
    await connectDB();
    const attempts = await CandidateAttempt.find({ status: "Submitted" }).select("overallScore answers totalQuestions violations timeTaken interviewId").lean();
    fs.writeFileSync("db_output.json", JSON.stringify(attempts, null, 2), "utf8");
    process.exit(0);
}
run();
