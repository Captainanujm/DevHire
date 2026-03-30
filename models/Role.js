import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
