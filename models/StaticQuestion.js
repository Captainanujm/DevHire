import mongoose from "mongoose";

const StaticQuestionSchema = new mongoose.Schema({
    role: { type: String, required: true, index: true },
    difficulty: { type: String, required: true, index: true },
    question: { type: String, required: true },
    category: { type: String, default: "general" },
});

export default mongoose.models.StaticQuestion || mongoose.model("StaticQuestion", StaticQuestionSchema);
