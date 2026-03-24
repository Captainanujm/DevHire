import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import CodingProblem from "@/models/CodingProblem";

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const problems = await CodingProblem.find({ isActive: true })
            .select("title difficulty description example tags")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ problems });
    } catch (err) {
        console.error("Coding problems fetch error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
