'use client';

import * as React from 'react';
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
import type { ConstructionItem, Measurement, Project } from '@/types/database';
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
  Save,
  Printer,
  MapPin
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

function PriceInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [focused, setFocused] = useState(false);
  const [localVal, setLocalVal] = useState('');

  const displayValue = focused
    ? localVal
    : value === 0
    ? ''
    : formatCurrency(value);

  const handleFocus = () => {
    setFocused(true);
    setLocalVal(value === 0 ? '' : value.toString().replace('.', ','));
  };

  const handleBlur = () => {
    setFocused(false);
    if (!localVal.trim()) {
      onChange(0);
      return;
    }
    const cleanStr = localVal.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanStr);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <input
      type="text"
      className="w-full bg-transparent px-2 py-2 text-right text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
      placeholder="0,00 €"
      value={displayValue}
      onFocus={handleFocus}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
    />
  );
}

export default function ComputoMetricoPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  // ---- State ----
  const [project, setProject] = useState<Project | null>(null);
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
      const [{ data: projectData }, { data: itemsData }] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single(),
        supabase
          .from('construction_items')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order', { ascending: true })
      ]);

      if (projectData) setProject(projectData as Project);
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
      } as Record<string, unknown>).eq('id', itemId);

      if (itemError) {
        console.error('[saveItem] Supabase error on construction_items update:', JSON.stringify(itemError));
        toast('Errore: impossibile salvare la voce. Riprova.', 'error');
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
          parts: String(m.parts) === '-' || String(m.parts) === '' ? null : Number(m.parts),
          length: String(m.length) === '-' || String(m.length) === '' ? null : Number(m.length),
          width: String(m.width) === '-' || String(m.width) === '' ? null : Number(m.width),
          height_weight: String(m.height_weight) === '-' || String(m.height_weight) === '' ? null : Number(m.height_weight)
        } as Record<string, unknown>).eq('id', m.id);
        if (mError) {
          console.error('[saveItem] Supabase error on measurements update:', JSON.stringify(mError));
          measurementError = true;
        }
      }
    }

    setSavingItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });

    if (measurementError) {
      toast('Errore: alcune misurazioni non sono state salvate. Riprova.', 'error');
    } else {
      setUnsavedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      toast('Voce salvata correttamente nel cloud ✓', 'success');
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
  const addFloor = useCallback((floorValue: string) => {
    if (!activeFloors.includes(floorValue)) {
      setActiveFloors((prev) => [...prev, floorValue]);
      setActiveFloor(floorValue);
    }
  }, [activeFloors]);

  // ---- Remove floor ----
  const removeFloor = useCallback((floorToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const hasItems = items.some((i) => i.floor === floorToRemove);
    if (hasItems) {
      toast("Attenzione: questo piano contiene voci. Eliminale prima di rimuoverlo dalla vista.", "error");
      return;
    }

    setActiveFloors((prev) => {
      const next = prev.filter((f) => f !== floorToRemove);
      if (activeFloor === floorToRemove) {
        setActiveFloor(next.length > 0 ? next[0] : '');
      }
      return next;
    });
  }, [items, activeFloor]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const reportDate = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
          }
          body * {
            visibility: hidden;
          }
          #report-content,
          #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 15mm 15mm;
            size: A4;
          }
          .print-page-break {
            page-break-before: always;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          th { border-bottom: 2px solid #000 !important; color: #000 !important; }
          td { color: #000 !important; border-color: #e5e7eb !important; }
        }
      `}</style>
      
      <div className="no-print flex flex-col min-h-[calc(100vh-4rem)]">
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
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="gap-2.5 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm no-print"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Stampa PDF</span>
              </Button>
            </div>
          </div>

        {/* ---- Floor Tabs ---- */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 overflow-x-auto mobile-scroll-hint">
            {activeFloors.map((floor) => (
              <div key={floor} className="relative group flex items-center">
                <button
                  onClick={() => setActiveFloor(floor)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 pr-8',
                    activeFloor === floor
                      ? 'bg-card text-blue-700 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  {floor}
                </button>
                <button
                  onClick={(e) => removeFloor(floor, e)}
                  title="Rimuovi piano dalla vista"
                  className={cn(
                    "absolute right-1.5 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                    activeFloor === floor ? "text-blue-500 hover:bg-blue-100" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="relative inline-flex">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) addFloor(e.target.value);
              }}
              disabled={activeFloors.length >= FLOORS.length}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              title="Scegli un piano da aggiungere"
            >
              <option value="" disabled>Aggiungi Piano...</option>
              {FLOORS.filter(f => !activeFloors.includes(f.value)).map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={activeFloors.length >= FLOORS.length}
              className="gap-1.5 rounded-xl h-10 border-dashed text-muted-foreground pointer-events-none"
            >
              <Plus className="w-4 h-4" />
              Aggiungi Piano
            </Button>
          </div>
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
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-semibold border-b border-border">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center border-r border-border">Nr.</th>
                    <th className="px-3 py-3 min-w-[300px] border-r border-border">Designazione dei Lavori</th>
                    <th className="px-3 py-3 w-20 text-center border-r border-border" title="Parti Uguali">Par.Ug</th>
                    <th className="px-3 py-3 w-20 text-center border-r border-border" title="Lunghezza">Lung.</th>
                    <th className="px-3 py-3 w-20 text-center border-r border-border" title="Larghezza">Larg.</th>
                    <th className="px-3 py-3 w-20 text-center border-r border-border" title="Altezza / Peso">H/Peso</th>
                    <th className="px-3 py-3 w-24 text-right border-r border-border">Quantità</th>
                    <th className="px-3 py-3 w-32 text-right border-r border-border">Unitario €</th>
                    <th className="px-3 py-3 w-32 text-right border-r border-border">Totale €</th>
                    <th className="px-3 py-3 w-16 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentFloorItems.map((item) => {
                    const itemMeasurements = measurementsByItem.get(item.id) ?? [];
                    const totalQuantity = calculateItemQuantity(itemMeasurements);
                    const totalPrice = calculateItemTotal(item, itemMeasurements);
                    const isUnsaved = unsavedItems.has(item.id);
                    const isSaving = savingItems.has(item.id);

                    return (
                      <React.Fragment key={item.id}>
                        {/* Riga Principale della Voce (Titolo e Prezzo) */}
                        <tr className={cn("group transition-colors", isUnsaved ? "bg-amber-50/20" : "bg-card hover:bg-muted/30")}>
                          <td className="px-3 py-2 text-center font-bold text-muted-foreground border-r border-border align-top pt-3">
                            {item.item_number}
                          </td>
                          <td className="p-0 border-r border-border align-top">
                            <div className="flex flex-col h-full h-full min-h-[40px]">
                              {/* Titolo e Categoria */}
                              <div className="flex p-1 border-b border-border/50 items-center justify-between gap-2">
                                <input
                                  type="text"
                                  className="flex-1 bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                                  placeholder="Titolo lavorazione..."
                                  value={item.title}
                                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                />
                                <div className="flex items-center gap-1 shrink-0 px-1">
                                  <select
                                     className="bg-transparent text-xs text-muted-foreground border-none px-1 py-1 focus:ring-0 cursor-pointer rounded hover:bg-accent"
                                     value={item.category}
                                     onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                                  >
                                    {CONSTRUCTION_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                  </select>
                                  <select
                                     className="bg-transparent text-xs font-semibold text-foreground border-none px-1 py-1 focus:ring-0 cursor-pointer rounded hover:bg-accent"
                                     value={item.unit_of_measure}
                                     onChange={(e) => updateItem(item.id, 'unit_of_measure', e.target.value)}
                                  >
                                    {UNITS_OF_MEASURE.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                  </select>
                                </div>
                              </div>
                              {/* Descrizione Lavorazione */}
                              <textarea
                                className="w-full bg-transparent px-3 py-2 text-sm text-foreground/80 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-b min-h-[60px] resize-y"
                                placeholder="Descrizione estesa (opzionale)..."
                                value={item.description ?? ''}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              />
                            </div>
                          </td>
                          {/* Celle Vuote per le misurazioni nella riga principale */}
                          <td className="bg-muted/10 border-r border-border" colSpan={5}></td>
                          <td className="p-1 border-r border-border align-top bg-muted/10">
                            <PriceInput
                              value={item.unit_price || 0}
                              onChange={(val) => updateItem(item.id, 'unit_price', val)}
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-bold border-r border-border align-top pt-3 bg-muted/10">
                            {formatCurrency(totalPrice)}
                          </td>
                          <td className="px-2 py-2 text-center align-top pt-3">
                             <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteItem(item.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                title="Elimina intera voce"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                          </td>
                        </tr>

                        {/* Intestazione Misurazioni Interna (Opzionale, visiva per raggruppamento) */}
                        {itemMeasurements.length > 0 && (
                          <tr className={cn(isUnsaved ? "bg-amber-50/10" : "bg-card")}>
                             <td className="border-r border-border"></td>
                             <td className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase border-r border-border bg-muted/20">
                               Riga Misurazioni:
                             </td>
                             <td colSpan={8} className="bg-muted/20"></td>
                          </tr>
                        )}

                        {/* Righe Misurazioni (Dettaglio) */}
                        {itemMeasurements.map((m) => {
                          const qty = calculateMeasurementQuantity(m);
                          return (
                            <tr key={m.id} className={cn("hover:bg-muted/50", isUnsaved && "bg-amber-50/10")}>
                               <td className="border-r border-border"></td>
                               <td className="p-0 border-r border-border border-b border-border/30 pl-6">
                                  <input
                                    type="text"
                                    className="w-full bg-transparent px-3 py-1.5 text-sm text-muted-foreground focus:outline-none focus:text-foreground focus:ring-1 focus:ring-blue-500"
                                    placeholder="Descrizione riga (es. Finestra cucina)"
                                    value={m.description ?? ''}
                                    onChange={(e) => updateMeasurement(m.id, item.id, 'description', e.target.value)}
                                  />
                               </td>
                               <td className="p-0 border-r border-border border-b border-border/30">
                                  <input
                                      type="number"
                                      step="1"
                                      className="w-full bg-transparent px-1 py-1.5 text-center text-sm focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                      placeholder="-"
                                      value={m.parts === 0 ? '' : m.parts ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateMeasurement(m.id, item.id, 'parts', val === '' || val === '-' ? val : parseFloat(val));
                                      }}
                                    />
                               </td>
                               <td className="p-0 border-r border-border border-b border-border/30">
                                  <input
                                      type="number"
                                      step="0.01"
                                      className="w-full bg-transparent px-1 py-1.5 text-center text-sm focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                      placeholder="-"
                                      value={m.length === 0 ? '' : m.length ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateMeasurement(m.id, item.id, 'length', val === '' || val === '-' ? val : parseFloat(val));
                                      }}
                                    />
                               </td>
                               <td className="p-0 border-r border-border border-b border-border/30">
                                  <input
                                      type="number"
                                      step="0.01"
                                      className="w-full bg-transparent px-1 py-1.5 text-center text-sm focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                      placeholder="-"
                                      value={m.width === 0 ? '' : m.width ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateMeasurement(m.id, item.id, 'width', val === '' || val === '-' ? val : parseFloat(val));
                                      }}
                                    />
                               </td>
                               <td className="p-0 border-r border-border border-b border-border/30">
                                  <input
                                      type="number"
                                      step="0.01"
                                      className="w-full bg-transparent px-1 py-1.5 text-center text-sm focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                      placeholder="-"
                                      value={m.height_weight === 0 ? '' : m.height_weight ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateMeasurement(m.id, item.id, 'height_weight', val === '' || val === '-' ? val : parseFloat(val));
                                      }}
                                    />
                               </td>
                               <td className="px-3 py-1.5 text-right font-medium text-sm border-r border-border border-b border-border/30 bg-muted/5">
                                 {formatNumber(qty)}
                               </td>
                               <td colSpan={2} className="border-r border-border border-b border-border/30 bg-muted/5"></td>
                               <td className="px-2 py-1 text-center border-b border-border/30">
                                  <button
                                    onClick={() => deleteMeasurement(m.id, item.id)}
                                    className="p-1 rounded text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    title="Elimina misurazione"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                               </td>
                            </tr>
                          );
                        })}

                        {/* Riga Sommario Voce e Azioni (Aggiungi/Salva) */}
                        <tr className={cn("border-b-4 border-muted", isUnsaved ? "bg-amber-50/20" : "bg-card")}>
                           <td className="border-r border-border"></td>
                           <td className="px-3 py-2 flex items-center justify-between border-r border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addMeasurement(item.id)}
                                className="h-7 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Riga Misuraz.
                              </Button>
                              <span className="text-xs font-bold text-muted-foreground uppercase">Sommano:</span>
                           </td>
                           <td colSpan={4} className="border-r border-border bg-blue-50/30"></td>
                           <td className="px-3 py-2 text-right font-bold text-sm text-blue-700 bg-blue-50/50 border-r border-border">
                              {formatNumber(totalQuantity)}
                           </td>
                           <td colSpan={2} className="border-r border-border"></td>
                           <td className="p-2 text-center">
                              <div className="flex justify-center">
                                <Button
                                  variant={isUnsaved ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => saveItem(item.id)}
                                  disabled={!isUnsaved || isSaving}
                                  className={cn(
                                    "h-8 w-8 p-0 rounded-full transition-all duration-300",
                                    isUnsaved ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 animate-pulse-ring" : "border-emerald-500 text-emerald-600 bg-emerald-50/50"
                                  )}
                                  title={isUnsaved ? "Salva Modifiche" : "Salvato"}
                                >
                                  {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : isUnsaved ? (
                                    <Save className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                           </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">
                Totale {getFloorLabel(activeFloor)}
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(currentFloorItems.reduce((acc, item) => {
                   const itemMeasurements = measurementsByItem.get(item.id) ?? [];
                   return acc + calculateItemTotal(item, itemMeasurements);
                }, 0))}
              </span>
            </div>
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
        </div>
      </div>
      </div>

      {/* ============ STAMPA COMPUTO METRICO A4 ============ */}
      <div id="report-content" className="hidden print:block bg-white text-black mx-auto max-w-[210mm] shadow-2xl print:shadow-none print:max-w-full">
        {/* FOGLIO A4 PADDING FRONTALE */}
        <div className="p-8 md:p-12">
          
          {/* INTESTAZIONE DOCUMENTO */}
          <div className="border-b-[3px] border-black pb-5 mb-8 flex justify-between items-end">
            <div className="max-w-[70%]">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-[#d4af37]" />
                <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-500">Impresius Pro</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-black leading-none">
                {project?.name || 'Progetto'}
              </h1>
              {project?.location_address && (
                <p className="text-sm text-gray-600 font-medium mt-3 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  {[project.location_address, project.location_city, project.location_province].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="text-right pb-1">
              <div className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-1">DOCUMENTO</div>
              <div className="text-lg font-black text-black tracking-tight">COMPUTO METRICO</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Data emissione: {reportDate}</div>
            </div>
          </div>

          {/* Dettagli per Piano */}
          <div className="mb-10 pt-2">
            {FLOORS.map((floor) => {
              const floorItems = itemsByFloor.get(floor.value) || [];
              if (floorItems.length === 0) return null;
              
              const ft = floorItems.reduce((sum, item) => sum + calculateItemTotal(item, measurementsByItem.get(item.id) || []), 0);

              return (
                <div key={floor.value} className="mb-12 print-break-inside-avoid">
                  <h4 className="text-[12px] font-bold text-[#d4af37] mb-3 uppercase tracking-widest border-l-2 border-black pl-2">
                    Piano: {floor.label}
                  </h4>
                  <table className="w-full text-[11.5px] text-left border-collapse">
                    <thead>
                      <tr className="border-y border-gray-300 bg-gray-50">
                        <th className="py-2.5 px-2 font-bold text-black uppercase">Nr. / Lavorazione / Misurazioni</th>
                        <th className="py-2.5 px-2 font-bold text-black text-center w-12 uppercase">U.M.</th>
                        <th className="py-2.5 px-2 font-bold text-black text-right w-16 uppercase">Q.tà</th>
                        <th className="py-2.5 px-2 font-bold text-black text-right w-20 uppercase">P. Unit.</th>
                        <th className="py-2.5 px-2 font-bold text-[#d4af37] text-right w-24 uppercase">Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {floorItems.map((item) => {
                        const itemMeas = measurementsByItem.get(item.id) || [];
                        const qty = calculateItemQuantity(itemMeas);
                        const total = calculateItemTotal(item, itemMeas);
                        return (
                          <React.Fragment key={item.id}>
                            <tr className="border-t border-gray-300">
                              <td className="py-2 px-2 text-black font-semibold">
                                <span className="font-bold text-gray-500 mr-2">{item.item_number}</span> 
                                {item.title}
                                <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 ml-6">{getCategoryLabel(item.category)}</div>
                              </td>
                              <td className="py-2 px-2 text-center text-gray-600 font-medium align-top">{item.unit_of_measure}</td>
                              <td className="py-2 px-2 text-right text-gray-800 font-medium align-top">{formatNumber(qty)}</td>
                              <td className="py-2 px-2 text-right text-gray-800 font-medium align-top">{formatCurrency(item.unit_price)}</td>
                              <td className="py-2 px-2 text-right font-bold text-black align-top">{formatCurrency(total)}</td>
                            </tr>
                            {/* Misurazioni detail (optional) */}
                            {itemMeas.length > 0 && itemMeas.map((m, idx) => {
                              const mQty = calculateMeasurementQuantity(m);
                              return (
                                <tr key={m.id} className="border-b border-gray-100 bg-[#fdfdfd]">
                                  <td className="py-1 px-2 pl-8 text-[11px] text-gray-500 italic border-l-[3px] border-gray-100">
                                    - {m.description || `Misurazione ${idx + 1}`} 
                                    <span className="ml-2 text-[10px] text-gray-400">
                                      ({[m.parts !== 0 && m.parts, m.length !== 0 && m.length, m.width !== 0 && m.width, m.height_weight !== 0 && m.height_weight].filter(Boolean).join(' x ')})
                                    </span>
                                  </td>
                                  <td className="py-1 px-2 text-center text-[10px] text-gray-400"></td>
                                  <td className="py-1 px-2 text-right text-[11px] font-medium text-gray-500">{formatNumber(mQty)}</td>
                                  <td className="py-1 px-2"></td>
                                  <td className="py-1 px-2"></td>
                                </tr>
                              )
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="py-3 px-2 text-right font-bold uppercase text-[10px] text-gray-600">Totale {floor.label}:</td>
                        <td className="py-3 px-2 text-right font-bold text-black border-t-[3px] border-black bg-gray-50">{formatCurrency(ft)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-t-[3px] border-black pt-4 flex justify-between items-center print-break-inside-avoid">
            <div className="text-gray-500 text-sm font-semibold uppercase tracking-widest">Totale Generale Computo</div>
            <div className="text-2xl font-black text-black">{formatCurrency(grandTotal)}</div>
          </div>

        </div>
        
        {/* FOGLIO A4 FOOTER BAND */}
        <div className="bg-black px-10 md:px-14 py-4 flex items-center justify-between text-white print-break-inside-avoid">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4af37]">{project?.name || 'Progetto'} &middot; Confidential</span>
          <span className="text-[10px] font-medium opacity-70">Generato con Impresius Pro V3</span>
        </div>
      </div>
    </>
  );
}
