import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = verifyToken(token);

  const data = await req.formData();
  const file = data.get("file");

  if (!file)
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploaded = await cloudinary.v2.uploader.upload_stream(
    { folder: "devhire/profile-pics" },
    (error, result) => {
      if (error) throw error;
    }
  );

  const url = uploaded.secure_url;

  await User.findByIdAndUpdate(id, { profileImage: url });

  return NextResponse.json({ url });
}
