'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  calculateAdjustedSurface,
  calculateSurfaceValue,
  calculateUnitValue,
} from '@/lib/calculations';
import type { PropertyUnit, UnitSurface } from '@/types/database';
import { SURFACE_TYPES, FLOORS } from '@/types/database';
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Building2,
  AlertTriangle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers & Constants
// ---------------------------------------------------------------------------

const UNIT_COLORS = [
  'border-blue-500',
  'border-emerald-500',
  'border-violet-500',
  'border-amber-500',
  'border-rose-500',
  'border-cyan-500',
  'border-indigo-500',
  'border-teal-500',
];

interface UnitWithSurfaces extends PropertyUnit {
  surfaces: UnitSurface[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ValuationPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  // ---- state ----
  const [units, setUnits] = useState<UnitWithSurfaces[]>([]);
  const [globalPrice, setGlobalPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const globalPriceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the latest units to avoid stale closures in debounced saves
  const unitsRef = useRef<UnitWithSurfaces[]>(units);
  useEffect(() => { unitsRef.current = units; }, [units]);

  // Track which units had their market_price_sqm manually set
  const customPriceUnitsRef = useRef<Set<string>>(new Set());

  // ---- fetch on mount ----
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchData() {
    setLoading(true);

    const { data: unitsData } = await supabase
      .from('property_units')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (!unitsData || unitsData.length === 0) {
      setUnits([]);
      setLoading(false);
      return;
    }

    const unitIds = unitsData.map((u: PropertyUnit) => u.id);
    const { data: surfacesData } = await supabase
      .from('unit_surfaces')
      .select('*')
      .in('unit_id', unitIds)
      .order('sort_order', { ascending: true });

    const surfacesMap = new Map<string, UnitSurface[]>();
    for (const s of (surfacesData ?? []) as UnitSurface[]) {
      const arr = surfacesMap.get(s.unit_id) || [];
      arr.push(s);
      surfacesMap.set(s.unit_id, arr);
    }

    const combined: UnitWithSurfaces[] = (unitsData as PropertyUnit[]).map((u) => ({
      ...u,
      surfaces: surfacesMap.get(u.id) || [],
    }));

    setUnits(combined);

    // Derive global price from first unit
    if (combined.length > 0) {
      setGlobalPrice(combined[0].market_price_sqm || 0);
    }

    setLoading(false);
  }

  // Flush pending save when navigating away
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        // Fire save synchronously with latest data
        persistAll();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- auto-save helpers ----
  function triggerSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistAll();
    }, 1000);
  }

  async function persistAll() {
    setSaving(true);
    setSaved(false);

    const promises: PromiseLike<unknown>[] = [];
    const currentUnits = unitsRef.current;

    for (const unit of currentUnits) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { surfaces, ...unitData } = unit;
      promises.push(
        supabase
          .from('property_units')
          .update({
            name: unitData.name,
            floor: unitData.floor,
            destination: unitData.destination,
            market_price_sqm: unitData.market_price_sqm,
            target_sale_price: unitData.target_sale_price,
            sort_order: unitData.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', unitData.id)
      );

      for (const s of unit.surfaces) {
        promises.push(
          supabase
            .from('unit_surfaces')
            .update({
              surface_type: s.surface_type,
              gross_surface: s.gross_surface,
              coefficient: s.coefficient,
              unit_price: s.unit_price,
              floor_reference: s.floor_reference,
              sort_order: s.sort_order,
            })
            .eq('id', s.id)
            .then()
        );
      }
    }

    await Promise.all(promises);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ---- unit CRUD ----
  async function addUnit() {
    const sortOrder = units.length;
    const name = `Unita ${sortOrder + 1}`;
    const marketPrice = globalPrice || 0;

    const { data: newUnit, error } = await supabase
      .from('property_units')
      .insert({
        project_id: projectId,
        name,
        floor: 'PT',
        destination: 'Residenziale',
        market_price_sqm: marketPrice,
        target_sale_price: 0,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error || !newUnit) return;

    const surfaceRows = SURFACE_TYPES.map((st, idx) => ({
      unit_id: (newUnit as PropertyUnit).id,
      surface_type: st.value,
      gross_surface: 0,
      coefficient: st.defaultCoefficient,
      unit_price: null,
      floor_reference: 'PT',
      sort_order: idx,
    }));

    const { data: newSurfaces } = await supabase
      .from('unit_surfaces')
      .insert(surfaceRows)
      .select();

    setUnits((prev) => [
      ...prev,
      {
        ...(newUnit as PropertyUnit),
        surfaces: (newSurfaces as UnitSurface[]) || [],
      },
    ]);
  }

  async function deleteUnit(unitId: string) {
    setDeletingUnitId(null);

    await supabase.from('unit_surfaces').delete().eq('unit_id', unitId);
    await supabase.from('property_units').delete().eq('id', unitId);

    setUnits((prev) => prev.filter((u) => u.id !== unitId));
  }

  async function addCustomSurface(unitId: string) {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    const { data: newSurface } = await supabase
      .from('unit_surfaces')
      .insert({
        unit_id: unitId,
        surface_type: 'custom',
        gross_surface: 0,
        coefficient: 1.0,
        unit_price: null,
        floor_reference: 'PT',
        sort_order: unit.surfaces.length,
      })
      .select()
      .single();

    if (!newSurface) return;

    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? { ...u, surfaces: [...u.surfaces, newSurface as UnitSurface] }
          : u
      )
    );
  }

  async function deleteSurface(unitId: string, surfaceId: string) {
    await supabase.from('unit_surfaces').delete().eq('id', surfaceId);

    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? { ...u, surfaces: u.surfaces.filter((s) => s.id !== surfaceId) }
          : u
      )
    );
  }

  // ---- field updaters ----
  function updateUnitField<K extends keyof PropertyUnit>(
    unitId: string,
    field: K,
    value: PropertyUnit[K]
  ) {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, [field]: value } : u))
    );
    triggerSave();
  }

  function updateSurfaceField<K extends keyof UnitSurface>(
    unitId: string,
    surfaceId: string,
    field: K,
    value: UnitSurface[K]
  ) {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              surfaces: u.surfaces.map((s) =>
                s.id === surfaceId ? { ...s, [field]: value } : s
              ),
            }
          : u
      )
    );
    triggerSave();
  }

  // ---- global price handler ----
  const handleGlobalPriceChange = useCallback(
    (value: number) => {
      setGlobalPrice(value);

      if (globalPriceDebounceRef.current) clearTimeout(globalPriceDebounceRef.current);
      globalPriceDebounceRef.current = setTimeout(() => {
        setUnits((prev) =>
          prev.map((u) => {
            if (customPriceUnitsRef.current.has(u.id)) return u;
            return { ...u, market_price_sqm: value };
          })
        );
        triggerSave();
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ---- computed summary ----
  const summary = useMemo(() => {
    return units.map((unit) => {
      const { calculatedValue, totalAdjustedSurface } = calculateUnitValue(
        unit,
        unit.surfaces
      );
      return {
        id: unit.id,
        name: unit.name,
        calculatedValue,
        totalAdjustedSurface,
        targetPrice: unit.target_sale_price,
      };
    });
  }, [units]);

  const totalCalculated = summary.reduce((s, u) => s + u.calculatedValue, 0);
  const totalTarget = summary.reduce((s, u) => s + u.targetPrice, 0);

  // ---- render ----
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="page-header-title">
              Area 3 &mdash; Stima del Valore di Vendita
            </h1>
            <p className="page-header-subtitle">
              Determinazione dei valori commerciali delle unita immobiliari
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-sm">
              {saving && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvataggio...
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Salvato
                </span>
              )}
            </div>
            <Button onClick={addUnit}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Unita
            </Button>
          </div>
        </div>
      </div>

      {/* Global price */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
              Prezzo di Mercato Ricorrente
            </label>
            <div className="relative w-56">
              <Input
                type="number"
                min={0}
                step={50}
                value={globalPrice || ''}
                placeholder="0"
                onChange={(e) => handleGlobalPriceChange(Number(e.target.value))}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                €/mq
              </span>
            </div>
            {globalPrice > 0 && (
              <span className="text-sm text-slate-500">
                {formatCurrency(globalPrice)}/mq
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {units.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              Nessuna unita immobiliare
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Aggiungi la prima unita immobiliare per iniziare la valutazione
            </p>
            <Button onClick={addUnit}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi la prima unita immobiliare
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Unit Cards */}
      <div className="space-y-6">
        {units.map((unit, unitIdx) => {
          const colorClass = UNIT_COLORS[unitIdx % UNIT_COLORS.length];
          const { calculatedValue } = calculateUnitValue(unit, unit.surfaces);
          const target = unit.target_sale_price || 0;
          const diff = target - calculatedValue;
          const isAbove = target > calculatedValue;
          const isBelowThreshold = target < calculatedValue * 0.9 && target > 0;

          return (
            <Card
              key={unit.id}
              className={cn('border-l-4 overflow-hidden', colorClass)}
            >
              {/* Unit Header */}
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Nome Unita
                      </label>
                      <Input
                        value={unit.name}
                        onChange={(e) =>
                          updateUnitField(unit.id, 'name', e.target.value)
                        }
                        className="font-semibold"
                      />
                    </div>

                    {/* Floor */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Piano
                      </label>
                      <select
                        className={cn(
                          'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors',
                          'focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15'
                        )}
                        value={unit.floor}
                        onChange={(e) =>
                          updateUnitField(unit.id, 'floor', e.target.value)
                        }
                      >
                        {FLOORS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Destinazione
                      </label>
                      <Input
                        value={unit.destination}
                        onChange={(e) =>
                          updateUnitField(unit.id, 'destination', e.target.value)
                        }
                      />
                    </div>

                    {/* Market price per unit */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Prezzo €/mq
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          value={unit.market_price_sqm || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            customPriceUnitsRef.current.add(unit.id);
                            updateUnitField(unit.id, 'market_price_sqm', v);
                          }}
                          className="pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          €/mq
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  {deletingUnitId === unit.id ? (
                    <div className="flex items-center gap-2 pt-5">
                      <span className="text-xs text-red-600">Confermi?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUnit(unit.id)}
                      >
                        Elimina
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingUnitId(null)}
                      >
                        Annulla
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="mt-5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => setDeletingUnitId(unit.id)}
                      title="Elimina unita"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardHeader>

              {/* Surfaces table */}
              <CardContent className="pt-0">
                <div className="overflow-x-auto mobile-scroll-hint">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-500 text-xs w-24">
                          Piano Rif.
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 text-xs">
                          Destinazione d&apos;Uso
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs w-28">
                          Superficie (mq)
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs w-28">
                          Coeff. Ragguaglio
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs w-32">
                          Sup. Ragguagliata
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs w-28">
                          Prezzo €/mq
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs w-32">
                          Valore €
                        </th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {unit.surfaces.map((surface) => {
                        const adjusted = calculateAdjustedSurface(surface);
                        const value = calculateSurfaceValue(
                          surface,
                          unit.market_price_sqm
                        );
                        const surfaceLabel =
                          SURFACE_TYPES.find((st) => st.value === surface.surface_type)
                            ?.label || surface.surface_type;
                        const isCustom = surface.surface_type === 'custom';

                        return (
                          <tr
                            key={surface.id}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Floor ref */}
                            <td className="py-1.5 px-2">
                              <select
                                className={cn(
                                  'w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs',
                                  'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20'
                                )}
                                value={surface.floor_reference || ''}
                                onChange={(e) =>
                                  updateSurfaceField(
                                    unit.id,
                                    surface.id,
                                    'floor_reference',
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">-</option>
                                {FLOORS.map((f) => (
                                  <option key={f.value} value={f.value}>
                                    {f.value}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Surface type label */}
                            <td className="py-1.5 px-2 text-slate-800 font-medium text-xs">
                              {isCustom ? (
                                <input
                                  type="text"
                                  className={cn(
                                    'w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs',
                                    'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20'
                                  )}
                                  value={surface.surface_type}
                                  placeholder="Tipo superficie..."
                                  onChange={(e) =>
                                    updateSurfaceField(
                                      unit.id,
                                      surface.id,
                                      'surface_type',
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                surfaceLabel
                              )}
                            </td>

                            {/* Gross surface */}
                            <td className="py-1.5 px-2">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                className={cn(
                                  'w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-right',
                                  'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20'
                                )}
                                value={surface.gross_surface || ''}
                                placeholder="0.00"
                                onChange={(e) =>
                                  updateSurfaceField(
                                    unit.id,
                                    surface.id,
                                    'gross_surface',
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>

                            {/* Coefficient (displayed as %) */}
                            <td className="py-1.5 px-2">
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  className={cn(
                                    'w-full rounded border border-slate-200 bg-white px-2 py-1 pr-6 text-xs text-right',
                                    'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20'
                                  )}
                                  value={
                                    surface.coefficient != null
                                      ? Math.round(surface.coefficient * 100)
                                      : ''
                                  }
                                  onChange={(e) =>
                                    updateSurfaceField(
                                      unit.id,
                                      surface.id,
                                      'coefficient',
                                      Number(e.target.value) / 100
                                    )
                                  }
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                  %
                                </span>
                              </div>
                            </td>

                            {/* Adjusted surface (read-only) */}
                            <td className="py-1.5 px-2">
                              <div className="bg-slate-50 rounded px-2 py-1 text-xs text-right text-slate-700 font-medium">
                                {formatNumber(adjusted)}
                              </div>
                            </td>

                            {/* Unit price */}
                            <td className="py-1.5 px-2">
                              <input
                                type="number"
                                min={0}
                                step={50}
                                className={cn(
                                  'w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-right',
                                  'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20'
                                )}
                                value={surface.unit_price ?? ''}
                                placeholder={String(unit.market_price_sqm || 0)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateSurfaceField(
                                    unit.id,
                                    surface.id,
                                    'unit_price',
                                    val === '' ? null : Number(val)
                                  );
                                }}
                              />
                            </td>

                            {/* Value (read-only) */}
                            <td className="py-1.5 px-2">
                              <div className="bg-slate-50 rounded px-2 py-1 text-xs text-right text-slate-700 font-semibold">
                                {formatCurrency(value)}
                              </div>
                            </td>

                            {/* Delete custom surface */}
                            <td className="py-1.5 px-1">
                              {isCustom && (
                                <button
                                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                  onClick={() => deleteSurface(unit.id, surface.id)}
                                  title="Rimuovi riga"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add custom surface row */}
                <div className="mt-2">
                  <button
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    onClick={() => addCustomSurface(unit.id)}
                  >
                    <Plus className="w-3 h-3" />
                    Aggiungi Riga Superficie
                  </button>
                </div>

                {/* Footer: totals */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                          TOT.LE Complessivo
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatCurrency(calculatedValue)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Comparison indicator */}
                      {target > 0 && (
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium',
                            isAbove && 'bg-emerald-50 text-emerald-700',
                            isBelowThreshold && 'bg-amber-50 text-amber-700',
                            !isAbove &&
                              !isBelowThreshold &&
                              'bg-slate-50 text-slate-600'
                          )}
                        >
                          {isBelowThreshold && (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {diff >= 0 ? '+' : ''}
                          {formatCurrency(diff)}
                        </div>
                      )}

                      {/* Target sale price */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                          PREZZO STABILITO
                        </span>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            className={cn(
                              'w-44 rounded-lg border-2 bg-white px-3 py-2 text-right text-base font-bold transition-colors',
                              'focus:outline-none focus:ring-[3px] focus:ring-blue-500/15',
                              isAbove && target > 0
                                ? 'border-emerald-400 text-emerald-700'
                                : isBelowThreshold
                                ? 'border-amber-400 text-amber-700'
                                : 'border-slate-300 text-slate-900'
                            )}
                            value={unit.target_sale_price || ''}
                            placeholder="0"
                            onChange={(e) =>
                              updateUnitField(
                                unit.id,
                                'target_sale_price',
                                Number(e.target.value)
                              )
                            }
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom summary */}
      {units.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Riepilogo Valori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mobile-scroll-hint">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">
                      Unita
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500 text-xs">
                      Sup. Ragguagliata (mq)
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500 text-xs">
                      Valore Calcolato
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500 text-xs">
                      Prezzo Stabilito
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {formatNumber(row.totalAdjustedSurface)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {formatCurrency(row.calculatedValue)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {row.targetPrice > 0
                          ? formatCurrency(row.targetPrice)
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300">
                    <td className="py-3 px-3 font-bold text-slate-900">TOTALE</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-700">
                      {formatNumber(
                        summary.reduce((s, r) => s + r.totalAdjustedSurface, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-700">
                      {formatCurrency(totalCalculated)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-base">
                      {totalTarget > 0 ? formatCurrency(totalTarget) : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
