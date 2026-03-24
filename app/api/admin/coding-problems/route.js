import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import CodingProblem from "@/models/CodingProblem";

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

        const problems = await CodingProblem.find({})
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ problems });
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
        const { title, difficulty, description, example, tags } = body;
        if (!title || !difficulty || !description) {
            return NextResponse.json({ error: "title, difficulty, description are required" }, { status: 400 });
        }

        const problem = await CodingProblem.create({
            title: title.trim(),
            difficulty,
            description: description.trim(),
            example: example?.trim() || "",
            tags: Array.isArray(tags) ? tags : [],
            isActive: true,
            createdBy: auth.user.id,
        });

        return NextResponse.json({ problem }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
