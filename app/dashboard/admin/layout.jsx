import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar role="admin" />
            <div className="md:ml-[260px] transition-all duration-300">
                <DashboardNavbar />
                <main className="pt-20 px-4 md:px-8 pb-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
