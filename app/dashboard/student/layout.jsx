import DashboardNavbar from "@/components/DashboardNavbar";

export default function StudentDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* FIXED NAVBAR */}
      <DashboardNavbar userName="Anuj" />

      {/* ADD THIS 👇 TO STOP UI FROM HIDING BEHIND NAVBAR */}
      <div className="pt-16">
        {children}
      </div>

    </div>
  );
}
