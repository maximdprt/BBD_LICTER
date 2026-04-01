-- Index recommandés pour la table public.signals (performance filtres dashboard)
-- À exécuter dans Supabase SQL Editor après création de la table.

create index if not exists signals_date_idx on public.signals (date);
create index if not exists signals_brand_idx on public.signals (brand);
create index if not exists signals_source_idx on public.signals (source);
create index if not exists signals_sentiment_idx on public.signals (sentiment);
create index if not exists signals_themes_gin on public.signals using gin (themes);
