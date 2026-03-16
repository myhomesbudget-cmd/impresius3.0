"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  Plus,
  TrendingUp,
  CreditCard,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { Plan } from "@/types/database";

interface DashboardContentProps {
  plans: Plan[];
  totalPlans: number;
  paidPlans: number;
  totalSpent: number;
}

export function DashboardContent({
  plans,
  totalPlans,
  paidPlans,
  totalSpent,
}: DashboardContentProps) {
  const stats = [
    {
      label: "Piani Totali",
      value: totalPlans,
      icon: FileText,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Piani Attivi",
      value: paidPlans,
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Totale Speso",
      value: formatCurrency(totalSpent),
      icon: CreditCard,
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">I tuoi Piani</h2>
        <Link href="/plans/new">
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Piano
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun piano ancora
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Crea il tuo primo business plan immobiliare e inizia ad analizzare i tuoi investimenti.
            </p>
            <Link href="/plans/new">
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Crea il primo piano
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/plans/${plan.id}`}>
              <Card className="hover:border-blue-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Creato il {formatDate(plan.created_at)}
                          {plan.description && ` - ${plan.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          plan.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {plan.payment_status === "paid" ? "Attivo" : "Da pagare"}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
