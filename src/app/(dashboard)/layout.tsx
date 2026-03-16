import { Sidebar } from "@/components/dashboard/Sidebar";

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
