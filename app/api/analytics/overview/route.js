import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/InterviewSession";
import CandidateAttempt from "@/models/CandidateAttempt";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        await connectDB();

        const sessions = await InterviewSession.find({ userId: payload.id, status: "completed" }).lean();
        const recruiterAttempts = await CandidateAttempt.find({ candidateId: payload.id, status: "Submitted" })
            .populate("interviewId", "jobRole difficulty")
            .lean();

        let allInterviews = [];

        for (const s of sessions) {
            allInterviews.push({
                _id: s._id,
                date: s.createdAt,
                role: s.role || "Practice Interview",
                difficulty: s.difficulty || "Mixed",
                overall: s.scoreSummary?.overall || 0,
                technical: s.scoreSummary?.technical || 0,
                communication: s.scoreSummary?.communication || 0,
                startedAt: s.timestamps?.startedAt || s.createdAt,
                endedAt: s.timestamps?.endedAt || s.updatedAt || s.createdAt,
                isPractice: true
            });
        }

        for (const a of recruiterAttempts) {
            allInterviews.push({
                _id: a._id,
                date: a.submittedAt || a.updatedAt || a.createdAt,
                role: a.interviewId?.jobRole || "Recruiter Interview",
                difficulty: a.interviewId?.difficulty || "-",
                overall: a.overallScore || 0,
                technical: a.technicalScore || 0,
                communication: a.communicationScore || 0,
                startedAt: a.startedAt || a.createdAt,
                endedAt: a.submittedAt || a.updatedAt || a.createdAt,
                isPractice: false
            });
        }

        // Sort descending by date
        allInterviews.sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalInterviews = allInterviews.length;
        const avgScore = totalInterviews > 0
            ? Math.round(allInterviews.reduce((sum, int) => sum + int.overall, 0) / totalInterviews)
            : 0;

        let streak = 0;
        if (allInterviews.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let checkDate = new Date(today);

            for (let i = 0; i < 30; i++) {
                const dayStart = new Date(checkDate);
                const dayEnd = new Date(checkDate);
                dayEnd.setDate(dayEnd.getDate() + 1);

                const hasSession = allInterviews.some((int) => {
                    const d = new Date(int.date);
                    return d >= dayStart && d < dayEnd;
                });

                if (hasSession) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        const practiceTime = allInterviews.reduce((sum, int) => {
            const start = new Date(int.startedAt);
            const end = new Date(int.endedAt);
            return sum + (end - start) / 3600000;
        }, 0);

        const scoreHistory = allInterviews.slice(0, 10).reverse().map((int) => ({
            date: int.date,
            technical: int.technical,
            communication: int.communication,
            overall: int.overall,
            role: int.role,
        }));

        const interviews = allInterviews.map((int) => ({
            id: int._id,
            role: int.role,
            difficulty: int.difficulty,
            date: int.date,
            score: int.overall,
            technical: int.technical,
            communication: int.communication,
            isPractice: int.isPractice
        }));

        return NextResponse.json({
            totalInterviews,
            avgScore,
            streak,
            practiceTime: Math.max(0, Math.round(practiceTime * 10) / 10),
            scoreHistory,
            interviews: interviews.slice(0, 20),
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({
            totalInterviews: 0,
            avgScore: 0,
            streak: 0,
            practiceTime: 0,
            scoreHistory: [],
            interviews: [],
        });
    }
}
