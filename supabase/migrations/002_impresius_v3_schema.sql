-- =============================================
-- IMPRESIUS 3.0 - Schema completo
-- Migrazione dalla struttura v1 (plans con JSONB)
-- alla struttura v3 relazionale
-- =============================================

-- Estendi profiles con campi subscription
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'pay_per_plan', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS free_plan_used boolean NOT NULL DEFAULT false;

-- =============================================
-- TABELLA: projects (sostituisce plans)
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Nuova Operazione',
  description text,
  location_city text,
  location_province text,
  location_address text,
  property_type text DEFAULT 'residenziale'
    CHECK (property_type IN ('residenziale', 'commerciale', 'misto')),
  strategy text DEFAULT 'ristrutturazione'
    CHECK (strategy IN ('ristrutturazione', 'frazionamento', 'nuova_costruzione', 'rivendita')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  is_free_plan boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);

-- =============================================
-- TABELLA: property_units
-- Unita immobiliari (es. App PT, App P1, App P2)
-- =============================================
CREATE TABLE IF NOT EXISTS public.property_units (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  floor text NOT NULL,
  destination text DEFAULT 'Appartamento',
  market_price_sqm numeric(12,2) DEFAULT 0,
  target_sale_price numeric(14,2) DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS property_units_project_id_idx ON public.property_units(project_id);

-- =============================================
-- TABELLA: unit_surfaces
-- Superfici ragguagliate per ogni unita
-- =============================================
CREATE TABLE IF NOT EXISTS public.unit_surfaces (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id uuid REFERENCES public.property_units(id) ON DELETE CASCADE NOT NULL,
  surface_type text NOT NULL DEFAULT 'appartamento',
  gross_surface numeric(10,2) DEFAULT 0,
  coefficient numeric(5,4) DEFAULT 1.0000,
  unit_price numeric(12,2),
  floor_reference text,
  sort_order integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS unit_surfaces_unit_id_idx ON public.unit_surfaces(unit_id);

-- =============================================
-- TABELLA: acquisition_costs
-- Costi di acquisizione immobile
-- =============================================
CREATE TABLE IF NOT EXISTS public.acquisition_costs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL,
  calculation_type text NOT NULL DEFAULT 'fixed'
    CHECK (calculation_type IN ('fixed', 'percentage')),
  base_value numeric(14,2) DEFAULT 0,
  percentage numeric(6,4) DEFAULT 0,
  fixed_amount numeric(14,2) DEFAULT 0,
  sort_order integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS acquisition_costs_project_id_idx ON public.acquisition_costs(project_id);

-- =============================================
-- TABELLA: operation_costs
-- Costi operativi (gestione, utenze, professionisti, titoli)
-- =============================================
CREATE TABLE IF NOT EXISTS public.operation_costs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  section text NOT NULL DEFAULT 'management'
    CHECK (section IN ('management', 'utilities', 'professionals', 'permits')),
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL,
  calculation_type text NOT NULL DEFAULT 'fixed'
    CHECK (calculation_type IN ('fixed', 'percentage', 'unit_quantity')),
  base_value numeric(14,2) DEFAULT 0,
  percentage numeric(6,4) DEFAULT 0,
  unit_price numeric(14,2) DEFAULT 0,
  quantity numeric(10,2) DEFAULT 0,
  quantity_unit text,
  sort_order integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS operation_costs_project_id_idx ON public.operation_costs(project_id);
CREATE INDEX IF NOT EXISTS operation_costs_section_idx ON public.operation_costs(section);

-- =============================================
-- TABELLA: construction_items
-- Voci computo metrico
-- =============================================
CREATE TABLE IF NOT EXISTS public.construction_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  floor text NOT NULL DEFAULT 'PT',
  item_number integer DEFAULT 0,
  code text,
  category text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text,
  unit_of_measure text DEFAULT 'mq',
  unit_price numeric(12,2) DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS construction_items_project_id_idx ON public.construction_items(project_id);
CREATE INDEX IF NOT EXISTS construction_items_floor_idx ON public.construction_items(floor);

-- =============================================
-- TABELLA: measurements
-- Misurazioni singole per ogni voce computo
-- =============================================
CREATE TABLE IF NOT EXISTS public.measurements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id uuid REFERENCES public.construction_items(id) ON DELETE CASCADE NOT NULL,
  description text,
  parts numeric(10,2) DEFAULT 0,
  length numeric(10,4) DEFAULT 0,
  width numeric(10,4) DEFAULT 0,
  height_weight numeric(10,4) DEFAULT 0,
  sort_order integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS measurements_item_id_idx ON public.measurements(item_id);

-- =============================================
-- TABELLA: scenarios
-- =============================================
CREATE TABLE IF NOT EXISTS public.scenarios (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'realistic'
    CHECK (type IN ('conservative', 'realistic', 'optimistic', 'custom')),
  sale_price_variation numeric(6,2) DEFAULT 0,
  construction_cost_variation numeric(6,2) DEFAULT 0,
  acquisition_cost_variation numeric(6,2) DEFAULT 0,
  results_snapshot jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS scenarios_project_id_idx ON public.scenarios(project_id);

-- =============================================
-- TABELLA: actual_costs (PREMIUM)
-- =============================================
CREATE TABLE IF NOT EXISTS public.actual_costs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reference_type text NOT NULL
    CHECK (reference_type IN ('acquisition', 'operation', 'construction')),
  reference_id uuid,
  date date,
  description text,
  amount numeric(14,2) DEFAULT 0,
  invoice_number text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS actual_costs_project_id_idx ON public.actual_costs(project_id);

-- =============================================
-- TABELLA: project_notes
-- =============================================
CREATE TABLE IF NOT EXISTS public.project_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  content text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS project_notes_project_id_idx ON public.project_notes(project_id);

-- =============================================
-- Aggiorna payments per supportare subscription
-- =============================================
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'single_plan'
    CHECK (type IN ('single_plan', 'subscription'));

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actual_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Projects: user owns
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Property units: via project
CREATE POLICY "units_select" ON public.property_units FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "units_insert" ON public.property_units FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "units_update" ON public.property_units FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "units_delete" ON public.property_units FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Unit surfaces: via unit -> project
CREATE POLICY "surfaces_select" ON public.unit_surfaces FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.property_units pu
    JOIN public.projects p ON p.id = pu.project_id
    WHERE pu.id = unit_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "surfaces_insert" ON public.unit_surfaces FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.property_units pu
    JOIN public.projects p ON p.id = pu.project_id
    WHERE pu.id = unit_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "surfaces_update" ON public.unit_surfaces FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.property_units pu
    JOIN public.projects p ON p.id = pu.project_id
    WHERE pu.id = unit_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "surfaces_delete" ON public.unit_surfaces FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.property_units pu
    JOIN public.projects p ON p.id = pu.project_id
    WHERE pu.id = unit_id AND p.user_id = auth.uid()
  ));

-- Acquisition costs: via project
CREATE POLICY "acq_costs_select" ON public.acquisition_costs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "acq_costs_insert" ON public.acquisition_costs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "acq_costs_update" ON public.acquisition_costs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "acq_costs_delete" ON public.acquisition_costs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Operation costs: via project
CREATE POLICY "op_costs_select" ON public.operation_costs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "op_costs_insert" ON public.operation_costs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "op_costs_update" ON public.operation_costs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "op_costs_delete" ON public.operation_costs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Construction items: via project
CREATE POLICY "constr_select" ON public.construction_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "constr_insert" ON public.construction_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "constr_update" ON public.construction_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "constr_delete" ON public.construction_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Measurements: via item -> project
CREATE POLICY "meas_select" ON public.measurements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.construction_items ci
    JOIN public.projects p ON p.id = ci.project_id
    WHERE ci.id = item_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "meas_insert" ON public.measurements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.construction_items ci
    JOIN public.projects p ON p.id = ci.project_id
    WHERE ci.id = item_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "meas_update" ON public.measurements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.construction_items ci
    JOIN public.projects p ON p.id = ci.project_id
    WHERE ci.id = item_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "meas_delete" ON public.measurements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.construction_items ci
    JOIN public.projects p ON p.id = ci.project_id
    WHERE ci.id = item_id AND p.user_id = auth.uid()
  ));

-- Scenarios: via project
CREATE POLICY "scenarios_select" ON public.scenarios FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "scenarios_insert" ON public.scenarios FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "scenarios_update" ON public.scenarios FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "scenarios_delete" ON public.scenarios FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Actual costs: via project
CREATE POLICY "actual_costs_select" ON public.actual_costs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "actual_costs_insert" ON public.actual_costs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "actual_costs_update" ON public.actual_costs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "actual_costs_delete" ON public.actual_costs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Project notes: via project
CREATE POLICY "notes_select" ON public.project_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "notes_insert" ON public.project_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "notes_delete" ON public.project_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- =============================================
-- Triggers updated_at
-- =============================================
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER property_units_updated_at
  BEFORE UPDATE ON public.property_units
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
