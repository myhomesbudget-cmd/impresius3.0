"use client";

import { PlanData, PlanResults } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

interface PlanAnalysisProps {
  data: PlanData;
  results: PlanResults;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  description,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-700" },
    green: { bg: "bg-green-50", icon: "text-green-600", text: "text-green-700" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", text: "text-indigo-700" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", text: "text-purple-700" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", text: "text-orange-700" },
    red: { bg: "bg-red-50", icon: "text-red-600", text: "text-red-700" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.text}`}>{value}</p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
          <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PlanAnalysis({ data, results }: PlanAnalysisProps) {
  const showRental = data.investment_type === "rental" || data.investment_type === "both";
  const showFlip = data.investment_type === "flip" || data.investment_type === "both";

  return (
    <div className="space-y-8">
      {/* Investment Summary */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Riepilogo Investimento
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Investimento Totale"
            value={formatCurrency(results.total_investment)}
            icon={DollarSign}
            color="blue"
          />
          <MetricCard
            label="Costi Acquisizione"
            value={formatCurrency(results.total_acquisition_cost)}
            icon={DollarSign}
            color="indigo"
          />
          <MetricCard
            label="Costi Ristrutturazione"
            value={formatCurrency(results.total_renovation_cost)}
            icon={DollarSign}
            color="purple"
          />
          <MetricCard
            label="Rata Mutuo Mensile"
            value={formatCurrency(results.monthly_mortgage_payment)}
            icon={DollarSign}
            color="orange"
            description={`${formatCurrency(results.annual_mortgage_payment)}/anno`}
          />
        </div>
      </div>

      {/* Rental Metrics */}
      {showRental && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Analisi Rendimento Affitto
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Rendimento Lordo"
              value={`${formatNumber(results.gross_yield)}%`}
              icon={Percent}
              color="green"
            />
            <MetricCard
              label="Rendimento Netto"
              value={`${formatNumber(results.net_yield)}%`}
              icon={Percent}
              color="green"
            />
            <MetricCard
              label="Cap Rate"
              value={`${formatNumber(results.cap_rate)}%`}
              icon={TrendingUp}
              color="blue"
            />
            <MetricCard
              label="Cash-on-Cash Return"
              value={`${formatNumber(results.cash_on_cash_return)}%`}
              icon={TrendingUp}
              color="indigo"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <MetricCard
              label="Reddito Lordo Annuo"
              value={formatCurrency(results.gross_annual_income)}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              label="Cash Flow Mensile"
              value={formatCurrency(results.monthly_cash_flow)}
              icon={results.monthly_cash_flow >= 0 ? TrendingUp : TrendingDown}
              color={results.monthly_cash_flow >= 0 ? "green" : "red"}
            />
            <MetricCard
              label="Payback Period"
              value={
                results.payback_period_years > 0
                  ? `${formatNumber(results.payback_period_years, 1)} anni`
                  : "N/A"
              }
              icon={Clock}
              color="purple"
            />
            <MetricCard
              label="Break-even Occupancy"
              value={`${formatNumber(results.break_even_occupancy)}%`}
              icon={PieChart}
              color="orange"
            />
          </div>
        </div>
      )}

      {/* Flip Metrics */}
      {showFlip && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Analisi Compravendita (Flip)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Costo Totale"
              value={formatCurrency(results.total_cost)}
              icon={DollarSign}
              color="blue"
            />
            <MetricCard
              label="Profitto Netto"
              value={formatCurrency(results.net_profit)}
              icon={results.net_profit >= 0 ? TrendingUp : TrendingDown}
              color={results.net_profit >= 0 ? "green" : "red"}
            />
            <MetricCard
              label="Margine di Profitto"
              value={`${formatNumber(results.profit_margin)}%`}
              icon={Percent}
              color="indigo"
            />
            <MetricCard
              label="ROI Annualizzato"
              value={`${formatNumber(results.annualized_roi)}%`}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Charts */}
      {showRental && results.yearly_projections.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Cash Flow Annuale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.yearly_projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `Anno ${v}`}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Anno ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="gross_income"
                    name="Entrate"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Spese"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="net_cash_flow"
                    name="Cash Flow"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Cash Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Cash Flow Cumulativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={results.yearly_projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `Anno ${v}`}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Anno ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative_cash_flow"
                    name="Cash Flow Cumulativo"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Value & Equity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Valore Immobile & Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={results.yearly_projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `Anno ${v}`}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Anno ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="property_value"
                    name="Valore Immobile"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    name="Equity"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Total Return */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-600" />
                Rendimento Totale (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={results.yearly_projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `Anno ${v}`}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value: number) => `${formatNumber(value)}%`}
                    labelFormatter={(label) => `Anno ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_return"
                    name="Rendimento Totale"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Yearly Projections Table */}
      {showRental && results.yearly_projections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proiezione Annuale Dettagliata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Anno</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Entrate</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Spese</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Mutuo</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Cash Flow</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Cumulativo</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Valore</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">ROI Tot.</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearly_projections.map((proj) => (
                    <tr key={proj.year} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{proj.year}</td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(proj.gross_income)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {formatCurrency(proj.expenses)}
                      </td>
                      <td className="py-3 px-4 text-right text-orange-600">
                        {formatCurrency(proj.mortgage_payment)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          proj.net_cash_flow >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(proj.net_cash_flow)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right ${
                          proj.cumulative_cash_flow >= 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(proj.cumulative_cash_flow)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(proj.property_value)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-indigo-600">
                        {formatNumber(proj.total_return)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
