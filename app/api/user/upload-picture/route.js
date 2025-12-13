import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import cloudinary from "cloudinary";
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

  const form = await req.formData();
  const file = form.get("file");

  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
        folder: "devhire/profile-pics",
      },
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    ).end(buffer);
  });

  await User.findByIdAndUpdate(id, {
    profileImage: uploadResult.secure_url,
  });

  return NextResponse.json({
    success: true,
    url: uploadResult.secure_url,
  });
}
