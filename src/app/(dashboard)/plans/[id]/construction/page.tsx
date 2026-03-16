'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  CONSTRUCTION_CATEGORIES,
  FLOORS,
} from '@/types/database';
import type { ConstructionItem, Measurement } from '@/types/database';
import {
  calculateMeasurementQuantity,
  calculateItemQuantity,
  calculateItemTotal,
} from '@/lib/calculations';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Building2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UNITS_OF_MEASURE = [
  { value: 'mq', label: 'mq' },
  { value: 'ml', label: 'ml' },
  { value: 'cad/Una', label: 'cad/Una' },
  { value: 'cad/Uno', label: 'cad/Uno' },
  { value: 'corpo', label: 'corpo' },
  { value: 'a corpo', label: 'a corpo' },
];

const CATEGORY_COLORS: Record<string, string> = {
  demolitions: 'bg-red-100 text-red-700',
  masonry: 'bg-amber-100 text-amber-700',
  plaster: 'bg-yellow-100 text-yellow-700',
  flooring: 'bg-emerald-100 text-emerald-700',
  tiling: 'bg-teal-100 text-teal-700',
  waterproofing: 'bg-cyan-100 text-cyan-700',
  drywall: 'bg-sky-100 text-sky-700',
  doors_windows: 'bg-blue-100 text-blue-700',
  painting: 'bg-violet-100 text-violet-700',
  systems: 'bg-purple-100 text-purple-700',
  balconies: 'bg-pink-100 text-pink-700',
  ironwork: 'bg-gray-200 text-gray-700',
  other: 'bg-gray-100 text-gray-600',
};

function getCategoryLabel(value: string): string {
  return CONSTRUCTION_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function getFloorLabel(value: string): string {
  return FLOORS.find((f) => f.value === value)?.label ?? value;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ComputoMetricoPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  // ---- State ----
  const [items, setItems] = useState<ConstructionItem[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeFloor, setActiveFloor] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeFloors, setActiveFloors] = useState<string[]>([]);

  const debounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ---- Fetch data ----
  useEffect(() => {
    async function fetchData() {
      const [{ data: itemsData }, { data: measurementsData }] = await Promise.all([
        supabase
          .from('construction_items')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order', { ascending: true }),
        supabase
          .from('measurements')
          .select('*')
          .eq('item_id', projectId) // will be filtered client-side
          .order('sort_order', { ascending: true }),
      ]);

      // Measurements need to be fetched via item ids
      const fetchedItems = (itemsData ?? []) as ConstructionItem[];
      setItems(fetchedItems);

      // Now fetch measurements for all items
      if (fetchedItems.length > 0) {
        const itemIds = fetchedItems.map((i) => i.id);
        const { data: mData } = await supabase
          .from('measurements')
          .select('*')
          .in('item_id', itemIds)
          .order('sort_order', { ascending: true });
        setMeasurements((mData ?? []) as Measurement[]);
      } else {
        setMeasurements([]);
      }

      // Determine active floors
      const usedFloors = [...new Set(fetchedItems.map((i) => i.floor))];
      const defaultFloors = usedFloors.length > 0 ? usedFloors : ['PT'];
      setActiveFloors(
        FLOORS.map((f) => f.value).filter((v) => defaultFloors.includes(v))
      );
      setActiveFloor(defaultFloors[0] ?? 'PT');
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ---- Measurements grouped by item ----
  const measurementsByItem = useMemo(() => {
    const map = new Map<string, Measurement[]>();
    for (const m of measurements) {
      const list = map.get(m.item_id) ?? [];
      list.push(m);
      map.set(m.item_id, list);
    }
    return map;
  }, [measurements]);

  // ---- Items grouped by floor ----
  const itemsByFloor = useMemo(() => {
    const map = new Map<string, ConstructionItem[]>();
    for (const item of items) {
      const list = map.get(item.floor) ?? [];
      list.push(item);
      map.set(item.floor, list);
    }
    return map;
  }, [items]);

  // ---- Current floor items ----
  const currentFloorItems = useMemo(
    () => itemsByFloor.get(activeFloor) ?? [],
    [itemsByFloor, activeFloor]
  );

  // ---- Floor total ----
  const floorTotal = useMemo(
    () =>
      currentFloorItems.reduce(
        (sum, item) => sum + calculateItemTotal(item, measurementsByItem.get(item.id) ?? []),
        0
      ),
    [currentFloorItems, measurementsByItem]
  );

  // ---- Grand total ----
  const grandTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + calculateItemTotal(item, measurementsByItem.get(item.id) ?? []),
        0
      ),
    [items, measurementsByItem]
  );

  // ---- Debounced save helper ----
  const debouncedSave = useCallback(
    (key: string, saveFn: () => Promise<void>) => {
      const existing = debounceRefs.current.get(key);
      if (existing) clearTimeout(existing);
      debounceRefs.current.set(
        key,
        setTimeout(async () => {
          setSaving(true);
          setSaved(false);
          await saveFn();
          setSaving(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }, 1000)
      );
    },
    []
  );

  // ---- Update item field ----
  const updateItem = useCallback(
    (itemId: string, field: keyof ConstructionItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
      );

      debouncedSave(`item-${itemId}`, async () => {
        await supabase
          .from('construction_items')
          .update({ [field]: value, updated_at: new Date().toISOString() } as Record<string, unknown>)
          .eq('id', itemId);
      });
    },
    [debouncedSave, supabase]
  );

  // ---- Update measurement field ----
  const updateMeasurement = useCallback(
    (measurementId: string, field: keyof Measurement, value: string | number) => {
      setMeasurements((prev) =>
        prev.map((m) => (m.id === measurementId ? { ...m, [field]: value } : m))
      );

      debouncedSave(`measurement-${measurementId}`, async () => {
        await supabase
          .from('measurements')
          .update({ [field]: value } as Record<string, unknown>)
          .eq('id', measurementId);
      });
    },
    [debouncedSave, supabase]
  );

  // ---- Add new item ----
  const addItem = useCallback(async () => {
    const floorItems = items.filter((i) => i.floor === activeFloor);
    const maxNumber = floorItems.reduce((max, i) => Math.max(max, i.item_number), 0);
    const maxSort = floorItems.reduce((max, i) => Math.max(max, i.sort_order), 0);

    const newItem: Partial<ConstructionItem> = {
      project_id: projectId,
      floor: activeFloor,
      item_number: maxNumber + 1,
      code: null,
      category: 'other',
      title: 'Nuova Voce',
      description: null,
      unit_of_measure: 'mq',
      unit_price: 0,
      sort_order: maxSort + 1,
    };

    const { data, error } = await supabase
      .from('construction_items')
      .insert(newItem)
      .select()
      .single();

    if (!error && data) {
      const created = data as ConstructionItem;
      setItems((prev) => [...prev, created]);
      setExpandedItemId(created.id);
    }
  }, [activeFloor, items, projectId, supabase]);

  // ---- Delete item ----
  const deleteItem = useCallback(
    async (itemId: string) => {
      await supabase.from('measurements').delete().eq('item_id', itemId);
      await supabase.from('construction_items').delete().eq('id', itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setMeasurements((prev) => prev.filter((m) => m.item_id !== itemId));
      if (expandedItemId === itemId) setExpandedItemId(null);
    },
    [expandedItemId, supabase]
  );

  // ---- Add measurement ----
  const addMeasurement = useCallback(
    async (itemId: string) => {
      const itemMeasurements = measurementsByItem.get(itemId) ?? [];
      const maxSort = itemMeasurements.reduce((max, m) => Math.max(max, m.sort_order), 0);

      const newMeasurement: Partial<Measurement> = {
        item_id: itemId,
        description: null,
        parts: 0,
        length: 0,
        width: 0,
        height_weight: 0,
        sort_order: maxSort + 1,
      };

      const { data, error } = await supabase
        .from('measurements')
        .insert(newMeasurement)
        .select()
        .single();

      if (!error && data) {
        setMeasurements((prev) => [...prev, data as Measurement]);
      }
    },
    [measurementsByItem, supabase]
  );

  // ---- Delete measurement ----
  const deleteMeasurement = useCallback(
    async (measurementId: string) => {
      await supabase.from('measurements').delete().eq('id', measurementId);
      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
    },
    [supabase]
  );

  // ---- Add floor ----
  const addFloor = useCallback(() => {
    const allFloorValues = FLOORS.map((f) => f.value);
    const nextFloor = allFloorValues.find((f) => !activeFloors.includes(f));
    if (nextFloor) {
      setActiveFloors((prev) => {
        const updated = [...prev, nextFloor];
        return allFloorValues.filter((f) => updated.includes(f));
      });
      setActiveFloor(nextFloor);
    }
  }, [activeFloors]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 p-4 md:p-8 pb-24 max-w-6xl">
        {/* ---- Header ---- */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Computo Metrico Opere
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Area 2 &mdash; Dettaglio lavorazioni e misurazioni per piano
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saving && (
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvataggio...
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Salvato
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ---- Floor Tabs ---- */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            {activeFloors.map((floor) => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeFloor === floor
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                )}
              >
                {floor}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addFloor}
            disabled={activeFloors.length >= FLOORS.length}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Piano
          </Button>
        </div>

        {/* ---- Floor Label ---- */}
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">
            {getFloorLabel(activeFloor)}
          </span>
        </div>

        {/* ---- Items List ---- */}
        {currentFloorItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 className="w-10 h-10 mb-3" />
            <p className="text-sm">Nessuna voce per questo piano</p>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-4 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Aggiungi prima voce
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentFloorItems.map((item) => {
              const itemMeasurements = measurementsByItem.get(item.id) ?? [];
              const totalQuantity = calculateItemQuantity(itemMeasurements);
              const totalPrice = calculateItemTotal(item, itemMeasurements);
              const isExpanded = expandedItemId === item.id;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    'transition-all duration-200',
                    isExpanded && 'ring-2 ring-blue-500/20 shadow-md'
                  )}
                >
                  {/* ---- Collapsed Header ---- */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedItemId(isExpanded ? null : item.id)
                    }
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold shrink-0">
                      {item.item_number}
                    </div>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium',
                        CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other
                      )}
                    >
                      {getCategoryLabel(item.category)}
                    </span>

                    <div className="shrink-0 text-right min-w-[80px]">
                      <p className="text-xs text-gray-400">
                        {formatNumber(totalQuantity)} {item.unit_of_measure}
                      </p>
                    </div>

                    <div className="shrink-0 text-right min-w-[60px]">
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right min-w-[100px]">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(totalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* ---- Expanded Content ---- */}
                  {isExpanded && (
                    <CardContent className="border-t border-gray-100 pt-5">
                      {/* Item Details */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <Input
                          label="Titolo"
                          value={item.title}
                          onChange={(e) =>
                            updateItem(item.id, 'title', e.target.value)
                          }
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Categoria
                            </label>
                            <select
                              className={cn(
                                'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
                                'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                              )}
                              value={item.category}
                              onChange={(e) =>
                                updateItem(item.id, 'category', e.target.value)
                              }
                            >
                              {CONSTRUCTION_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              U.M.
                            </label>
                            <select
                              className={cn(
                                'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
                                'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                              )}
                              value={item.unit_of_measure}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  'unit_of_measure',
                                  e.target.value
                                )
                              }
                            >
                              {UNITS_OF_MEASURE.map((u) => (
                                <option key={u.value} value={u.value}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Descrizione
                          </label>
                          <textarea
                            className={cn(
                              'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
                              'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                              'min-h-[60px] resize-y'
                            )}
                            placeholder="Descrizione della lavorazione..."
                            value={item.description ?? ''}
                            onChange={(e) =>
                              updateItem(item.id, 'description', e.target.value)
                            }
                          />
                        </div>

                        <div className="w-full">
                          <Input
                            label="Prezzo Unitario"
                            type="number"
                            step="0.01"
                            min="0"
                            suffix="€"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                'unit_price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Measurements Table */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Misurazioni
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addMeasurement(item.id)}
                            className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Aggiungi Misurazione
                          </Button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Table Header */}
                          <div className="grid grid-cols-[1fr_70px_80px_80px_80px_90px_32px] gap-px bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <div className="bg-gray-50 px-3 py-2">Descrizione</div>
                            <div className="bg-gray-50 px-2 py-2 text-center">
                              Par.ug
                            </div>
                            <div className="bg-gray-50 px-2 py-2 text-center">
                              Lung.
                            </div>
                            <div className="bg-gray-50 px-2 py-2 text-center">
                              Larg.
                            </div>
                            <div className="bg-gray-50 px-2 py-2 text-center">
                              H/peso
                            </div>
                            <div className="bg-gray-50 px-2 py-2 text-right">
                              Quantita
                            </div>
                            <div className="bg-gray-50" />
                          </div>

                          {/* Table Rows */}
                          {itemMeasurements.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-400 text-center">
                              Nessuna misurazione &mdash; clicca &ldquo;Aggiungi
                              Misurazione&rdquo;
                            </div>
                          ) : (
                            itemMeasurements.map((m) => {
                              const qty = calculateMeasurementQuantity(m);
                              return (
                                <div
                                  key={m.id}
                                  className="grid grid-cols-[1fr_70px_80px_80px_80px_90px_32px] gap-px border-t border-gray-100 bg-white"
                                >
                                  <div className="px-2 py-1">
                                    <input
                                      type="text"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-gray-700 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      placeholder="Descrizione"
                                      value={m.description ?? ''}
                                      onChange={(e) =>
                                        updateMeasurement(
                                          m.id,
                                          'description',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-gray-700 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.parts || ''}
                                      onChange={(e) =>
                                        updateMeasurement(
                                          m.id,
                                          'parts',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-gray-700 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.length || ''}
                                      onChange={(e) =>
                                        updateMeasurement(
                                          m.id,
                                          'length',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-gray-700 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.width || ''}
                                      onChange={(e) =>
                                        updateMeasurement(
                                          m.id,
                                          'width',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-gray-700 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.height_weight || ''}
                                      onChange={(e) =>
                                        updateMeasurement(
                                          m.id,
                                          'height_weight',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex items-center justify-end px-2 py-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {formatNumber(qty)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center py-1">
                                    <button
                                      onClick={() => deleteMeasurement(m.id)}
                                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {/* SOMMANO Row */}
                          <div className="grid grid-cols-[1fr_70px_80px_80px_80px_90px_32px] gap-px border-t-2 border-blue-200 bg-blue-50/60">
                            <div className="px-3 py-2.5 text-sm font-bold text-blue-800 uppercase tracking-wide col-span-5">
                              Sommano
                            </div>
                            <div className="flex items-center justify-end px-2 py-2.5">
                              <span className="text-sm font-bold text-blue-800">
                                {formatNumber(totalQuantity)} {item.unit_of_measure}
                              </span>
                            </div>
                            <div />
                          </div>
                        </div>

                        {/* Total price for this item */}
                        <div className="flex items-center justify-between mt-3 px-1">
                          <span className="text-sm text-gray-500">
                            {formatNumber(totalQuantity)} {item.unit_of_measure} &times;{' '}
                            {formatCurrency(item.unit_price)}
                          </span>
                          <span className="text-base font-bold text-gray-900">
                            Totale: {formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Item */}
                      <div className="flex justify-end pt-3 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Elimina voce
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* ---- Add Item Button ---- */}
        {currentFloorItems.length > 0 && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={addItem}
              className="gap-1.5 w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50/50"
            >
              <Plus className="w-4 h-4" />
              Aggiungi Voce
            </Button>
          </div>
        )}

        {/* ---- Floor Summary ---- */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-5 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">
                {currentFloorItems.length}
              </span>{' '}
              {currentFloorItems.length === 1 ? 'voce' : 'voci'} &middot;{' '}
              {activeFloor}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Totale {activeFloor}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(floorTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Sticky Grand Total Bar ---- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {activeFloors.map((floor) => {
              const floorItems = itemsByFloor.get(floor) ?? [];
              const ft = floorItems.reduce(
                (sum, item) =>
                  sum + calculateItemTotal(item, measurementsByItem.get(item.id) ?? []),
                0
              );
              return (
                <div key={floor} className="text-center">
                  <p className="text-xs text-gray-400">{floor}</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatCurrency(ft)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Totale Computo Metrico
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
