-- Exécuter dans Supabase > SQL Editor : supprime toutes les lignes dont la source est Trustpilot.
-- Optionnel : après suppression, mettre à jour la contrainte CHECK sur `source` pour exclure
-- `trustpilot` si votre schéma l’autorise encore (voir create-table.sql pour la liste à jour).

DELETE FROM public.signals WHERE source = 'trustpilot';
