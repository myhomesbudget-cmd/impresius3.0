import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileSidebarProvider } from "@/components/dashboard/MobileSidebarContext";
import { ToastProvider } from "@/components/ui/toast";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <MobileSidebarProvider>
      <div className="min-h-screen bg-[#f0f4f8]">
        <Sidebar />
        <div className="min-w-0 md:ml-64">{children}</div>
        <ToastProvider />
      </div>
    </MobileSidebarProvider>
  );
}
