import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RecruiterInterview from "@/models/RecruiterInterview";
import CandidateAttempt from "@/models/CandidateAttempt";

// GET — Cron job to auto-expire interviews and run ranking
// Protected by CRON_SECRET header (set in Vercel Cron config or called manually)
export async function GET(req) {
    try {
        // Verify cron secret
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Find all active interviews that have expired
        const now = new Date();
        const expiredInterviews = await RecruiterInterview.find({
            status: "Active",
            expiresAt: { $lte: now },
        });

        let processed = 0;
        let ranked = 0;

        for (const interview of expiredInterviews) {
            // Mark as expired
            interview.status = "Expired";

            // Run ranking: sort by score DESC, timeTaken ASC
            const attempts = await CandidateAttempt.find({
                interviewId: interview._id,
                status: { $in: ["Submitted", "Pending"] },
            }).sort({ score: -1, timeTaken: 1 });

            if (attempts.length > 0) {
                const selectedIds = [];
                const rejectedIds = [];

                attempts.forEach((attempt, idx) => {
                    if (idx < interview.vacancyCount) {
                        selectedIds.push(attempt._id);
                    } else {
                        rejectedIds.push(attempt._id);
                    }
                });

                // Update selected candidates
                if (selectedIds.length > 0) {
                    await CandidateAttempt.updateMany(
                        { _id: { $in: selectedIds } },
                        { $set: { status: "Selected" } }
                    );
                }

                // Update rejected candidates
                if (rejectedIds.length > 0) {
                    await CandidateAttempt.updateMany(
                        { _id: { $in: rejectedIds } },
                        { $set: { status: "Rejected" } }
                    );
                }

                // Store selected candidates and mark as completed
                interview.selectedCandidates = attempts
                    .slice(0, interview.vacancyCount)
                    .map(a => a.candidateId);
                interview.status = "Completed";
                ranked++;
            }

            await interview.save();
            processed++;
        }

        return NextResponse.json({
            success: true,
            processed,
            ranked,
            timestamp: now.toISOString(),
        });
    } catch (err) {
        console.error("Cron expire-interviews error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
