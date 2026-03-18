import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileSidebarProvider } from "@/components/dashboard/MobileSidebarContext";

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
      <div className="min-h-screen">
        <Sidebar />
        <div className="min-w-0 md:ml-64">{children}</div>
      </div>
    </MobileSidebarProvider>
  );
}
