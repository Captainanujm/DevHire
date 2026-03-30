import mongoose from "mongoose";

const CodingStreakSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date, default: null },
    solvedProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CodingProblem" }],
    // Track which dates the user solved POTD (for calendar visualization)
    potdSolvedDates: [{ type: Date }],
}, { timestamps: true });

export default mongoose.models.CodingStreak || mongoose.model("CodingStreak", CodingStreakSchema);
