// =============================================
// IMPRESIUS 3.0 - Product Configuration
// =============================================
//
// Questo modulo isola le costanti di configurazione prodotto
// dal dominio logico. Aggiungere una nuova categoria, superficie
// o strategia richiede solo una modifica qui.
//
// Le costanti qui definite sono TEMPLATE DI PRODOTTO e non vincoli
// strutturali del dominio. Il dominio accetta qualunque stringa
// per category/section/strategy — queste liste governano solo
// i default mostrati in UI.
//

export {
  SURFACE_TYPES,
  CONSTRUCTION_CATEGORIES,
  FLOORS,
  PROPERTY_TYPES,
  STRATEGIES,
  DEFAULT_ACQUISITION_COSTS,
  DEFAULT_OPERATION_COSTS,
  OPERATION_SECTIONS,
} from '@/types/database';

/**
 * Configurazione di prezzo per il piano singolo.
 * Centralizzata qui piuttosto che dispersa in più file.
 */
export const PRICING = {
  /** Prezzo singola operazione in EUR cent */
  SINGLE_PLAN_CENTS: Math.round(parseFloat(process.env.PLAN_PRICE_EUR || '3.00') * 100),
  /** Label per la UI */
  SINGLE_PLAN_LABEL: '3,00 €',
} as const;
