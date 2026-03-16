"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PlanForm } from "@/components/plans/PlanForm";
import { defaultPlanData, PlanData } from "@/types/database";

export default function NewPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (name: string, description: string, data: PlanData) => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        name,
        description,
        data,
        status: "draft",
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating plan:", error);
      setLoading(false);
      return;
    }

    // Redirect to payment or plan page
    router.push(`/plans/${plan.id}`);
  };

  return (
    <>
      <DashboardHeader title="Nuovo Business Plan" />
      <div className="p-8">
        <PlanForm
          initialData={defaultPlanData}
          onSubmit={handleCreate}
          loading={loading}
          mode="create"
        />
      </div>
    </>
  );
}
