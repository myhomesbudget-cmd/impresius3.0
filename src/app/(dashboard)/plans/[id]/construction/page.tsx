'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
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
  Save
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
  ironwork: 'bg-slate-200 text-foreground',
  other: 'bg-muted text-slate-600',
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
  const [activeFloor, setActiveFloor] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeFloors, setActiveFloors] = useState<string[]>([]);
  
  // Tracking modifications
  const [unsavedItems, setUnsavedItems] = useState<Set<string>>(new Set());
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

  // ---- Fetch data ----
  useEffect(() => {
    async function fetchData() {
      const [{ data: itemsData }] = await Promise.all([
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

      const fetchedItems = (itemsData ?? []) as ConstructionItem[];
      setItems(fetchedItems);

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

  const currentFloorItems = useMemo(
    () => itemsByFloor.get(activeFloor) ?? [],
    [itemsByFloor, activeFloor]
  );

  const floorTotal = useMemo(
    () =>
      currentFloorItems.reduce(
        (sum, item) => sum + calculateItemTotal(item, measurementsByItem.get(item.id) ?? []),
        0
      ),
    [currentFloorItems, measurementsByItem]
  );

  const grandTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + calculateItemTotal(item, measurementsByItem.get(item.id) ?? []),
        0
      ),
    [items, measurementsByItem]
  );

  // ---- Update item field in local state only ----
  const updateItem = useCallback((itemId: string, field: keyof ConstructionItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
    setUnsavedItems((prev) => new Set([...prev, itemId]));
  }, []);

  // ---- Update measurement field in local state only ----
  const updateMeasurement = useCallback((measurementId: string, itemId: string, field: keyof Measurement, value: string | number) => {
    setMeasurements((prev) => prev.map((m) => (m.id === measurementId ? { ...m, [field]: value } : m)));
    setUnsavedItems((prev) => new Set([...prev, itemId]));
  }, []);

  // ---- Explicit Save Function ----
  const saveItem = useCallback(async (itemId: string) => {
    setSavingItems(prev => new Set([...prev, itemId]));

    const itemToSave = items.find(i => i.id === itemId);
    const measurementsToSave = measurementsByItem.get(itemId) ?? [];

    if (itemToSave) {
      const { error: itemError } = await supabase.from('construction_items').update({
        title: itemToSave.title,
        category: itemToSave.category,
        description: itemToSave.description,
        unit_of_measure: itemToSave.unit_of_measure,
        unit_price: itemToSave.unit_price,
        updated_at: new Date().toISOString()
      }).eq('id', itemId);

      if (itemError) {
        toast({ title: 'Errore', description: 'Impossibile salvare la voce.', variant: 'destructive' });
        setSavingItems(prev => { const next = new Set(prev); next.delete(itemId); return next; });
        return;
      }
    }

    // Process measurements
    let measurementError = false;
    for (const m of measurementsToSave) {
      if (!m.id.startsWith('temp-')) {
        const { error: mError } = await supabase.from('measurements').update({
          description: m.description,
          parts: m.parts,
          length: m.length,
          width: m.width,
          height_weight: m.height_weight
        }).eq('id', m.id);
        if (mError) measurementError = true;
      }
    }

    setSavingItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });

    if (measurementError) {
      toast({ title: 'Errore Parziale', description: 'Alcune misurazioni non sono state salvate correttamente.', variant: 'destructive' });
    } else {
      setUnsavedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      toast({ title: 'Voce Salvata', description: 'Le modifiche alla voce e alle misure sono state salvate nel cloud.' });
    }
  }, [items, measurementsByItem, supabase]);

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
      // Automatically mark as unsaved so the user clicks save when they finish editing the new item.
      setUnsavedItems(prev => new Set([...prev, created.id]));
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
      setUnsavedItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
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
        setUnsavedItems((prev) => new Set([...prev, itemId]));
      }
    },
    [measurementsByItem, supabase]
  );

  // ---- Delete measurement ----
  const deleteMeasurement = useCallback(
    async (measurementId: string, itemId: string) => {
      await supabase.from('measurements').delete().eq('id', measurementId);
      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
      setUnsavedItems((prev) => new Set([...prev, itemId]));
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
      <div className="flex-1 p-4 md:p-8 pb-32 lg:pb-24 max-w-6xl">
        {/* ---- Header ---- */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header-title">
                Computo Metrico Opere
              </h1>
              <p className="page-header-subtitle">
                Area 2 &mdash; Dettaglio lavorazioni e misurazioni per piano
              </p>
            </div>
          </div>
        </div>

        {/* ---- Floor Tabs ---- */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 overflow-x-auto mobile-scroll-hint">
            {activeFloors.map((floor) => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeFloor === floor
                    ? 'bg-card text-blue-700 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {getFloorLabel(activeFloor)}
          </span>
        </div>

        {/* ---- Items List ---- */}
        {currentFloorItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
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
              const isUnsaved = unsavedItems.has(item.id);
              const isSaving = savingItems.has(item.id);

              return (
                <Card
                  key={item.id}
                  className={cn(
                    'transition-all duration-200 border-2',
                    isUnsaved ? 'border-amber-400/50 outline outline-2 outline-amber-400/20' : 'border-border',
                    isExpanded && !isUnsaved && 'ring-2 ring-blue-500/20 shadow-md border-transparent'
                  )}
                >
                  {/* ---- Collapsed Header ---- */}
                  <div
                    className={cn(
                      "flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 cursor-pointer select-none",
                      isUnsaved && "bg-amber-50/30"
                    )}
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold shrink-0">
                      {item.item_number}
                    </div>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}

                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      {isUnsaved && !isExpanded && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Modifiche non salvate" />
                      )}
                    </div>

                    <span
                      className={cn(
                        'shrink-0 px-2 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-medium hidden sm:inline-flex',
                        CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other
                      )}
                    >
                      {getCategoryLabel(item.category)}
                    </span>

                    <div className="shrink-0 text-right hidden md:block min-w-[80px]">
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(totalQuantity)} {item.unit_of_measure}
                      </p>
                    </div>

                    <div className="shrink-0 text-right hidden md:block min-w-[60px]">
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right min-w-[70px] sm:min-w-[100px]">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {formatCurrency(totalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* ---- Expanded Content ---- */}
                  {isExpanded && (
                    <CardContent className={cn("border-t border-border pt-5", isUnsaved && "bg-amber-50/10")}>
                      {/* Item Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <Input
                          label="Titolo"
                          value={item.title}
                          onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="w-full">
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              Categoria
                            </label>
                            <select
                              className={cn(
                                'flex h-11 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors',
                                'focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15'
                              )}
                              value={item.category}
                              onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                            >
                              {CONSTRUCTION_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              U.M.
                            </label>
                            <select
                              className={cn(
                                'flex h-11 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors',
                                'focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15'
                              )}
                              value={item.unit_of_measure}
                              onChange={(e) => updateItem(item.id, 'unit_of_measure', e.target.value)}
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
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Descrizione
                          </label>
                          <textarea
                            className={cn(
                              'flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors',
                              'placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15',
                              'min-h-[60px] resize-y'
                            )}
                            placeholder="Descrizione della lavorazione..."
                            value={item.description ?? ''}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
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
                            onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Measurements Table */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-foreground">
                            Misurazioni
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addMeasurement(item.id)}
                            className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Aggiungi Misurazione
                          </Button>
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden overflow-x-auto mobile-scroll-hint">
                          {/* Table Header */}
                          <div className="grid grid-cols-[minmax(120px,1fr)_60px_70px_70px_70px_80px_32px] md:grid-cols-[1fr_70px_80px_80px_80px_90px_32px] gap-px bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[520px]">
                            <div className="px-2 md:px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>Descrizione</div>
                            <div className="px-1 md:px-2 py-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>Par.ug</div>
                            <div className="px-1 md:px-2 py-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>Lung.</div>
                            <div className="px-1 md:px-2 py-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>Larg.</div>
                            <div className="px-1 md:px-2 py-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>H/peso</div>
                            <div className="px-1 md:px-2 py-2 text-right" style={{ background: 'rgba(255,255,255,0.03)' }}>Quantita</div>
                            <div style={{ background: 'rgba(255,255,255,0.03)' }} />
                          </div>

                          {/* Table Rows */}
                          {itemMeasurements.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                              Nessuna misurazione &mdash; clicca &ldquo;Aggiungi Misurazione&rdquo;
                            </div>
                          ) : (
                            itemMeasurements.map((m) => {
                              const qty = calculateMeasurementQuantity(m);
                              return (
                                <div
                                  key={m.id}
                                  className="grid grid-cols-[minmax(120px,1fr)_60px_70px_70px_70px_80px_32px] md:grid-cols-[1fr_70px_80px_80px_80px_90px_32px] gap-px border-t border-border bg-black/5 dark:bg-white/[0.02] min-w-[520px]"
                                >
                                  <div className="px-2 py-1">
                                    <input
                                      type="text"
                                      className="h-8 w-full border-transparent bg-transparent text-sm hover:border-border focus:border-blue-500 focus:bg-black/5 dark:focus:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      placeholder="Descrizione"
                                      value={m.description ?? ''}
                                      onChange={(e) => updateMeasurement(m.id, item.id, 'description', e.target.value)}
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-foreground focus:bg-blue-500/10 dark:focus:bg-blue-500/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.parts || ''}
                                      onChange={(e) => updateMeasurement(m.id, item.id, 'parts', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-foreground focus:bg-blue-500/10 dark:focus:bg-blue-500/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.length || ''}
                                      onChange={(e) => updateMeasurement(m.id, item.id, 'length', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-foreground focus:bg-blue-500/10 dark:focus:bg-blue-500/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.width || ''}
                                      onChange={(e) => updateMeasurement(m.id, item.id, 'width', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="px-1 py-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="h-8 w-full rounded border-0 bg-transparent px-1 text-sm text-center text-foreground focus:bg-blue-500/10 dark:focus:bg-blue-500/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={m.height_weight || ''}
                                      onChange={(e) => updateMeasurement(m.id, item.id, 'height_weight', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="flex items-center justify-end px-2 py-1">
                                    <span className="text-sm font-medium text-foreground">
                                      {formatNumber(qty)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center py-1">
                                    <button
                                      onClick={() => deleteMeasurement(m.id, item.id)}
                                      className="p-1 rounded text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {/* SOMMANO Row */}
                          <div className="grid grid-cols-[minmax(120px,1fr)_60px_70px_70px_70px_80px_32px] md:grid-cols-[1fr_70px_80px_80px_80px_90px_32px] gap-px border-t-2 border-blue-200 bg-blue-50/60 min-w-[520px]">
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
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(totalQuantity)} {item.unit_of_measure} &times;{' '}
                            {formatCurrency(item.unit_price)}
                          </span>
                          <span className="text-base font-bold text-foreground">
                            Totale: {formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Manual Action Buttons */}
                      <div className="flex justify-between items-center pt-5 mt-6 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Elimina voce
                        </Button>

                        <Button
                          variant={isUnsaved ? "default" : "outline"}
                          size="default"
                          onClick={() => saveItem(item.id)}
                          disabled={!isUnsaved || isSaving}
                          className={cn(
                            "gap-2 font-semibold shadow-sm px-6 py-5 transition-all",
                            isUnsaved && !isSaving ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 ring-2 ring-amber-500/20" : ""
                          )}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Salvataggio...
                            </>
                          ) : isUnsaved ? (
                            <>
                              <Save className="w-5 h-5" />
                              Salva Modifiche
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              Tutto Salvato
                            </>
                          )}
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
              className="gap-1.5 w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 py-6"
            >
              <Plus className="w-5 h-5" />
              Aggiungi Nuova Voce al Piano
            </Button>
          </div>
        )}

        {/* ---- Floor Summary ---- */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-muted border border-border px-5 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {currentFloorItems.length}
              </span>{' '}
              {currentFloorItems.length === 1 ? 'voce' : 'voci'} &middot;{' '}
              {activeFloor}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Totale {activeFloor}
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(floorTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Sticky Grand Total Bar ---- */}
      <div className="fixed bottom-[4.5rem] lg:bottom-0 left-0 right-0 backdrop-blur-md z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] bg-white/95 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-7">
            {activeFloors.map((floor) => {
              const floorItems = itemsByFloor.get(floor) ?? [];
              const ft = floorItems.reduce(
                (sum, item) =>
                  sum + calculateItemTotal(item, measurementsByItem.get(item.id) ?? []),
                0
              );
              return (
                <div key={floor} className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{floor}</p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(ft)}</p>
                </div>
              );
            })}
          </div>
          <div className="text-right ml-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Totale Computo</p>
            <p className="text-lg md:text-xl font-extrabold tabular-nums text-blue-600">
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
