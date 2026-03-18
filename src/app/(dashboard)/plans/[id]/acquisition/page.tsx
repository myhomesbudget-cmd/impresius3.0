'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Percent,
  Plus,
  X,
  Hash,
  Euro,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import {
  calculateAcquisitionAmount,
  calculateOperationAmount,
} from '@/lib/calculations';
import { createClient } from '@/lib/supabase/client';
import type {
  AcquisitionCost,
  OperationCost,
  OperationCostSection,
} from '@/types/database';
import {
  DEFAULT_ACQUISITION_COSTS,
  DEFAULT_OPERATION_COSTS,
  OPERATION_SECTIONS,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateTempId(): string {
  return `temp_${crypto.randomUUID()}`;
}

function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

// ---------------------------------------------------------------------------
// Debounced save hook
// ---------------------------------------------------------------------------

function useDebouncedSave<T>(
  saveFn: (item: T) => Promise<void>,
  delayMs = 1000,
) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const schedule = useCallback(
    (key: string, item: T) => {
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.set(
        key,
        setTimeout(() => {
          saveFn(item);
          timers.current.delete(key);
        }, delayMs),
      );
    },
    [saveFn, delayMs],
  );

  // Flush all pending saves on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return schedule;
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AcquisitionPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = useRef(createClient()).current;

  // State
  const [acquisitionCosts, setAcquisitionCosts] = useState<AcquisitionCost[]>(
    [],
  );
  const [operationCosts, setOperationCosts] = useState<OperationCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    management: true,
    utilities: false,
    professionals: false,
    permits: false,
  });

  // ----------------------------------------------------------
  // Persistence helpers
  // ----------------------------------------------------------

  const saveAcquisitionCost = useCallback(
    async (cost: AcquisitionCost) => {
      setSaving(true);
      try {
        if (isTempId(cost.id)) return; // Will be saved via insert
        const { id, ...rest } = cost;
        await supabase
          .from('acquisition_costs')
          .update(rest)
          .eq('id', id);
      } finally {
        setSaving(false);
      }
    },
    [supabase],
  );

  const saveOperationCost = useCallback(
    async (cost: OperationCost) => {
      setSaving(true);
      try {
        if (isTempId(cost.id)) return;
        const { id, ...rest } = cost;
        await supabase
          .from('operation_costs')
          .update(rest)
          .eq('id', id);
      } finally {
        setSaving(false);
      }
    },
    [supabase],
  );

  const scheduleAcqSave = useDebouncedSave<AcquisitionCost>(
    saveAcquisitionCost,
  );
  const scheduleOpSave = useDebouncedSave<OperationCost>(saveOperationCost);

  // ----------------------------------------------------------
  // Insert a new row to DB and replace temp ID
  // ----------------------------------------------------------

  const insertAcquisitionCost = useCallback(
    async (cost: AcquisitionCost) => {
      const { id: _tempId, ...payload } = cost;
      const { data, error } = await supabase
        .from('acquisition_costs')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setAcquisitionCosts((prev) =>
          prev.map((c) => (c.id === cost.id ? (data as AcquisitionCost) : c)),
        );
      }
    },
    [supabase],
  );

  const insertOperationCost = useCallback(
    async (cost: OperationCost) => {
      const { id: _tempId, ...payload } = cost;
      const { data, error } = await supabase
        .from('operation_costs')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setOperationCosts((prev) =>
          prev.map((c) => (c.id === cost.id ? (data as OperationCost) : c)),
        );
      }
    },
    [supabase],
  );

  // ----------------------------------------------------------
  // Initial data fetch
  // ----------------------------------------------------------

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch acquisition costs
        const { data: acqData } = await supabase
          .from('acquisition_costs')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order');

        // Fetch operation costs
        const { data: opData } = await supabase
          .from('operation_costs')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order');

        const acqCosts = (acqData as AcquisitionCost[] | null) ?? [];
        const opCosts = (opData as OperationCost[] | null) ?? [];

        if (acqCosts.length === 0) {
          // Initialize defaults
          const defaultAcq: Omit<AcquisitionCost, 'id'>[] =
            DEFAULT_ACQUISITION_COSTS.map((d) => ({
              project_id: projectId,
              category: d.category,
              label: d.label,
              calculation_type: d.calculation_type,
              base_value: 0,
              percentage: d.percentage,
              fixed_amount: 0,
              sort_order: d.sort_order,
            }));

          const { data: insertedAcq } = await supabase
            .from('acquisition_costs')
            .insert(defaultAcq)
            .select();

          setAcquisitionCosts(
            (insertedAcq as AcquisitionCost[] | null) ?? [],
          );
        } else {
          setAcquisitionCosts(acqCosts);
        }

        if (opCosts.length === 0) {
          // Initialize defaults
          const defaultOp: Omit<OperationCost, 'id'>[] = [];
          for (const section of Object.keys(DEFAULT_OPERATION_COSTS) as OperationCostSection[]) {
            for (const d of DEFAULT_OPERATION_COSTS[section]) {
              defaultOp.push({
                project_id: projectId,
                section,
                category: d.category,
                label: d.label,
                calculation_type: d.calculation_type,
                base_value: 0,
                percentage: d.percentage ?? 0,
                unit_price: d.unit_price ?? 0,
                quantity: d.quantity ?? 0,
                quantity_unit: d.quantity_unit ?? null,
                sort_order: d.sort_order,
              });
            }
          }

          const { data: insertedOp } = await supabase
            .from('operation_costs')
            .insert(defaultOp)
            .select();

          setOperationCosts((insertedOp as OperationCost[] | null) ?? []);
        } else {
          setOperationCosts(opCosts);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ----------------------------------------------------------
  // Purchase price (first acquisition cost row)
  // ----------------------------------------------------------

  const purchasePrice =
    acquisitionCosts.find((c) => c.category === 'purchase_price')
      ?.fixed_amount ?? 0;

  // When purchase price changes, propagate base_value to all %-based acq costs
  const handlePurchasePriceChange = useCallback(
    (value: number) => {
      setAcquisitionCosts((prev) =>
        prev.map((c) => {
          if (c.category === 'purchase_price') {
            const updated = { ...c, fixed_amount: value };
            scheduleAcqSave(c.id, updated);
            return updated;
          }
          if (c.calculation_type === 'percentage') {
            const updated = { ...c, base_value: value };
            scheduleAcqSave(c.id, updated);
            return updated;
          }
          return c;
        }),
      );
    },
    [scheduleAcqSave],
  );

  // ----------------------------------------------------------
  // Acquisition cost handlers
  // ----------------------------------------------------------

  const updateAcquisitionCost = useCallback(
    (id: string, changes: Partial<AcquisitionCost>) => {
      setAcquisitionCosts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, ...changes };
          if (!isTempId(id)) {
            scheduleAcqSave(id, updated);
          }
          return updated;
        }),
      );
    },
    [scheduleAcqSave],
  );

  const addAcquisitionRow = useCallback(() => {
    const tempId = generateTempId();
    const maxOrder = acquisitionCosts.reduce(
      (max, c) => Math.max(max, c.sort_order),
      0,
    );
    const newCost: AcquisitionCost = {
      id: tempId,
      project_id: projectId,
      category: 'custom',
      label: 'Nuova voce',
      calculation_type: 'percentage',
      base_value: purchasePrice,
      percentage: 0,
      fixed_amount: 0,
      sort_order: maxOrder + 1,
    };
    setAcquisitionCosts((prev) => [...prev, newCost]);
    insertAcquisitionCost(newCost);
  }, [acquisitionCosts, projectId, purchasePrice, insertAcquisitionCost]);

  const deleteAcquisitionRow = useCallback(
    async (id: string) => {
      setAcquisitionCosts((prev) => prev.filter((c) => c.id !== id));
      if (!isTempId(id)) {
        await supabase.from('acquisition_costs').delete().eq('id', id);
      }
    },
    [supabase],
  );

  // ----------------------------------------------------------
  // Operation cost handlers
  // ----------------------------------------------------------

  const updateOperationCost = useCallback(
    (id: string, changes: Partial<OperationCost>) => {
      setOperationCosts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, ...changes };
          if (!isTempId(id)) {
            scheduleOpSave(id, updated);
          }
          return updated;
        }),
      );
    },
    [scheduleOpSave],
  );

  const addOperationRow = useCallback(
    (section: OperationCostSection) => {
      const tempId = generateTempId();
      const sectionCosts = operationCosts.filter((c) => c.section === section);
      const maxOrder = sectionCosts.reduce(
        (max, c) => Math.max(max, c.sort_order),
        0,
      );
      const newCost: OperationCost = {
        id: tempId,
        project_id: projectId,
        section,
        category: 'custom',
        label: 'Nuova voce',
        calculation_type: 'fixed',
        base_value: 0,
        percentage: 0,
        unit_price: 0,
        quantity: 0,
        quantity_unit: null,
        sort_order: maxOrder + 1,
      };
      setOperationCosts((prev) => [...prev, newCost]);
      insertOperationCost(newCost);
    },
    [operationCosts, projectId, insertOperationCost],
  );

  const deleteOperationRow = useCallback(
    async (id: string) => {
      setOperationCosts((prev) => prev.filter((c) => c.id !== id));
      if (!isTempId(id)) {
        await supabase.from('operation_costs').delete().eq('id', id);
      }
    },
    [supabase],
  );

  // ----------------------------------------------------------
  // Totals
  // ----------------------------------------------------------

  const totalAcquisition = acquisitionCosts.reduce(
    (sum, c) => sum + calculateAcquisitionAmount(c),
    0,
  );

  const operationSectionTotals = OPERATION_SECTIONS.map((s) => ({
    ...s,
    total: operationCosts
      .filter((c) => c.section === s.value)
      .reduce((sum, c) => sum + calculateOperationAmount(c), 0),
  }));

  const totalOperation = operationSectionTotals.reduce(
    (sum, s) => sum + s.total,
    0,
  );

  const grandTotal = totalAcquisition + totalOperation;

  // ----------------------------------------------------------
  // Section toggle
  // ----------------------------------------------------------

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // ----------------------------------------------------------
  // Render helpers
  // ----------------------------------------------------------

  function parseNumericInput(value: string): number {
    const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-muted-foreground">Caricamento costi...</span>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="p-4 md:p-8 max-w-6xl space-y-6 md:space-y-8 pb-36 lg:pb-28">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="page-header-title">
          Area 1 — Costi di Acquisizione e Spese Accessorie
        </h1>
        <p className="page-header-subtitle">
          Gestisci i costi di acquisizione e le spese operative dell&apos;operazione immobiliare.
        </p>
      </div>

      {/* ====================================================== */}
      {/* SECTION A: Costi di Acquisizione                       */}
      {/* ====================================================== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-700">
              A
            </span>
            Costi di Acquisizione
          </CardTitle>
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvataggio...
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-0 overflow-x-auto mobile-scroll-hint">
          {/* Header Row */}
          <div className="mb-2 flex items-center gap-3 border-b border-border px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[640px]">
            <div className="w-6" />
            <div className="min-w-[180px] flex-1">Voce</div>
            <div className="w-16 text-center">Tipo</div>
            <div className="w-28 text-right">Percentuale</div>
            <div className="w-36 text-right">Importo fisso</div>
            <div className="w-36 text-right">Importo calc.</div>
            <div className="w-8" />
          </div>

          {/* Rows */}
          {acquisitionCosts.map((cost) => {
            const isPurchasePrice = cost.category === 'purchase_price';
            const amount = calculateAcquisitionAmount(cost);

            return (
              <div
                key={cost.id}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent min-w-[640px]',
                  isPurchasePrice && 'bg-blue-500/10 dark:bg-blue-500/20',
                )}
              >
                {/* Drag handle / indicator */}
                <div className="w-6 flex-shrink-0">
                  {isPurchasePrice ? (
                    <Euro className="h-4 w-4 text-blue-500" />
                  ) : cost.calculation_type === 'percentage' ? (
                    <Percent className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Label */}
                <div className="min-w-[220px] flex-1">
                  {isPurchasePrice ? (
                    <span className="text-sm font-semibold text-foreground">
                      {cost.label}
                    </span>
                  ) : (
                    <Input
                      value={cost.label}
                      onChange={(e) =>
                        updateAcquisitionCost(cost.id, {
                          label: e.target.value,
                        })
                      }
                      className="h-8 border-transparent bg-transparent text-sm hover:border-border focus:border-blue-500 focus:bg-card"
                    />
                  )}
                </div>

                {/* Calculation type badge */}
                <div className="flex w-16 justify-center">
                  {isPurchasePrice ? (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      FISSO
                    </span>
                  ) : (
                    <select
                      value={cost.calculation_type}
                      onChange={(e) => {
                        const newType = e.target.value as 'fixed' | 'percentage';
                        updateAcquisitionCost(cost.id, {
                          calculation_type: newType,
                          base_value:
                            newType === 'percentage' ? purchasePrice : 0,
                        });
                      }}
                      className="h-6 rounded border border-border bg-card px-1 text-[10px] font-medium text-muted-foreground focus:border-blue-400 focus:outline-none"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Fisso</option>
                    </select>
                  )}
                </div>

                {/* Percentage */}
                <div className="w-28">
                  {cost.calculation_type === 'percentage' &&
                  !isPurchasePrice ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={cost.percentage || ''}
                      onChange={(e) =>
                        updateAcquisitionCost(cost.id, {
                          percentage: parseNumericInput(e.target.value),
                        })
                      }
                      suffix="%"
                      className="h-8 text-right text-sm"
                    />
                  ) : (
                    <div className="text-right text-sm text-muted-foreground/50">--</div>
                  )}
                </div>

                {/* Fixed amount / Purchase price */}
                <div className="w-36">
                  {isPurchasePrice ? (
                    <Input
                      type="number"
                      step="100"
                      value={cost.fixed_amount || ''}
                      onChange={(e) =>
                        handlePurchasePriceChange(
                          parseNumericInput(e.target.value),
                        )
                      }
                      className="h-8 text-right text-sm font-semibold"
                      placeholder="0"
                    />
                  ) : cost.calculation_type === 'fixed' ? (
                    <Input
                      type="number"
                      step="100"
                      value={cost.fixed_amount || ''}
                      onChange={(e) =>
                        updateAcquisitionCost(cost.id, {
                          fixed_amount: parseNumericInput(e.target.value),
                        })
                      }
                      className="h-8 text-right text-sm"
                      placeholder="0"
                    />
                  ) : (
                    <div className="text-right text-sm text-muted-foreground/50">--</div>
                  )}
                </div>

                {/* Calculated amount */}
                <div className="w-36 text-right">
                  <span
                    className={cn(
                      'text-sm font-medium tabular-nums',
                      isPurchasePrice
                        ? 'font-semibold text-blue-700'
                        : 'text-foreground',
                    )}
                  >
                    {formatCurrency(amount)}
                  </span>
                </div>

                {/* Delete */}
                <div className="w-8 flex-shrink-0">
                  {!isPurchasePrice && (
                    <button
                      onClick={() => deleteAcquisitionRow(cost.id)}
                      className="rounded p-1 text-muted-foreground/50 opacity-0 transition-all hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-500 group-hover:opacity-100"
                      title="Elimina voce"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add row */}
          <div className="mt-2 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={addAcquisitionRow}
              className="text-muted-foreground hover:text-blue-600"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Aggiungi voce
            </Button>
          </div>

          {/* Subtotal */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Totale Acquisizione
            </span>
            <span className="text-base font-bold tabular-nums text-foreground">
              {formatCurrency(totalAcquisition)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION B: Costi Operativi                             */}
      {/* ====================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-700">
            B
          </span>
          <h2 className="text-xl font-semibold text-foreground">
            Costi Operativi
          </h2>
        </div>

        {OPERATION_SECTIONS.map((section, sectionIdx) => {
          const sectionCosts = operationCosts.filter(
            (c) => c.section === section.value,
          );
          const sectionTotal =
            operationSectionTotals.find((s) => s.value === section.value)
              ?.total ?? 0;
          const isExpanded = expandedSections[section.value] ?? false;

          return (
            <Card key={section.value}>
              {/* Section header - collapsible */}
              <button
                onClick={() => toggleSection(section.value)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-xs font-bold text-emerald-600">
                    {sectionIdx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {section.label}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {sectionCosts.length} voci
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(sectionTotal)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Section content */}
              {isExpanded && (
                <CardContent className="space-y-0 border-t border-border pt-4 overflow-x-auto mobile-scroll-hint">
                  {/* Column headers */}
                  <div className="mb-2 flex items-center gap-3 px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[640px]">
                    <div className="w-6" />
                    <div className="min-w-[180px] flex-1">Voce</div>
                    <div className="w-20 text-center">Tipo</div>
                    <div className="w-28 text-right">Base / Prezzo U.</div>
                    <div className="w-20 text-right">% / Qty</div>
                    <div className="w-20 text-center">Unita</div>
                    <div className="w-36 text-right">Importo</div>
                    <div className="w-8" />
                  </div>

                  {sectionCosts.map((cost) => {
                    const amount = calculateOperationAmount(cost);

                    return (
                      <div
                        key={cost.id}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent min-w-[640px]"
                      >
                        {/* Icon */}
                        <div className="w-6 flex-shrink-0">
                          {cost.calculation_type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-amber-500" />
                          ) : cost.calculation_type === 'unit_quantity' ? (
                            <Hash className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Euro className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Label */}
                        <div className="min-w-[200px] flex-1">
                          <Input
                            value={cost.label}
                            onChange={(e) =>
                              updateOperationCost(cost.id, {
                                label: e.target.value,
                              })
                            }
                            className="h-8 border-transparent bg-transparent text-sm hover:border-border focus:border-blue-500 focus:bg-card"
                          />
                        </div>

                        {/* Calculation type selector */}
                        <div className="w-20">
                          <select
                            value={cost.calculation_type}
                            onChange={(e) => {
                              const newType = e.target.value as
                                | 'fixed'
                                | 'percentage'
                                | 'unit_quantity';
                              updateOperationCost(cost.id, {
                                calculation_type: newType,
                              });
                            }}
                            className="h-7 w-full rounded border border-border bg-card px-1 text-[10px] font-medium text-muted-foreground focus:border-blue-400 focus:outline-none"
                          >
                            <option value="fixed">Fisso</option>
                            <option value="percentage">%</option>
                            <option value="unit_quantity">Q.ta</option>
                          </select>
                        </div>

                        {/* Base value / Unit price */}
                        <div className="w-28">
                          {cost.calculation_type === 'percentage' ? (
                            <Input
                              type="number"
                              step="100"
                              value={cost.base_value || ''}
                              onChange={(e) =>
                                updateOperationCost(cost.id, {
                                  base_value: parseNumericInput(e.target.value),
                                })
                              }
                              className="h-8 text-right text-sm"
                              placeholder="Base"
                            />
                          ) : cost.calculation_type === 'unit_quantity' ? (
                            <Input
                              type="number"
                              step="1"
                              value={cost.unit_price || ''}
                              onChange={(e) =>
                                updateOperationCost(cost.id, {
                                  unit_price: parseNumericInput(e.target.value),
                                })
                              }
                              className="h-8 text-right text-sm"
                              placeholder="Prezzo"
                            />
                          ) : (
                            <Input
                              type="number"
                              step="100"
                              value={cost.unit_price || ''}
                              onChange={(e) =>
                                updateOperationCost(cost.id, {
                                  unit_price: parseNumericInput(e.target.value),
                                })
                              }
                              className="h-8 text-right text-sm"
                              placeholder="Importo"
                            />
                          )}
                        </div>

                        {/* Percentage / Quantity */}
                        <div className="w-20">
                          {cost.calculation_type === 'percentage' ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={cost.percentage || ''}
                              onChange={(e) =>
                                updateOperationCost(cost.id, {
                                  percentage: parseNumericInput(e.target.value),
                                })
                              }
                              suffix="%"
                              className="h-8 text-right text-sm"
                            />
                          ) : cost.calculation_type === 'unit_quantity' ? (
                            <Input
                              type="number"
                              step="1"
                              value={cost.quantity || ''}
                              onChange={(e) =>
                                updateOperationCost(cost.id, {
                                  quantity: parseNumericInput(e.target.value),
                                })
                              }
                              className="h-8 text-right text-sm"
                            />
                          ) : (
                            <div className="text-right text-sm text-muted-foreground/50">
                              --
                            </div>
                          )}
                        </div>

                        {/* Unit label */}
                        <div className="w-20 text-center">
                          {cost.calculation_type === 'unit_quantity' ? (
                            <Input
                              value={cost.quantity_unit ?? ''}
                              onChange={(e) =>
                                updateOperationCost(cost.id, {
                                  quantity_unit: e.target.value || null,
                                })
                              }
                              className="h-8 border-transparent bg-transparent text-center text-xs text-muted-foreground hover:border-border focus:border-blue-500 focus:bg-card"
                              placeholder="unita"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground/50">--</span>
                          )}
                        </div>

                        {/* Calculated amount */}
                        <div className="w-36 text-right">
                          <span className="text-sm font-medium tabular-nums text-foreground">
                            {formatCurrency(amount)}
                          </span>
                        </div>

                        {/* Delete */}
                        <div className="w-8 flex-shrink-0">
                          <button
                            onClick={() => deleteOperationRow(cost.id)}
                            className="rounded p-1 text-muted-foreground/50 opacity-0 transition-all hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-500 group-hover:opacity-100"
                            title="Elimina voce"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add row */}
                  <div className="mt-2 border-t border-border pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addOperationRow(section.value)}
                      className="text-muted-foreground hover:text-emerald-600"
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Aggiungi voce
                    </Button>
                  </div>

                  {/* Section subtotal */}
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">
                      Subtotale {section.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {formatCurrency(sectionTotal)}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Total Operativi */}
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 px-6 py-4">
          <span className="text-sm font-semibold text-emerald-800">
            Totale Costi Operativi
          </span>
          <span className="text-base font-bold tabular-nums text-emerald-900">
            {formatCurrency(totalOperation)}
          </span>
        </div>
      </div>

      {/* ====================================================== */}
      {/* Sticky Summary Bar                                      */}
      {/* ====================================================== */}
      <div className="fixed bottom-[4.5rem] lg:bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Acquisizione
              </span>
              <span className="text-xs md:text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(totalAcquisition)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Operativi
              </span>
              <span className="text-xs md:text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(totalOperation)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Totale
              </span>
              <span className="text-base md:text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
