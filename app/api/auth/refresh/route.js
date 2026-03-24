import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { verifyRefreshToken, signToken } from "@/lib/auth";

export async function POST(req) {
    try {
        await connectDB();
        const refreshToken = req.cookies.get("refreshToken")?.value;
        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        }

        const user = await User.findById(payload.id);
        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        const newAccessToken = signToken({ id: user._id, role: user.role });
        const res = NextResponse.json({ success: true, role: user.role });
        res.cookies.set("token", newAccessToken, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 15,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res;
    } catch (err) {
        console.error("Refresh token error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
