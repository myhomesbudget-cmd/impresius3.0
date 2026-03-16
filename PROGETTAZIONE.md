# IMPRESIUS 3.0 — Documento di Progettazione

## 1. Visione del Prodotto

**Impresius** e una piattaforma SaaS professionale per l'analisi, la simulazione e la gestione economica delle operazioni immobiliari.

Trasforma la logica operativa dei fogli Excel in un motore applicativo web moderno, premium e scalabile.

**Tre anime del prodotto:**
1. Strumento di analisi iniziale (business plan)
2. Strumento di simulazione e confronto (scenari)
3. Strumento di controllo gestionale (premium: previsto vs reale)

---

## 2. Moduli Principali

| # | Modulo | Descrizione |
|---|--------|-------------|
| M1 | **Autenticazione** | Registrazione, login, reset password, profilo utente |
| M2 | **Dashboard Personale** | Vista d'insieme operazioni, statistiche, azioni rapide |
| M3 | **Gestione Business Plan** | CRUD operazioni, stati (bozza/attivo/archiviato), duplicazione |
| M4 | **Dati Generali Operazione** | Nome, localita, tipologia, strategia, unita immobiliari |
| M5 | **Area 1 — Costi Acquisizione** | Acquisto, imposte, notaio, agenzia, professionisti, titoli edilizi, utenze, gestione |
| M6 | **Area 2 — Computo Metrico** | Voci di lavorazione per piano/unita, misurazioni, calcoli automatici |
| M7 | **Area 3 — Stima Valore Vendita** | Superfici, coefficienti ragguaglio, prezzo unitario, valore per unita |
| M8 | **Analisi Economica** | Calcolo risultati, indicatori, margini, incidenze |
| M9 | **Scenari e Simulazioni** | Prudente/realistico/ottimistico, analisi sensibilita |
| M10 | **Reportistica PDF** | Report per area e completo, layout professionale |
| M11 | **Pagamenti** | Stripe, modello freemium/pay-per-plan/premium |
| M12 | **Archivio Operazioni** | Lista, ricerca, filtri, confronto tra operazioni |
| M13 | **Monitoraggio Premium** | Costi reali vs previsti, scostamenti, dashboard gestionale |

---

## 3. Flusso Utente Completo

```
Landing Page
    |
    v
Registrazione / Login
    |
    v
Dashboard Personale
    |
    +---> [Crea Nuova Operazione] ---> Dati Generali
    |                                       |
    |                                       v
    |                                  Area 1: Costi Acquisizione
    |                                       |
    |                                       v
    |                                  Area 2: Computo Metrico
    |                                       |
    |                                       v
    |                                  Area 3: Stima Vendita
    |                                       |
    |                                       v
    |                                  Sintesi Operazione
    |                                       |
    |                                       +---> Report PDF
    |                                       +---> Scenari (premium)
    |                                       +---> Monitoraggio (premium)
    |
    +---> [Le mie Operazioni] ---> Lista / Archivio
    |                                  +---> Apri
    |                                  +---> Duplica
    |                                  +---> Confronta
    |                                  +---> Archivia
    |
    +---> [Upgrade] ---> Pricing / Paywall / Stripe
    |
    +---> [Impostazioni] ---> Profilo / Account
```

### Navigazione intra-operazione

Quando l'utente e dentro un'operazione, la navigazione avviene tramite:
- **Sidebar laterale** con le sezioni (Dati Generali, Area 1, Area 2, Area 3, Sintesi)
- **Progress bar** in alto che mostra il completamento
- **Navigazione libera** tra le aree (non obbligatoriamente sequenziale)
- **Barra risultati sempre visibile** in basso/laterale con totali aggiornati live

---

## 4. Pagine dell'App

### Pagine Pubbliche
| Pagina | Route | Descrizione |
|--------|-------|-------------|
| Landing Page | `/` | Hero, features, how it works, pricing, CTA |
| Login | `/login` | Form login con Supabase Auth |
| Registrazione | `/register` | Form registrazione |
| Reset Password | `/reset-password` | Recupero password |
| Pricing | `/pricing` | Piani e confronto funzionalita |

### Pagine Protette (Dashboard)
| Pagina | Route | Descrizione |
|--------|-------|-------------|
| Dashboard | `/dashboard` | Vista d'insieme, statistiche, azioni rapide |
| Nuova Operazione | `/plans/new` | Form dati generali nuova operazione |
| Operazione — Dati Generali | `/plans/[id]` | Scheda principale operazione |
| Operazione — Area 1 | `/plans/[id]/acquisition` | Costi acquisizione e spese |
| Operazione — Area 2 | `/plans/[id]/construction` | Computo metrico opere |
| Operazione — Area 3 | `/plans/[id]/valuation` | Stima valore vendita |
| Operazione — Sintesi | `/plans/[id]/summary` | Riepilogo, indicatori, grafici |
| Operazione — Report | `/plans/[id]/report` | Anteprima e generazione PDF |
| Operazione — Scenari | `/plans/[id]/scenarios` | Confronto scenari (premium) |
| Operazione — Monitoraggio | `/plans/[id]/monitoring` | Previsto vs reale (premium) |
| Archivio | `/plans` | Lista tutte le operazioni |
| Confronto | `/plans/compare` | Confronto tra operazioni |
| Pagamenti | `/payments` | Storico pagamenti |
| Impostazioni | `/settings` | Profilo, account, piano |

---

## 5. Modello Dati

### 5.1 Entita principali e relazioni

```
User (profiles)
  |
  +--- 1:N --- Project (projects)
  |               |
  |               +--- 1:N --- PropertyUnit (property_units)
  |               |               |
  |               |               +--- 1:N --- UnitSurface (unit_surfaces)
  |               |
  |               +--- 1:N --- AcquisitionCost (acquisition_costs)
  |               |
  |               +--- 1:N --- OperationCost (operation_costs)
  |               |               [gestione, marketing, utenze, professionisti, titoli]
  |               |
  |               +--- 1:N --- ConstructionItem (construction_items)
  |               |               |
  |               |               +--- 1:N --- Measurement (measurements)
  |               |
  |               +--- 1:N --- Scenario (scenarios)
  |               |
  |               +--- 1:N --- ActualCost (actual_costs) [PREMIUM]
  |               |
  |               +--- 1:N --- ProjectNote (project_notes)
  |               |
  |               +--- 1:N --- Attachment (attachments)
  |
  +--- 1:N --- Payment (payments)
```

### 5.2 Dettaglio Entita

#### Project (projects)
Rappresenta una singola operazione immobiliare.
```
- id: UUID (PK)
- user_id: UUID (FK -> profiles)
- name: string                    -- "Azzate Via Napoli 11"
- description: text
- location_city: string           -- "Azzate"
- location_province: string       -- "VA"
- location_address: string        -- "Via Napoli 11"
- property_type: enum             -- residenziale, commerciale, misto
- strategy: enum                  -- ristrutturazione, frazionamento, nuova_costruzione, rivendita
- status: enum                    -- draft, active, archived
- is_free_plan: boolean           -- primo piano gratuito
- created_at, updated_at: timestamp
```

#### PropertyUnit (property_units)
Ogni unita immobiliare dell'operazione (es. App. PT, App. P1, App. P2).
```
- id: UUID (PK)
- project_id: UUID (FK -> projects)
- name: string                    -- "Appartamento Piano Terra"
- floor: string                   -- "PT", "P1", "P2", "PS1"
- destination: string             -- "Appartamento", "Sottotetto", "Box"
- market_price_sqm: decimal       -- 2000.00 (prezzo di mercato al mq)
- target_sale_price: decimal       -- 310000.00 (prezzo stabilito)
- sort_order: integer
```

#### UnitSurface (unit_surfaces)
Superfici ragguagliate per ogni unita.
```
- id: UUID (PK)
- unit_id: UUID (FK -> property_units)
- surface_type: enum              -- appartamento, portici, balconi, terrazzi,
                                  -- accessori, giardino, autorimessa, posto_auto
- gross_surface: decimal           -- 131.20 mq
- coefficient: decimal             -- 1.00 (100%), 0.25 (25%), 0.03 (3%)
- adjusted_surface: decimal        -- CALCOLATO: gross * coefficient
- unit_price: decimal              -- eredita da unit.market_price_sqm o override
- value: decimal                   -- CALCOLATO: adjusted_surface * unit_price
- floor_reference: string          -- "PT", "PS1" (piano di riferimento della superficie)
- sort_order: integer
```

#### AcquisitionCost (acquisition_costs)
Costi di acquisizione dell'immobile.
```
- id: UUID (PK)
- project_id: UUID (FK -> projects)
- category: enum                   -- purchase_price, notary, taxes, agency,
                                   -- referral, other
- label: string                    -- "Prezzo di Compravendita"
- calculation_type: enum           -- fixed, percentage
- base_value: decimal              -- valore base (prezzo acquisto per %)
- percentage: decimal              -- 1.00%, 11.00%, 6.00%
- fixed_amount: decimal            -- importo fisso se non percentuale
- amount: decimal                  -- CALCOLATO: importo finale
- sort_order: integer
```

#### OperationCost (operation_costs)
Tutti gli altri costi dell'operazione (gestione, utenze, professionisti, titoli).
```
- id: UUID (PK)
- project_id: UUID (FK -> projects)
- category: enum                   -- management, insurance, tax, agency_resale,
                                   -- marketing, energy, water, sewage,
                                   -- design, safety, structural, cadastral,
                                   -- permits, urbanization, other
- subcategory: string              -- sottocategoria libera
- label: string                    -- "Progettazione + Direzione Lavori"
- calculation_type: enum           -- fixed, percentage, unit_quantity, volume, surface
- base_value: decimal              -- valore base per calcolo %
- percentage: decimal
- unit_price: decimal              -- prezzo unitario
- quantity: decimal                -- quantita (mesi, cadauno, mc, mq)
- quantity_unit: string            -- "cad/Uno", "mesi", "mc", "mq"
- amount: decimal                  -- CALCOLATO
- sort_order: integer
```

#### ConstructionItem (construction_items)
Voci del computo metrico.
```
- id: UUID (PK)
- project_id: UUID (FK -> projects)
- unit_id: UUID (FK -> property_units, nullable) -- associata a unita specifica
- floor: string                    -- "PT", "P1", "P2", "PS1"
- item_number: integer             -- numero d'ordine (1, 2, 3...)
- code: string                     -- codice tariffa
- category: enum                   -- demolitions, masonry, plaster, flooring,
                                   -- tiling, painting, systems, balconies,
                                   -- doors_windows, waterproofing, drywall, other
- title: string                    -- "Rim. Porte Int." (titolo breve)
- description: text                -- descrizione completa della lavorazione
- unit_of_measure: string          -- "mq", "ml", "cad/Una", "corpo", "a corpo"
- quantity: decimal                -- quantita totale (SOMMANO)
- unit_price: decimal              -- prezzo unitario
- total_price: decimal             -- CALCOLATO: quantity * unit_price
- sort_order: integer
```

#### Measurement (measurements)
Singole misurazioni di ogni voce del computo.
```
- id: UUID (PK)
- item_id: UUID (FK -> construction_items)
- description: string              -- "CAMERA - Demolizione Parete Esistente"
- parts: decimal                   -- numero parti uguali (Par.ug)
- length: decimal                  -- lunghezza
- width: decimal                   -- larghezza
- height_weight: decimal           -- altezza o peso
- quantity: decimal                -- CALCOLATO: parts * length * width * height
- sort_order: integer
```

#### Scenario (scenarios)
Scenari alternativi per simulazione.
```
- id: UUID (PK)
- project_id: UUID (FK -> projects)
- name: string                     -- "Prudente", "Realistico", "Ottimistico"
- type: enum                       -- conservative, realistic, optimistic, custom
- sale_price_variation: decimal     -- -10%, 0%, +10%
- construction_cost_variation: decimal
- acquisition_cost_variation: decimal
- results_snapshot: jsonb           -- risultati calcolati per questo scenario
- created_at: timestamp
```

#### ActualCost (actual_costs) [PREMIUM]
Costi reali registrati durante l'operazione.
```
- id: UUID (PK)
- project_id: UUID (FK -> projects)
- reference_type: enum             -- acquisition, operation, construction
- reference_id: UUID               -- FK alla voce di costo originale
- date: date                       -- data del costo reale
- description: string
- amount: decimal                  -- importo reale
- invoice_number: string
- notes: text
- created_at: timestamp
```

#### Payment (payments)
Pagamenti utente per la piattaforma.
```
- id: UUID (PK)
- user_id: UUID (FK -> profiles)
- project_id: UUID (FK -> projects, nullable)
- type: enum                       -- single_plan, subscription
- amount: decimal                  -- 3.00 o 10.00
- currency: string                 -- "eur"
- status: enum                     -- pending, completed, failed, refunded
- provider: string                 -- "stripe"
- provider_payment_id: string
- created_at: timestamp
```

---

## 6. Struttura Database Supabase

### 6.1 Tabelle e Relazioni

```sql
-- =============================================
-- TABELLA: profiles (gia esistente, da estendere)
-- =============================================
profiles
  - id UUID PK (= auth.users.id)
  - email TEXT NOT NULL
  - full_name TEXT
  - company_name TEXT
  - phone TEXT
  - avatar_url TEXT
  - subscription_plan ENUM('free','pay_per_plan','premium') DEFAULT 'free'
  - subscription_expires_at TIMESTAMPTZ
  - free_plan_used BOOLEAN DEFAULT false
  - created_at, updated_at TIMESTAMPTZ

-- =============================================
-- TABELLA: projects
-- =============================================
projects
  - id UUID PK DEFAULT uuid_generate_v4()
  - user_id UUID FK -> profiles(id) ON DELETE CASCADE
  - name TEXT NOT NULL
  - description TEXT
  - location_city TEXT
  - location_province TEXT
  - location_address TEXT
  - property_type TEXT CHECK IN ('residenziale','commerciale','misto')
  - strategy TEXT CHECK IN ('ristrutturazione','frazionamento','nuova_costruzione','rivendita')
  - status TEXT CHECK IN ('draft','active','archived') DEFAULT 'draft'
  - is_free_plan BOOLEAN DEFAULT false
  - created_at TIMESTAMPTZ DEFAULT now()
  - updated_at TIMESTAMPTZ DEFAULT now()

  INDEXES: user_id, status
  RLS: user can only access own projects

-- =============================================
-- TABELLA: property_units
-- =============================================
property_units
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - name TEXT NOT NULL
  - floor TEXT NOT NULL
  - destination TEXT
  - market_price_sqm NUMERIC(12,2)
  - target_sale_price NUMERIC(12,2)
  - sort_order INTEGER DEFAULT 0

  INDEXES: project_id
  RLS: via project ownership

-- =============================================
-- TABELLA: unit_surfaces
-- =============================================
unit_surfaces
  - id UUID PK
  - unit_id UUID FK -> property_units(id) ON DELETE CASCADE
  - surface_type TEXT NOT NULL
  - gross_surface NUMERIC(10,2) DEFAULT 0
  - coefficient NUMERIC(5,4) DEFAULT 1.0000
  - unit_price NUMERIC(12,2)
  - floor_reference TEXT
  - sort_order INTEGER DEFAULT 0

  INDEXES: unit_id
  RLS: via unit -> project ownership

-- =============================================
-- TABELLA: acquisition_costs
-- =============================================
acquisition_costs
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - category TEXT NOT NULL
  - label TEXT NOT NULL
  - calculation_type TEXT CHECK IN ('fixed','percentage') DEFAULT 'fixed'
  - base_value NUMERIC(14,2)
  - percentage NUMERIC(6,4)
  - fixed_amount NUMERIC(14,2)
  - sort_order INTEGER DEFAULT 0

  INDEXES: project_id
  RLS: via project ownership

-- =============================================
-- TABELLA: operation_costs
-- =============================================
operation_costs
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - category TEXT NOT NULL
  - subcategory TEXT
  - label TEXT NOT NULL
  - calculation_type TEXT DEFAULT 'fixed'
  - base_value NUMERIC(14,2)
  - percentage NUMERIC(6,4)
  - unit_price NUMERIC(14,2)
  - quantity NUMERIC(10,2)
  - quantity_unit TEXT
  - sort_order INTEGER DEFAULT 0

  INDEXES: project_id, category
  RLS: via project ownership

-- =============================================
-- TABELLA: construction_items
-- =============================================
construction_items
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - unit_id UUID FK -> property_units(id) ON DELETE SET NULL (nullable)
  - floor TEXT
  - item_number INTEGER
  - code TEXT
  - category TEXT NOT NULL
  - title TEXT NOT NULL
  - description TEXT
  - unit_of_measure TEXT
  - unit_price NUMERIC(12,2)
  - sort_order INTEGER DEFAULT 0

  INDEXES: project_id, floor, category
  RLS: via project ownership

-- =============================================
-- TABELLA: measurements
-- =============================================
measurements
  - id UUID PK
  - item_id UUID FK -> construction_items(id) ON DELETE CASCADE
  - description TEXT
  - parts NUMERIC(10,2) DEFAULT 1
  - length NUMERIC(10,2) DEFAULT 0
  - width NUMERIC(10,2) DEFAULT 0
  - height_weight NUMERIC(10,2) DEFAULT 0
  - sort_order INTEGER DEFAULT 0

  INDEXES: item_id
  RLS: via item -> project ownership

-- =============================================
-- TABELLA: scenarios
-- =============================================
scenarios
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - name TEXT NOT NULL
  - type TEXT CHECK IN ('conservative','realistic','optimistic','custom')
  - sale_price_variation NUMERIC(6,2) DEFAULT 0
  - construction_cost_variation NUMERIC(6,2) DEFAULT 0
  - acquisition_cost_variation NUMERIC(6,2) DEFAULT 0
  - results_snapshot JSONB
  - created_at TIMESTAMPTZ DEFAULT now()

  INDEXES: project_id
  RLS: via project ownership

-- =============================================
-- TABELLA: actual_costs (PREMIUM)
-- =============================================
actual_costs
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - reference_type TEXT CHECK IN ('acquisition','operation','construction')
  - reference_id UUID
  - date DATE
  - description TEXT
  - amount NUMERIC(14,2)
  - invoice_number TEXT
  - notes TEXT
  - created_at TIMESTAMPTZ DEFAULT now()

  INDEXES: project_id, reference_type, date
  RLS: via project ownership

-- =============================================
-- TABELLA: payments (gia esistente, da estendere)
-- =============================================
payments
  - id UUID PK
  - user_id UUID FK -> profiles(id) ON DELETE CASCADE
  - project_id UUID FK -> projects(id) ON DELETE SET NULL
  - type TEXT CHECK IN ('single_plan','subscription')
  - amount NUMERIC(10,2)
  - currency TEXT DEFAULT 'eur'
  - status TEXT CHECK IN ('pending','completed','failed','refunded')
  - provider TEXT DEFAULT 'stripe'
  - provider_payment_id TEXT
  - created_at TIMESTAMPTZ DEFAULT now()

  INDEXES: user_id, project_id, status
  RLS: user can only access own payments

-- =============================================
-- TABELLA: project_notes
-- =============================================
project_notes
  - id UUID PK
  - project_id UUID FK -> projects(id) ON DELETE CASCADE
  - content TEXT
  - created_at TIMESTAMPTZ DEFAULT now()

  INDEXES: project_id
  RLS: via project ownership
```

### 6.2 Viste calcolate (Database Views)

```sql
-- Vista: riepilogo per unita (superficie ragguagliata e valore)
CREATE VIEW v_unit_summary AS
SELECT
  us.unit_id,
  pu.project_id,
  pu.name,
  pu.target_sale_price,
  SUM(us.gross_surface * us.coefficient) as total_adjusted_surface,
  SUM(us.gross_surface * us.coefficient * COALESCE(us.unit_price, pu.market_price_sqm)) as calculated_value
FROM unit_surfaces us
JOIN property_units pu ON pu.id = us.unit_id
GROUP BY us.unit_id, pu.project_id, pu.name, pu.target_sale_price;

-- Vista: totale computo per piano
CREATE VIEW v_construction_by_floor AS
SELECT
  ci.project_id,
  ci.floor,
  ci.category,
  COUNT(*) as item_count,
  SUM(
    (SELECT COALESCE(SUM(
      COALESCE(m.parts, 1) *
      GREATEST(COALESCE(m.length, 0), 1) *
      GREATEST(COALESCE(m.width, 0), 1) *
      GREATEST(COALESCE(m.height_weight, 0), 1)
    ), 0) FROM measurements m WHERE m.item_id = ci.id)
    * ci.unit_price
  ) as total_amount
FROM construction_items ci
GROUP BY ci.project_id, ci.floor, ci.category;
```

---

## 7. Modello Freemium

### Regole di business

| Aspetto | Free | Pay-per-plan (3 EUR) | Premium (10 EUR/mese) |
|---------|------|---------------------|----------------------|
| Business plan | 1 gratuito | Illimitati (3 EUR cad.) | Illimitati |
| Area 1 - Acquisizione | Si | Si | Si |
| Area 2 - Computo Metrico | Si | Si | Si |
| Area 3 - Stima Vendita | Si | Si | Si |
| Risultati economici | Si | Si | Si |
| Dashboard | Si | Si | Si |
| Report PDF | Base (watermark) | Professionale | Professionale |
| Scenari multipli | No | No | Si |
| Confronto operazioni | No | No | Si |
| Analisi sensibilita | No | No | Si |
| Monitoraggio previsto/reale | No | No | Si |
| Grafici avanzati | No | Parziale | Si |
| Archivio documentale | No | Base | Completo |
| Duplicazione piani | No | Si | Si |

### Logica di paywall

```
IF user.free_plan_used == false:
    -> Permetti creazione primo piano gratuito
    -> Segna free_plan_used = true

ELSE IF user.subscription_plan == 'premium':
    -> Permetti tutto senza limiti

ELSE:
    -> Mostra paywall con opzioni:
       a) Acquista singolo piano (3 EUR)
       b) Passa a Premium (10 EUR/mese)
```

---

## 8. Profilo Premium — Modalita Gestionale

### Flusso previsto vs reale

Per ogni voce di costo (acquisizione, operazione, computo), l'utente premium puo:

1. **Visualizzare il valore previsto** (dal business plan)
2. **Registrare costi reali** (data, importo, fattura, note)
3. **Vedere lo scostamento** (reale - previsto, in EUR e %)
4. **Dashboard di monitoraggio** con:
   - Barra di avanzamento costi (previsto vs speso)
   - Grafico temporale delle spese
   - Alert su scostamenti significativi (>10%, >20%)
   - Margine aggiornato in tempo reale
   - Proiezione del risultato finale basata sui costi reali

### Struttura UI monitoraggio

```
+----------------------------------------------+
|  MONITORAGGIO OPERAZIONE                      |
|                                               |
|  Previsto: 248.567 EUR    Speso: 195.200 EUR |
|  [=============================--------]  78% |
|                                               |
|  Scostamento: -2.340 EUR (-0.9%)             |
|  Margine aggiornato: 374.717 EUR             |
|                                               |
|  +-- Acquisizione    195.200 / 195.200  100% |
|  +-- Professionisti   12.500 /  17.750   70% |
|  +-- Titoli Edilizi    5.287 /   7.287   73% |
|  +-- Lavori PT       28.000 /  46.636   60% |
|  +-- Lavori P2            0 /  24.823    0% |
|  +-- Lavori PS1           0 /  27.597    0% |
+----------------------------------------------+
```

---

## 9. Perimetro MVP

### MVP v1.0 — Lancio

**Incluso:**
- [x] Registrazione e login (Supabase Auth)
- [x] Dashboard utente con statistiche
- [ ] Creazione primo business plan gratuito
- [ ] Form dati generali operazione
- [ ] Area 1: Costi acquisizione (categorie, voci, calcoli)
- [ ] Area 2: Computo metrico (voci, misurazioni, totali per piano)
- [ ] Area 3: Stima valore vendita (unita, superfici, coefficienti)
- [ ] Sintesi operazione con indicatori chiave
- [ ] Report PDF base (con watermark per piano free)
- [ ] Salvataggio e riapertura piani
- [ ] Paywall: acquisto singolo piano (3 EUR via Stripe)
- [ ] Landing page professionale aggiornata

**Escluso dall'MVP:**
- Scenari multipli
- Confronto tra operazioni
- Analisi di sensibilita
- Monitoraggio premium previsto/reale
- Grafici avanzati
- Archivio documentale
- Piano premium (subscription)

### Criteri di completamento MVP
1. Un utente puo registrarsi e creare il primo piano gratis
2. Puo compilare tutte e 3 le aree con dati reali
3. I calcoli producono risultati corretti e coerenti
4. Puo generare un PDF dell'operazione
5. Puo acquistare piani aggiuntivi con Stripe
6. L'esperienza e fluida, professionale e premium

---

## 10. Roadmap Evolutiva

### Fase 1 — MVP (settimane 1-4)
- Setup database completo
- Implementazione 3 aree principali
- Motore di calcolo
- Report PDF base
- Paywall Stripe

### Fase 2 — Refinement (settimane 5-6)
- Template voci predefinite per computo metrico
- Miglioramento UX form compilazione
- Grafici composizione costi (recharts)
- Duplicazione piani
- Ottimizzazione mobile

### Fase 3 — Premium Features (settimane 7-9)
- Piano subscription Premium (10 EUR/mese)
- Scenari multipli (prudente/realistico/ottimistico)
- Confronto tra operazioni
- Dashboard avanzata con grafici
- Report PDF avanzato

### Fase 4 — Gestionale (settimane 10-12)
- Monitoraggio previsto vs reale
- Registrazione costi effettivi
- Dashboard scostamenti
- Alert e proiezioni
- Storico operazione

### Fase 5 — Evoluzione (continuo)
- Analisi di sensibilita
- Template per tipologia operazione
- Archivio documentale
- Export dati (CSV, Excel)
- API per integrazioni
- App mobile (PWA)

---

## 11. Motore di Calcolo — Formule Principali

### Valore Commerciale per Unita
```
Per ogni superficie dell'unita:
  superficie_ragguagliata = superficie_lorda * coefficiente
  valore_superficie = superficie_ragguagliata * prezzo_mq

Valore_calcolato_unita = SOMMA(valore_superficie per tutte le superfici)
```

### Costi di Acquisizione
```
Per ogni voce:
  IF calculation_type == 'percentage':
    importo = base_value * percentage / 100
  ELSE:
    importo = fixed_amount

Totale_acquisizione = SOMMA(importi)
```

### Computo Metrico
```
Per ogni misurazione:
  quantita = parti * MAX(lunghezza,1) * MAX(larghezza,1) * MAX(altezza,1)
  (se un campo e 0 o null, viene ignorato nel prodotto)

Quantita_voce = SOMMA(quantita misurazioni)
Totale_voce = quantita_voce * prezzo_unitario
Totale_piano = SOMMA(totali voci per piano)
Totale_lavori = SOMMA(totali per piano)
```

### Risultati Economici
```
RICAVI:
  Ricavo_totale = SOMMA(target_sale_price per ogni unita)

COSTI:
  Costo_acquisizione = Totale acquisition_costs
  Costo_operazione = Totale operation_costs
  Costo_lavori = Totale construction_items
  Costo_totale = Costo_acquisizione + Costo_operazione + Costo_lavori

MARGINI:
  Margine_lordo = Ricavo_totale - Costo_totale
  Margine_percentuale = (Margine_lordo / Costo_totale) * 100
  Utile_su_ricavo = (Margine_lordo / Ricavo_totale) * 100

INDICATORI:
  Costo_per_mq = Costo_totale / Superficie_totale_ragguagliata
  Ricavo_per_mq = Ricavo_totale / Superficie_totale_ragguagliata
  ROI = (Margine_lordo / Costo_totale) * 100
  Incidenza_acquisizione = (Costo_acquisizione / Costo_totale) * 100
  Incidenza_lavori = (Costo_lavori / Costo_totale) * 100
  Incidenza_operazione = (Costo_operazione / Costo_totale) * 100
```

---

## 12. Decisioni Progettuali da Prendere

| # | Decisione | Opzioni | Raccomandazione |
|---|-----------|---------|-----------------|
| D1 | Coefficienti ragguaglio: predefiniti o liberi? | Predefiniti con override / Completamente liberi | Predefiniti con possibilita di override |
| D2 | Categorie computo metrico: fisse o libere? | Fisse / Libere / Fisse + "Altro" | Fisse con possibilita di aggiungere "Altro" |
| D3 | Voci di costo acquisizione: template? | Precaricate / Vuote | Precaricate con template standard |
| D4 | PDF: libreria? | jsPDF / Puppeteer / React-PDF | React-PDF per qualita premium |
| D5 | Calcoli: client-side o server-side? | Client / Server / Entrambi | Client per reattivita, server per report |
| D6 | Struttura computo: per piano o per unita? | Per piano / Per unita / Entrambi | Per piano (come nell'Excel) con tag unita |
| D7 | Valuta: solo EUR o multi-valuta? | Solo EUR / Multi | Solo EUR per MVP |
| D8 | Lingua: solo IT o multi-lingua? | Solo IT / IT+EN | Solo IT per MVP, predisporre i18n |

---

## 13. Note Tecniche di Implementazione

### Architettura componenti
- **Server Components** per pagine statiche e fetch dati
- **Client Components** per form interattivi e calcoli live
- **Custom Hooks** per logica di calcolo riutilizzabile
- **Zustand o Context** per stato dell'operazione in compilazione

### Persistenza dati
- Salvataggio automatico (debounced) durante la compilazione
- Stato "bozza" fino a completamento
- Nessuna perdita dati su refresh

### Performance
- Calcoli in real-time client-side
- Lazy loading delle aree non visualizzate
- Ottimizzazione query Supabase con select specifiche

### Sicurezza
- RLS su tutte le tabelle
- Validazione input server-side
- Sanitizzazione dati prima del salvataggio
- HTTPS obbligatorio
- Rate limiting sulle API
