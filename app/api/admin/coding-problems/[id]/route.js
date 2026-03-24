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

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const auth = await requireAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const body = await req.json();
        const { title, difficulty, description, example, tags, isActive } = body;

        const problem = await CodingProblem.findByIdAndUpdate(
            id,
            { title, difficulty, description, example, tags, isActive },
            { new: true, runValidators: true }
        );
        if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ problem });
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
        await CodingProblem.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
