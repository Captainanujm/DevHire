import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import PracticeQuestion from "@/models/PracticeQuestion";
import { INTERVIEW_ROLES } from "@/lib/interviewQuestions";

async function requireAdmin(req) {
    const user = getUserFromRequest(req);
    if (!user) return { error: "Unauthorized", status: 401 };
    if (user.role !== "admin") return { error: "Forbidden: Admin only", status: 403 };
    return { user };
}

export async function GET(req) {
    try {
        await connectDB();
        const auth = await requireAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const questions = await PracticeQuestion.find({})
            .sort({ role: 1, difficulty: 1, createdAt: -1 })
            .lean();
        return NextResponse.json({ questions });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const auth = await requireAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const body = await req.json();
        const { role, difficulty, question, sampleAnswer } = body;
        if (!role || !difficulty || !question) {
            return NextResponse.json({ error: "role, difficulty, question are required" }, { status: 400 });
        }

        const q = await PracticeQuestion.create({
            role: role.trim(),
            difficulty,
            question: question.trim(),
            sampleAnswer: sampleAnswer?.trim() || "",
            isActive: true,
            createdBy: auth.user.id,
        });

        return NextResponse.json({ question: q }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
