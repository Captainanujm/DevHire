import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "captainanuj2004@gmail.com";
const ADMIN_PASSWORD = "Anuj@devhire";

export async function GET() {
    try {
        await connectDB();
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            // Ensure role is admin
            if (existing.role !== "admin") {
                existing.role = "admin";
                await existing.save();
            }
            return NextResponse.json({ message: "Admin already exists, role verified." });
        }

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await User.create({
            name: "Admin",
            email: ADMIN_EMAIL,
            passwordHash,
            role: "admin",
        });

        return NextResponse.json({ message: "Admin user seeded successfully." });
    } catch (err) {
        console.error("Seed admin error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
