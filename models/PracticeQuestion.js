import mongoose from "mongoose";

const PracticeQuestionSchema = new mongoose.Schema({
    role: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    question: { type: String, required: true },
    sampleAnswer: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

PracticeQuestionSchema.index({ role: 1, difficulty: 1 });

export default mongoose.models.PracticeQuestion || mongoose.model("PracticeQuestion", PracticeQuestionSchema);
