import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import User from "@/models/User";

export async function PATCH(req) {
    try {
        await connectDB();

        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { profile } = await req.json();
        if (!profile || typeof profile !== "object") {
            return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
        }

        await User.findByIdAndUpdate(user.id, { profile });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Profile update error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
