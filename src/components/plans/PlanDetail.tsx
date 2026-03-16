"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plan, PlanData, PlanResults } from "@/types/database";
import { calculatePlanResults } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { PlanForm } from "./PlanForm";
import { PlanAnalysis } from "./PlanAnalysis";
import {
  Edit3,
  BarChart3,
  Lock,
  CreditCard,
  Save,
} from "lucide-react";

interface PlanDetailProps {
  plan: Plan;
  results: PlanResults | null;
}

export function PlanDetail({ plan, results: initialResults }: PlanDetailProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">(
    plan.payment_status === "pending" ? "edit" : "view"
  );
  const [results, setResults] = useState<PlanResults | null>(initialResults);
  const [saving, setSaving] = useState(false);

  const isPaid = plan.payment_status === "paid";

  const handleSave = async (name: string, description: string, data: PlanData) => {
    setSaving(true);
    const supabase = createClient();
    const newResults = calculatePlanResults(data);

    await supabase
      .from("plans")
      .update({
        name,
        description,
        data,
        results: newResults,
      })
      .eq("id", plan.id);

    setResults(newResults);
    setSaving(false);
    setMode("view");
    router.refresh();
  };

  // If not paid, show edit form with payment prompt
  if (!isPaid) {
    return (
      <div className="p-8">
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Piano in bozza - Pagamento richiesto
                </p>
                <p className="text-sm text-yellow-600">
                  Completa il pagamento di {formatCurrency(3)} per attivare l&apos;analisi completa.
                </p>
              </div>
            </div>
            <Button
              variant="gradient"
              onClick={() => router.push(`/payments?plan_id=${plan.id}`)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Paga {formatCurrency(3)}
            </Button>
          </CardContent>
        </Card>

        <PlanForm
          initialData={plan.data || ({} as PlanData)}
          initialName={plan.name}
          initialDescription={plan.description || ""}
          onSubmit={handleSave}
          loading={saving}
          mode="edit"
        />
      </div>
    );
  }

  // Paid plan - show analysis or edit mode
  if (mode === "edit") {
    return (
      <div className="p-8">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => setMode("view")}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Torna all&apos;analisi
          </Button>
        </div>
        <PlanForm
          initialData={plan.data || ({} as PlanData)}
          initialName={plan.name}
          initialDescription={plan.description || ""}
          onSubmit={handleSave}
          loading={saving}
          mode="edit"
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Action bar */}
      <div className="flex justify-end gap-3 mb-6">
        <Button variant="outline" onClick={() => setMode("edit")}>
          <Edit3 className="w-4 h-4 mr-2" />
          Modifica Dati
        </Button>
      </div>

      {/* Analysis */}
      {results ? (
        <PlanAnalysis data={plan.data} results={results} />
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">
              Nessun risultato disponibile. Modifica i dati del piano per generare l&apos;analisi.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
