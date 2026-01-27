-- Add cantidad_maxima to lotes_entrada
-- This allows limiting a lote by total quantity of tickets, not just by date

ALTER TABLE public.lotes_entrada
ADD COLUMN cantidad_maxima INTEGER;

COMMENT ON COLUMN public.lotes_entrada.cantidad_maxima IS 'Cantidad máxima de entradas para este lote. NULL = sin límite (solo limitado por fecha)';
