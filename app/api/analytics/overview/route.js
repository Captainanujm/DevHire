import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewSession from "@/models/InterviewSession";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        await connectDB();

        const sessions = await InterviewSession.find({ userId: payload.id, status: "completed" })
            .sort({ createdAt: -1 })
            .limit(20);

        const totalInterviews = sessions.length;
        const avgScore = totalInterviews > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.scoreSummary?.overall || 0), 0) / totalInterviews)
            : 0;

        // Calculate streak (consecutive days)
        let streak = 0;
        if (sessions.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let checkDate = new Date(today);

            for (let i = 0; i < 30; i++) {
                const dayStart = new Date(checkDate);
                const dayEnd = new Date(checkDate);
                dayEnd.setDate(dayEnd.getDate() + 1);

                const hasSession = sessions.some((s) => {
                    const d = new Date(s.createdAt);
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

        // Practice time in hours
        const practiceTime = sessions.reduce((sum, s) => {
            const start = new Date(s.timestamps?.startedAt || s.createdAt);
            const end = new Date(s.timestamps?.endedAt || s.updatedAt || s.createdAt);
            return sum + (end - start) / 3600000;
        }, 0);

        // Score history for charts
        const scoreHistory = sessions.slice(0, 10).reverse().map((s) => ({
            date: s.createdAt,
            technical: s.scoreSummary?.technical || 0,
            communication: s.scoreSummary?.communication || 0,
            overall: s.scoreSummary?.overall || 0,
            role: s.role,
        }));

        // Interviews list
        const interviews = sessions.map((s) => ({
            id: s._id,
            role: s.role,
            difficulty: s.difficulty,
            date: s.createdAt,
            score: s.scoreSummary?.overall || 0,
            technical: s.scoreSummary?.technical || 0,
            communication: s.scoreSummary?.communication || 0,
        }));

        return NextResponse.json({
            totalInterviews,
            avgScore,
            streak,
            practiceTime: Math.round(practiceTime * 10) / 10,
            scoreHistory,
            interviews,
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
