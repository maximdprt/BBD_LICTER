-- =====================================================
-- SEPHORA Intel — Création de la table `signals`
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Créer la table
CREATE TABLE IF NOT EXISTS public.signals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source      TEXT NOT NULL CHECK (source IN ('google','tiktok','instagram','linkedin','reddit')),
  brand       TEXT NOT NULL CHECK (brand IN ('sephora','nocibe')),
  date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_text    TEXT NOT NULL DEFAULT '',
  sentiment   TEXT NOT NULL CHECK (sentiment IN ('positive','negative','neutral')),
  sentiment_score NUMERIC(6,3) NOT NULL DEFAULT 0,
  themes      TEXT[] NOT NULL DEFAULT '{}',
  platform_rating NUMERIC(3,1),
  is_alert    BOOLEAN NOT NULL DEFAULT false,
  summary_fr  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved    BOOLEAN NOT NULL DEFAULT false
);

-- 2. Index recommandés pour les performances
CREATE INDEX IF NOT EXISTS signals_date_idx       ON public.signals (date);
CREATE INDEX IF NOT EXISTS signals_brand_idx      ON public.signals (brand);
CREATE INDEX IF NOT EXISTS signals_source_idx     ON public.signals (source);
CREATE INDEX IF NOT EXISTS signals_sentiment_idx  ON public.signals (sentiment);
CREATE INDEX IF NOT EXISTS signals_themes_gin     ON public.signals USING gin (themes);
CREATE INDEX IF NOT EXISTS signals_resolved_idx   ON public.signals (resolved);
CREATE INDEX IF NOT EXISTS signals_is_alert_idx   ON public.signals (is_alert);

-- 3. Activer RLS (Row Level Security) avec politique permissive
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique (anon peut lire)
DROP POLICY IF EXISTS "Lecture publique des signals" ON public.signals;
CREATE POLICY "Lecture publique des signals"
  ON public.signals
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Politique : écriture pour authenticated + anon (pour le seed et l'API resolve)
DROP POLICY IF EXISTS "Ecriture signals" ON public.signals;
CREATE POLICY "Ecriture signals"
  ON public.signals
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Activer le Realtime sur la table
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
