import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const totalPlans = plans?.length || 0;
  const paidPlans = plans?.filter((p) => p.payment_status === "paid").length || 0;
  const totalSpent = (payments?.reduce((sum, p) => sum + Number(p.amount), 0)) || 0;

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <DashboardContent
        plans={plans || []}
        totalPlans={totalPlans}
        paidPlans={paidPlans}
        totalSpent={totalSpent}
      />
    </>
  );
}
