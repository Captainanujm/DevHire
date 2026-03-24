import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student", "recruiter", "admin", null], default: null },
  profileImage: { type: String, default: "" },
  profile: { type: Object, default: {} },
  refreshToken: { type: String, default: null },
  // Rate limiting for AI interviews
  lastInterviewAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
