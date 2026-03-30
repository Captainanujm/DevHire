import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import CodingProblem from "@/models/CodingProblem";
import CodingStreak from "@/models/CodingStreak";

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const problems = await CodingProblem.find({ isActive: true })
            .select("title difficulty description example tags")
            .sort({ difficulty: 1, createdAt: -1 })
            .lean();

        // Get user's solved problem IDs
        let solvedProblemIds = [];
        const streak = await CodingStreak.findOne({ userId: user.id }).lean();
        if (streak) {
            solvedProblemIds = streak.solvedProblemIds.map(id => id.toString());
        }

        return NextResponse.json({ problems, solvedProblemIds });
    } catch (err) {
        console.error("Coding problems fetch error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
