import InterviewNavbar from "@/components/InterviewNavbar";

export const metadata = {
  title: "DevHire Interview",
  description: "AI-powered interview execution",
};

export default function InterviewLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <InterviewNavbar />
      <div className="flex-1 w-full bg-background relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
