import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <LandingPage />;
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return <LandingPage />;
  }

  const role = payload.role;
  if (role === "student") redirect("/dashboard/student");
  if (role === "recruiter") redirect("/dashboard/recruiter");
  if (role === "admin") redirect("/dashboard/admin");

  return <LandingPage />;
}
