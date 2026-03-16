"use client";

import { useState } from "react";
import { PlanData } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  Coins,
  Wrench,
  Landmark,
  Home,
  TrendingUp,
  Receipt,
  Settings,
  Save,
} from "lucide-react";

interface PlanFormProps {
  initialData: PlanData;
  onSubmit: (name: string, description: string, data: PlanData) => void;
  loading?: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
}

export function PlanForm({
  initialData,
  onSubmit,
  loading,
  mode,
  initialName = "",
  initialDescription = "",
}: PlanFormProps) {
  const [name, setName] = useState(initialName || "Nuovo Piano Immobiliare");
  const [description, setDescription] = useState(initialDescription);
  const [data, setData] = useState<PlanData>(initialData);
  const [activeSection, setActiveSection] = useState(0);

  const updateField = (field: keyof PlanData, value: string | number) => {
    setData((prev) => ({
      ...prev,
      [field]: typeof initialData[field] === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description, data);
  };

  const sections = [
    {
      title: "Informazioni Generali",
      icon: Building,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Nome del piano"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Appartamento Via Roma"
            required
          />
          <Input
            label="Descrizione (opzionale)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descrizione..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tipologia immobile
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={data.property_type}
              onChange={(e) => updateField("property_type", e.target.value)}
            >
              <option value="appartamento">Appartamento</option>
              <option value="villa">Villa / Casa indipendente</option>
              <option value="locale_commerciale">Locale commerciale</option>
              <option value="ufficio">Ufficio</option>
              <option value="terreno">Terreno</option>
              <option value="palazzo">Palazzo / Edificio intero</option>
            </select>
          </div>
          <Input
            label="Indirizzo"
            value={data.property_address}
            onChange={(e) => updateField("property_address", e.target.value)}
            placeholder="Via, numero civico"
          />
          <Input
            label="Citt&agrave;"
            value={data.property_city}
            onChange={(e) => updateField("property_city", e.target.value)}
            placeholder="es. Milano"
          />
          <Input
            label="Superficie (mq)"
            type="number"
            value={data.property_size_sqm}
            onChange={(e) => updateField("property_size_sqm", e.target.value)}
            suffix="mq"
          />
          <Input
            label="Numero unit&agrave;"
            type="number"
            value={data.num_units}
            onChange={(e) => updateField("num_units", e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tipo di investimento
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={data.investment_type}
              onChange={(e) => updateField("investment_type", e.target.value)}
            >
              <option value="rental">Affitto (rendita)</option>
              <option value="flip">Compravendita (flip)</option>
              <option value="both">Entrambi</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Costi di Acquisizione",
      icon: Coins,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Prezzo di acquisto"
            type="number"
            value={data.purchase_price}
            onChange={(e) => updateField("purchase_price", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Spese notarili"
            type="number"
            value={data.notary_costs}
            onChange={(e) => updateField("notary_costs", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Provvigione agenzia"
            type="number"
            value={data.agency_commission}
            onChange={(e) => updateField("agency_commission", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Imposta di registro"
            type="number"
            value={data.registration_tax}
            onChange={(e) => updateField("registration_tax", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Altri costi di acquisizione"
            type="number"
            value={data.other_acquisition_costs}
            onChange={(e) => updateField("other_acquisition_costs", e.target.value)}
            suffix="&euro;"
          />
        </div>
      ),
    },
    {
      title: "Costi di Ristrutturazione",
      icon: Wrench,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Costo ristrutturazione al mq"
            type="number"
            value={data.renovation_cost_per_sqm}
            onChange={(e) => updateField("renovation_cost_per_sqm", e.target.value)}
            suffix="&euro;/mq"
          />
          <Input
            label="Costo totale ristrutturazione"
            type="number"
            value={data.total_renovation_cost}
            onChange={(e) => updateField("total_renovation_cost", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Arredamento"
            type="number"
            value={data.furniture_costs}
            onChange={(e) => updateField("furniture_costs", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Spese tecniche (progetto, DL, ecc.)"
            type="number"
            value={data.technical_expenses}
            onChange={(e) => updateField("technical_expenses", e.target.value)}
            suffix="&euro;"
          />
        </div>
      ),
    },
    {
      title: "Finanziamento",
      icon: Landmark,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Capitale proprio (equity)"
            type="number"
            value={data.equity_amount}
            onChange={(e) => updateField("equity_amount", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Importo mutuo"
            type="number"
            value={data.mortgage_amount}
            onChange={(e) => updateField("mortgage_amount", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Tasso di interesse"
            type="number"
            step="0.1"
            value={data.mortgage_rate}
            onChange={(e) => updateField("mortgage_rate", e.target.value)}
            suffix="%"
          />
          <Input
            label="Durata mutuo"
            type="number"
            value={data.mortgage_years}
            onChange={(e) => updateField("mortgage_years", e.target.value)}
            suffix="anni"
          />
        </div>
      ),
    },
    {
      title: "Ricavi da Affitto",
      icon: Home,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Affitto mensile per unit&agrave;"
            type="number"
            value={data.monthly_rent_per_unit}
            onChange={(e) => updateField("monthly_rent_per_unit", e.target.value)}
            suffix="&euro;/mese"
          />
          <Input
            label="Tasso di occupazione"
            type="number"
            value={data.occupancy_rate}
            onChange={(e) => updateField("occupancy_rate", e.target.value)}
            suffix="%"
          />
          <Input
            label="Incremento annuale affitto"
            type="number"
            step="0.1"
            value={data.annual_rent_increase}
            onChange={(e) => updateField("annual_rent_increase", e.target.value)}
            suffix="%"
          />
        </div>
      ),
    },
    {
      title: "Ricavi da Vendita (Flip)",
      icon: TrendingUp,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Prezzo di vendita atteso"
            type="number"
            value={data.expected_sale_price}
            onChange={(e) => updateField("expected_sale_price", e.target.value)}
            suffix="&euro;"
          />
          <Input
            label="Timeline vendita"
            type="number"
            value={data.sale_timeline_months}
            onChange={(e) => updateField("sale_timeline_months", e.target.value)}
            suffix="mesi"
          />
        </div>
      ),
    },
    {
      title: "Spese Operative Annuali",
      icon: Receipt,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="IMU / Tasse immobiliari"
            type="number"
            value={data.property_tax_annual}
            onChange={(e) => updateField("property_tax_annual", e.target.value)}
            suffix="&euro;/anno"
          />
          <Input
            label="Assicurazione"
            type="number"
            value={data.insurance_annual}
            onChange={(e) => updateField("insurance_annual", e.target.value)}
            suffix="&euro;/anno"
          />
          <Input
            label="Manutenzione"
            type="number"
            value={data.maintenance_annual}
            onChange={(e) => updateField("maintenance_annual", e.target.value)}
            suffix="&euro;/anno"
          />
          <Input
            label="Fee gestione (%)"
            type="number"
            step="0.1"
            value={data.management_fee_percent}
            onChange={(e) => updateField("management_fee_percent", e.target.value)}
            suffix="%"
          />
          <Input
            label="Spese condominiali"
            type="number"
            value={data.condo_fees_annual}
            onChange={(e) => updateField("condo_fees_annual", e.target.value)}
            suffix="&euro;/anno"
          />
          <Input
            label="Altre spese"
            type="number"
            value={data.other_expenses_annual}
            onChange={(e) => updateField("other_expenses_annual", e.target.value)}
            suffix="&euro;/anno"
          />
        </div>
      ),
    },
    {
      title: "Impostazioni Analisi",
      icon: Settings,
      fields: (
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Anni di proiezione"
            type="number"
            value={data.analysis_years}
            onChange={(e) => updateField("analysis_years", e.target.value)}
            suffix="anni"
          />
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map((section, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveSection(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === idx
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.title}
          </button>
        ))}
      </div>

      {/* Active section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = sections[activeSection].icon;
              return <Icon className="w-5 h-5 text-blue-600" />;
            })()}
            {sections[activeSection].title}
          </CardTitle>
        </CardHeader>
        <CardContent>{sections[activeSection].fields}</CardContent>
      </Card>

      {/* Navigation and Submit */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {activeSection > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection((s) => s - 1)}
            >
              Precedente
            </Button>
          )}
          {activeSection < sections.length - 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setActiveSection((s) => s + 1)}
            >
              Successivo
            </Button>
          )}
        </div>

        <Button type="submit" variant="gradient" size="lg" loading={loading}>
          <Save className="w-4 h-4 mr-2" />
          {mode === "create" ? "Crea Piano" : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  );
}
