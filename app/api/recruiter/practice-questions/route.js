import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import PracticeQuestion from "@/models/PracticeQuestion";

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "recruiter") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");

        const query = { isActive: true };
        if (role) query.role = role;

        const questions = await PracticeQuestion.find(query).lean();
        return NextResponse.json({ questions });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
