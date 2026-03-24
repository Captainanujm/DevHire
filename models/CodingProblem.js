import mongoose from "mongoose";

const CodingProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    description: { type: String, required: true },
    example: { type: String, default: "" },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.CodingProblem || mongoose.model("CodingProblem", CodingProblemSchema);
