import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Role from "@/models/Role";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { name, isActive } = await req.json();
        
        const updatePayload = {};
        if (name !== undefined) updatePayload.name = name.trim();
        if (isActive !== undefined) updatePayload.isActive = isActive;

        const role = await Role.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
        if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

        return NextResponse.json({ role });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const deleted = await Role.findByIdAndDelete(id);
        
        if (!deleted) {
             return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Role deleted" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
