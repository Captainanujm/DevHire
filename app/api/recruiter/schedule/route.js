import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

// InterviewSchedule schema inline
const ScheduleSchema = new mongoose.Schema({
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    candidateEmail: String,
    role: String,
    date: String,
    time: String,
    notes: String,
    status: { type: String, default: "scheduled" },
}, { timestamps: true });

const InterviewSchedule = mongoose.models.InterviewSchedule || mongoose.model("InterviewSchedule", ScheduleSchema);

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        const body = await req.json();

        await connectDB();
        const schedule = await InterviewSchedule.create({
            recruiterId: payload.id,
            ...body,
        });

        return NextResponse.json({ success: true, id: schedule._id });
    } catch (error) {
        return NextResponse.json({ error: "Failed to schedule" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        await connectDB();

        const schedules = await InterviewSchedule.find({ recruiterId: payload.id })
            .sort({ date: -1 })
            .limit(50);

        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
