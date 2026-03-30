import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import CodingProblem from "@/models/CodingProblem";
import CodingStreak from "@/models/CodingStreak";

// Same deterministic seed as POTD route
function getTodaysSeed() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export async function POST(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { problemId } = await req.json();
        if (!problemId) {
            return NextResponse.json({ error: "problemId is required" }, { status: 400 });
        }

        // Verify problem exists
        const problem = await CodingProblem.findById(problemId);
        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 });
        }

        // Get or create streak record
        let streak = await CodingStreak.findOne({ userId: user.id });
        if (!streak) {
            streak = await CodingStreak.create({
                userId: user.id,
                currentStreak: 0,
                longestStreak: 0,
                solvedProblemIds: [],
                potdSolvedDates: [],
            });
        }

        // Add to solved list if not already solved
        const alreadySolved = streak.solvedProblemIds.some(
            id => id.toString() === problemId
        );
        if (!alreadySolved) {
            streak.solvedProblemIds.push(problemId);
        }

        // Check if this is today's POTD
        const problems = await CodingProblem.find({ isActive: true }).lean();
        const seed = getTodaysSeed();
        const index = hashString(seed) % problems.length;
        const todaysPotd = problems[index];

        const isPotd = todaysPotd._id.toString() === problemId;

        if (isPotd) {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            // Check if already solved today's POTD
            const alreadySolvedToday = streak.potdSolvedDates?.some(d => {
                const sd = new Date(d);
                sd.setUTCHours(0, 0, 0, 0);
                return sd.getTime() === today.getTime();
            });

            if (!alreadySolvedToday) {
                // Record the solve date
                streak.potdSolvedDates.push(new Date());

                // Calculate streak
                const yesterday = new Date(today);
                yesterday.setUTCDate(yesterday.getUTCDate() - 1);

                const lastSolved = streak.lastSolvedDate ? new Date(streak.lastSolvedDate) : null;
                if (lastSolved) {
                    lastSolved.setUTCHours(0, 0, 0, 0);
                }

                if (lastSolved && lastSolved.getTime() === yesterday.getTime()) {
                    // Consecutive day — increment streak
                    streak.currentStreak += 1;
                } else if (lastSolved && lastSolved.getTime() === today.getTime()) {
                    // Already counted today — no change
                } else {
                    // Streak broken or first solve — reset to 1
                    streak.currentStreak = 1;
                }

                streak.lastSolvedDate = new Date();
                if (streak.currentStreak > streak.longestStreak) {
                    streak.longestStreak = streak.currentStreak;
                }
            }
        }

        await streak.save();

        return NextResponse.json({
            success: true,
            isPotd,
            streak: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                solvedCount: streak.solvedProblemIds.length,
            },
        });
    } catch (err) {
        console.error("Solve error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
