import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function Home() {
  // MUST await cookies() in Next.js 15+
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // If no token → redirect to login
  if (!token) {
    redirect("/login");
  }

  let payload;
  try {
    payload = verifyToken(token); // decode JWT
  } catch (err) {
    // Invalid or expired token → force login
    redirect("/login");
  }

  // Extract role from token
  const role = payload.role;

  // Redirect based on role
  if (role === "student") redirect("/dashboard/student");
  if (role === "recruiter") redirect("/dashboard/recruiter");
  if (role === "admin") redirect("/dashboard/admin");

  // Fallback
  redirect("/login");
}
