import mongoose from "mongoose";

const CandidateAttemptSchema = new mongoose.Schema({
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruiterInterview", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Per-candidate randomization mapping: stores shuffled question/option order
    questionMapping: [{
        originalIndex: { type: Number, required: true },    // index in the original questions array
        optionMapping: [{ type: Number }],                  // e.g. [2,0,3,1] means option 0 shown = original option 2
    }],
    answers: [{
        questionIndex: { type: Number, required: true },
        type: { type: String, enum: ["verbal", "coding"], default: "verbal" },
        transcript: { type: String }, // For verbal or code submission
        technicalScore: { type: Number, default: 0 },
        communicationScore: { type: Number, default: 0 },
        feedback: { type: String },
        fillerWords: { type: Object, default: {} },
    }],
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds
    violations: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    status: { type: String, enum: ["InProgress", "Submitted", "Pending", "Selected", "Rejected"], default: "InProgress" },
}, { timestamps: true });

CandidateAttemptSchema.index({ interviewId: 1, candidateId: 1 }, { unique: true });
CandidateAttemptSchema.index({ interviewId: 1, score: -1, timeTaken: 1 });

export default mongoose.models.CandidateAttempt || mongoose.model("CandidateAttempt", CandidateAttemptSchema);
