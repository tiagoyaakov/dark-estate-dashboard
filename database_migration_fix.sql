-- MIGRAÇÃO CORRIGIDA: Sistema Kanban de Leads
-- Execute cada comando individualmente no SQL Editor do Supabase

-- 1. Adicionar colunas básicas (se ainda não executou)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Novo Lead';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interest TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Criar enum para estágios (se ainda não executou)
DO $$ 
BEGIN
  CREATE TYPE lead_stage AS ENUM (
    'Novo Lead',
    'Qualificado', 
    'Visita Agendada',
    'Em Negociação',
    'Documentação',
    'Contrato',
    'Fechamento'
  );
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Tipo lead_stage já existe';
END $$;

-- 3. CORREÇÃO: Remover o default antes de converter para enum
ALTER TABLE public.leads ALTER COLUMN stage DROP DEFAULT;

-- 4. Converter coluna stage para enum
ALTER TABLE public.leads ALTER COLUMN stage TYPE lead_stage USING stage::lead_stage;

-- 5. Adicionar o default novamente com o tipo correto
ALTER TABLE public.leads ALTER COLUMN stage SET DEFAULT 'Novo Lead'::lead_stage;

-- 6. Atualizar registros que possam estar NULL
UPDATE public.leads SET stage = 'Novo Lead'::lead_stage WHERE stage IS NULL;

-- 7. Migrar dados existentes
UPDATE public.leads 
SET 
  interest = COALESCE(interest, COALESCE(message, 'Interesse não especificado')),
  estimated_value = COALESCE(estimated_value, 300000.00),
  notes = COALESCE(notes, message),
  updated_at = COALESCE(updated_at, NOW())
WHERE interest IS NULL OR notes IS NULL;

-- 8. Criar índices
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- 9. Inserir dados de exemplo (opcional)
INSERT INTO public.leads (name, email, phone, source, stage, interest, estimated_value, notes) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-9999', 'Site', 'Novo Lead'::lead_stage, 'Apartamento 2 quartos', 350000.00, 'Interessado em imóveis na zona sul'),
('Maria Santos', 'maria.santos@email.com', '(11) 88888-8888', 'Facebook', 'Qualificado'::lead_stage, 'Casa 3 quartos', 450000.00, 'Família com 2 filhos'),
('Pedro Costa', 'pedro.costa@email.com', '(11) 77777-7777', 'Indicação', 'Visita Agendada'::lead_stage, 'Apartamento cobertura', 800000.00, 'Visita marcada para sexta-feira')
ON CONFLICT (email) DO NOTHING;

-- 10. Verificar resultado
SELECT id, name, email, stage, interest, estimated_value FROM public.leads LIMIT 5; 