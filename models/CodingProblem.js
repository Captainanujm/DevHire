import mongoose from "mongoose";

const CodingProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    description: { type: String, required: true },
    example: { type: String, default: "" },
    testCases: [{
        input: { type: String, default: "" },
        expectedOutput: { type: String, default: "" },
        isHidden: { type: Boolean, default: false }
    }],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.CodingProblem || mongoose.model("CodingProblem", CodingProblemSchema);
