import mongoose from "mongoose";

const InterviewSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    difficulty: { type: String, required: true },
    questions: [{ type: String }],
    answers: [{
        questionIndex: Number,
        text: String,
        timestamp: { type: Date, default: Date.now },
        duration: Number, // seconds spent on this answer
    }],
    timestamps: {
        startedAt: { type: Date, default: Date.now },
        endedAt: Date,
    },
    scoreSummary: {
        technical: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        overall: { type: Number, default: 0 },
        wpm: { type: Number, default: 0 },
        fillerCount: { type: Number, default: 0 },
        keywordMatches: { type: Number, default: 0 },
        depthScore: { type: Number, default: 0 },
        feedback: { type: String, default: "" },
        improvements: [{ type: String }],
    },
    status: { type: String, enum: ["in-progress", "completed", "abandoned"], default: "in-progress" },
}, { timestamps: true });

export default mongoose.models.InterviewSession || mongoose.model("InterviewSession", InterviewSessionSchema);
