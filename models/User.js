import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: null },
  profileImage: { type: String, default: "" },
  profile: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
