import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Role from "@/models/Role";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        // Recruiters can also see roles so they can pick them when creating interviews
        if (!user || (user.role !== "admin" && user.role !== "recruiter")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const roles = await Role.find().sort({ createdAt: -1 });
        return NextResponse.json({ roles }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
        }

        const { name } = await req.json();
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Role name is required" }, { status: 400 });
        }

        const exists = await Role.findOne({ name: name.trim() });
        if (exists) {
            return NextResponse.json({ error: "Role already exists" }, { status: 400 });
        }

        const newRole = await Role.create({ name: name.trim() });
        return NextResponse.json({ role: newRole }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
