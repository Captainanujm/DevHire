import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import CodingProblem from "@/models/CodingProblem";
import CodingStreak from "@/models/CodingStreak";

// Deterministic POTD: use today's date as seed to pick a consistent problem for the day
function getTodaysSeed() {
    const now = new Date();
    // Normalize to date only (UTC) so it's consistent for the whole day
    return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get all active problems
        const problems = await CodingProblem.find({ isActive: true }).lean();
        if (!problems.length) {
            return NextResponse.json({ error: "No problems available" }, { status: 404 });
        }

        // Pick today's problem deterministically
        const seed = getTodaysSeed();
        const index = hashString(seed) % problems.length;
        const potd = problems[index];

        // Get user's streak info
        let streak = await CodingStreak.findOne({ userId: user.id }).lean();
        if (!streak) {
            streak = {
                currentStreak: 0,
                longestStreak: 0,
                lastSolvedDate: null,
                solvedProblemIds: [],
                potdSolvedDates: [],
            };
        }

        // Check if user already solved today's POTD
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const solvedToday = streak.potdSolvedDates?.some(d => {
            const sd = new Date(d);
            sd.setUTCHours(0, 0, 0, 0);
            return sd.getTime() === today.getTime();
        }) || false;

        return NextResponse.json({
            potd: {
                _id: potd._id,
                title: potd.title,
                difficulty: potd.difficulty,
                description: potd.description,
                example: potd.example,
                tags: potd.tags,
            },
            streak: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                lastSolvedDate: streak.lastSolvedDate,
                solvedToday,
                // Last 7 days of POTD solves for calendar dots
                recentDates: (streak.potdSolvedDates || [])
                    .map(d => new Date(d).toISOString().split("T")[0])
                    .slice(-30),
            },
        });
    } catch (err) {
        console.error("POTD fetch error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
