import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import PracticeQuestion from "@/models/PracticeQuestion";

async function requireAdmin(req) {
    const user = getUserFromRequest(req);
    if (!user) return { error: "Unauthorized", status: 401 };
    if (user.role !== "admin") return { error: "Forbidden: Admin only", status: 403 };
    return { user };
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const auth = await requireAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const body = await req.json();
        const { role, difficulty, question, sampleAnswer, isActive } = body;

        const q = await PracticeQuestion.findByIdAndUpdate(
            id,
            { role, difficulty, question, sampleAnswer, isActive },
            { new: true, runValidators: true }
        );
        if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ question: q });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const auth = await requireAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        await PracticeQuestion.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
