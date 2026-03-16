import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PlanDetail } from "@/components/plans/PlanDetail";
import { calculatePlanResults } from "@/lib/calculations";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!plan) notFound();

  // Calculate results from current data
  const results = plan.data ? calculatePlanResults(plan.data) : null;

  return (
    <>
      <DashboardHeader title={plan.name} />
      <PlanDetail plan={plan} results={results} />
    </>
  );
}
