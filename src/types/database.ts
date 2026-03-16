// =============================================
// IMPRESIUS 3.0 - Type Definitions
// =============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  subscription_plan: 'free' | 'premium';
  subscription_expires_at: string | null;
  free_plan_used: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  location_city: string | null;
  location_province: string | null;
  location_address: string | null;
  property_type: 'residenziale' | 'commerciale' | 'misto';
  strategy: 'ristrutturazione' | 'frazionamento' | 'nuova_costruzione' | 'rivendita';
  status: 'draft' | 'active' | 'archived';
  is_free_plan: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyUnit {
  id: string;
  project_id: string;
  name: string;
  floor: string;
  destination: string;
  market_price_sqm: number;
  target_sale_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UnitSurface {
  id: string;
  unit_id: string;
  surface_type: string;
  gross_surface: number;
  coefficient: number;
  unit_price: number | null;
  floor_reference: string | null;
  sort_order: number;
}

export interface AcquisitionCost {
  id: string;
  project_id: string;
  category: string;
  label: string;
  calculation_type: 'fixed' | 'percentage';
  base_value: number;
  percentage: number;
  fixed_amount: number;
  sort_order: number;
}

export type OperationCostSection = 'management' | 'utilities' | 'professionals' | 'permits';

export interface OperationCost {
  id: string;
  project_id: string;
  section: OperationCostSection;
  category: string;
  label: string;
  calculation_type: 'fixed' | 'percentage' | 'unit_quantity';
  base_value: number;
  percentage: number;
  unit_price: number;
  quantity: number;
  quantity_unit: string | null;
  sort_order: number;
}

export interface ConstructionItem {
  id: string;
  project_id: string;
  floor: string;
  item_number: number;
  code: string | null;
  category: string;
  title: string;
  description: string | null;
  unit_of_measure: string;
  unit_price: number;
  sort_order: number;
  created_at: string;
  // Computed / joined
  measurements?: Measurement[];
  total_quantity?: number;
  total_price?: number;
}

export interface Measurement {
  id: string;
  item_id: string;
  description: string | null;
  parts: number;
  length: number;
  width: number;
  height_weight: number;
  sort_order: number;
  // Computed
  quantity?: number;
}

export interface Scenario {
  id: string;
  project_id: string;
  name: string;
  type: 'conservative' | 'realistic' | 'optimistic' | 'custom';
  sale_price_variation: number;
  construction_cost_variation: number;
  acquisition_cost_variation: number;
  results_snapshot: ProjectResults | null;
  created_at: string;
}

export interface ActualCost {
  id: string;
  project_id: string;
  reference_type: 'acquisition' | 'operation' | 'construction';
  reference_id: string | null;
  date: string | null;
  description: string | null;
  amount: number;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string | null;
  type: 'single_plan' | 'subscription';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'stripe';
  provider_payment_id: string | null;
  created_at: string;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string | null;
  created_at: string;
}

// =============================================
// Risultati calcolati dell'operazione
// =============================================

export interface ProjectResults {
  // Ricavi
  total_revenue: number;
  units_summary: {
    name: string;
    floor: string;
    calculated_value: number;
    target_price: number;
    adjusted_surface: number;
  }[];

  // Costi
  total_acquisition_cost: number;
  total_operation_cost: number;
  total_construction_cost: number;
  total_cost: number;

  // Dettaglio costi costruzione per piano
  construction_by_floor: {
    floor: string;
    total: number;
    item_count: number;
  }[];

  // Margini
  gross_margin: number;
  margin_percentage: number;
  margin_on_revenue: number;
  roi: number;

  // Indicatori
  cost_per_sqm: number;
  revenue_per_sqm: number;
  acquisition_incidence: number;
  construction_incidence: number;
  operation_incidence: number;

  // Dettaglio operazione costi
  operation_cost_by_section: {
    section: string;
    total: number;
  }[];
}

// =============================================
// Unita con superfici caricate (join)
// =============================================

export interface PropertyUnitWithSurfaces extends PropertyUnit {
  surfaces: UnitSurface[];
  calculated_value: number;
  total_adjusted_surface: number;
}

// =============================================
// Costanti e default
// =============================================

export const SURFACE_TYPES = [
  { value: 'appartamento', label: 'Appartamento', defaultCoefficient: 1.0 },
  { value: 'portici', label: 'Portici', defaultCoefficient: 0.30 },
  { value: 'balconi', label: 'Balconi', defaultCoefficient: 0.25 },
  { value: 'terrazzi', label: 'Terrazzi', defaultCoefficient: 0.30 },
  { value: 'accessori', label: 'Accessori', defaultCoefficient: 0.35 },
  { value: 'giardino', label: 'Area Esterna - Giardino', defaultCoefficient: 0.03 },
  { value: 'autorimessa', label: 'Autorimessa', defaultCoefficient: 0.50 },
  { value: 'posto_auto', label: 'Posti Auto', defaultCoefficient: 0.20 },
] as const;

export const CONSTRUCTION_CATEGORIES = [
  { value: 'demolitions', label: 'Demolizioni e Rimozioni' },
  { value: 'masonry', label: 'Murature e Tramezze' },
  { value: 'plaster', label: 'Intonaci e Rasature' },
  { value: 'flooring', label: 'Pavimentazioni' },
  { value: 'tiling', label: 'Rivestimenti' },
  { value: 'waterproofing', label: 'Impermeabilizzazioni' },
  { value: 'drywall', label: 'Cartongesso' },
  { value: 'doors_windows', label: 'Serramenti e Falsitelai' },
  { value: 'painting', label: 'Imbiancature' },
  { value: 'systems', label: 'Impianti e Assistenze' },
  { value: 'balconies', label: 'Balconi e Terrazzi' },
  { value: 'ironwork', label: 'Opere in Ferro' },
  { value: 'other', label: 'Altre Lavorazioni' },
] as const;

export const FLOORS = [
  { value: 'PS1', label: 'Piano Seminterrato' },
  { value: 'PT', label: 'Piano Terra' },
  { value: 'P1', label: 'Piano Primo' },
  { value: 'P2', label: 'Piano Secondo' },
  { value: 'P3', label: 'Piano Terzo' },
  { value: 'PSTT', label: 'Piano Sottotetto' },
] as const;

export const PROPERTY_TYPES = [
  { value: 'residenziale', label: 'Residenziale' },
  { value: 'commerciale', label: 'Commerciale' },
  { value: 'misto', label: 'Misto' },
] as const;

export const STRATEGIES = [
  { value: 'ristrutturazione', label: 'Ristrutturazione e Rivendita' },
  { value: 'frazionamento', label: 'Frazionamento' },
  { value: 'nuova_costruzione', label: 'Nuova Costruzione' },
  { value: 'rivendita', label: 'Rivendita Diretta' },
] as const;

// Template voci acquisizione predefinite (importi e percentuali a zero — l'utente compila)
export const DEFAULT_ACQUISITION_COSTS = [
  { category: 'purchase_price', label: 'Prezzo di Compravendita', calculation_type: 'fixed' as const, percentage: 0, sort_order: 0 },
  { category: 'notary', label: 'Notaio - Onorario', calculation_type: 'percentage' as const, percentage: 0, sort_order: 1 },
  { category: 'taxes', label: 'Imposte - Registro e Tasse', calculation_type: 'percentage' as const, percentage: 0, sort_order: 2 },
  { category: 'agency', label: 'Agenzia Immobiliare', calculation_type: 'percentage' as const, percentage: 0, sort_order: 3 },
  { category: 'referral', label: 'Segnalatore Operazione', calculation_type: 'percentage' as const, percentage: 0, sort_order: 4 },
];

// Template costi operativi predefiniti per sezione (importi a zero — l'utente compila)
export const DEFAULT_OPERATION_COSTS: Record<OperationCostSection, Array<{
  category: string;
  label: string;
  calculation_type: 'fixed' | 'percentage' | 'unit_quantity';
  percentage?: number;
  unit_price?: number;
  quantity?: number;
  quantity_unit?: string;
  sort_order: number;
}>> = {
  management: [
    { category: 'management_fee', label: 'Costi Fissi di Gestione MH', calculation_type: 'fixed', sort_order: 0 },
    { category: 'insurance', label: 'Assicurazione POLIZZA CAR', calculation_type: 'percentage', percentage: 0, sort_order: 1 },
    { category: 'imu', label: 'IMU - Annualizzata', calculation_type: 'fixed', sort_order: 2 },
    { category: 'agency_resale', label: 'Agenzia Immobiliare - Rivendita', calculation_type: 'percentage', percentage: 0, sort_order: 3 },
    { category: 'marketing', label: 'HOME STAGING - RENDER - Promozioni', calculation_type: 'percentage', percentage: 0, sort_order: 4 },
  ],
  utilities: [
    { category: 'energy_connection', label: 'ENERGIA - Allacciamento Contatori', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 0 },
    { category: 'energy_new', label: 'ENERGIA - Nuova Utenza', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 1 },
    { category: 'energy_bills', label: 'ENERGIA - Bollette', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'mesi', sort_order: 2 },
    { category: 'water_connection', label: 'ACQUA - Allacciamento', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 3 },
    { category: 'water_bills', label: 'ACQUA - Bollette', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'mesi', sort_order: 4 },
    { category: 'sewage', label: 'FOGNATURA - Allacciamento', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 5 },
  ],
  professionals: [
    { category: 'design', label: 'Progettazione + Direzione Lavori', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 0 },
    { category: 'safety', label: 'Coordinamento Sicurezza', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 1 },
    { category: 'energy_report', label: 'Relazione Ex-Legge 10', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 2 },
    { category: 'structural', label: 'Strutturista + Collaudo Statico', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 3 },
    { category: 'landscape', label: 'Relazione Paesaggistica', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 4 },
    { category: 'cadastral', label: 'Accatastamenti', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 5 },
    { category: 'ape', label: 'APE', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 6 },
  ],
  permits: [
    { category: 'cila', label: 'CILA - Diritti di Segreteria', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 0 },
    { category: 'scia', label: 'SCIA - Diritti di Segreteria', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 1 },
    { category: 'pdc', label: 'PDC - Diritti di Segreteria', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 2 },
    { category: 'cadastral_fees', label: 'CATASTO - Diritti e Schede', calculation_type: 'unit_quantity', unit_price: 0, quantity: 0, quantity_unit: 'cad/Uno', sort_order: 3 },
  ],
};

// Sezioni operazione con label
export const OPERATION_SECTIONS = [
  { value: 'management' as const, label: 'Costi Fissi di Gestione - Vendite - Marketing' },
  { value: 'utilities' as const, label: 'Costi di Utenze ed Allacciamenti' },
  { value: 'professionals' as const, label: 'Costi Professionisti' },
  { value: 'permits' as const, label: 'Costi e Spese Titoli Edilizi' },
];
