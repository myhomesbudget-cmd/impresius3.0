-- =============================================
-- Rimuovi pay_per_plan dalla semantica profilo
-- subscription_plan ammette solo: free | premium
-- I pagamenti singoli sono tracciati come crediti
-- nella tabella payments (plan_id NULL = credito disponibile)
-- =============================================

-- 1. Aggiorna eventuali profili esistenti con pay_per_plan → free
UPDATE public.profiles
  SET subscription_plan = 'free'
  WHERE subscription_plan = 'pay_per_plan';

-- 2. Sostituisci il CHECK constraint su subscription_plan
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_plan_check
    CHECK (subscription_plan IN ('free', 'premium'));

-- 3. Rendi plan_id nullable nella tabella payments
--    e aggiorna il FK per puntare a projects (non piu a plans)
ALTER TABLE public.payments
  ALTER COLUMN plan_id DROP NOT NULL;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_plan_id_fkey;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_plan_id_fkey
    FOREIGN KEY (plan_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- 4. Pulisci eventuali plan_id orfani (user_id usati come placeholder)
UPDATE public.payments
  SET plan_id = NULL
  WHERE plan_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.projects WHERE id = payments.plan_id);
