import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const QuestionSetSchema = new mongoose.Schema({
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questions: [{
        text: String,
        difficulty: String,
        role: String,
    }],
}, { timestamps: true });

const RecruiterQuestionSet = mongoose.models.RecruiterQuestionSet || mongoose.model("RecruiterQuestionSet", QuestionSetSchema);

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        const { questions } = await req.json();

        await connectDB();

        // Upsert: update or create the recruiter's question set
        const result = await RecruiterQuestionSet.findOneAndUpdate(
            { recruiterId: payload.id },
            { recruiterId: payload.id, questions },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, id: result._id });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
    }
}
