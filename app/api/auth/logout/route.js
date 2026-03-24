import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req) {
    try {
        await connectDB();
        const token = req.cookies.get("token")?.value;
        const refreshToken = req.cookies.get("refreshToken")?.value;

        // Clear refresh token from DB if possible
        if (refreshToken) {
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        }

        const res = NextResponse.json({ success: true });
        res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
        res.cookies.set("refreshToken", "", { httpOnly: true, path: "/", maxAge: 0 });
        return res;
    } catch (err) {
        console.error("Logout error:", err);
        const res = NextResponse.json({ success: true });
        res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
        res.cookies.set("refreshToken", "", { httpOnly: true, path: "/", maxAge: 0 });
        return res;
    }
}
