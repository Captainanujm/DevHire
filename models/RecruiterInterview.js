import mongoose from "mongoose";

const RecruiterInterviewSchema = new mongoose.Schema({
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, unique: true, required: true },
    jobRole: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    numberOfQuestions: { type: Number, required: true, min: 1, max: 50 },
    questions: [{
        question: { type: String, required: true },
        type: { type: String, enum: ["verbal", "coding"], default: "verbal" },
    }],
    vacancyCount: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Expired", "Completed"], default: "Active" },
    selectedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    totalAttempts: { type: Number, default: 0 },
    interviewType: { type: String, enum: ["Automated", "Manual"], default: "Automated" },
    targetCandidate: {
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
    },
    dailyRoomUrl: { type: String },
}, { timestamps: true });

RecruiterInterviewSchema.index({ slug: 1 });
RecruiterInterviewSchema.index({ recruiterId: 1 });
RecruiterInterviewSchema.index({ expiresAt: 1, status: 1 });

export default mongoose.models.RecruiterInterview || mongoose.model("RecruiterInterview", RecruiterInterviewSchema);
