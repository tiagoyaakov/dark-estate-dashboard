-- MIGRAÇÃO: Adaptar tabela leads para sistema Kanban
-- Execute estes comandos no Supabase Dashboard > SQL Editor

-- PASSO 1: Adicionar novas colunas necessárias para o kanban
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Novo Lead';

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS interest TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2);

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- PASSO 2: Criar enum para os estágios do kanban (com tratamento de erro)
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
    RAISE NOTICE 'Tipo lead_stage já existe, pulando criação...';
END $$;

-- PASSO 3: Alterar coluna stage para usar o enum
ALTER TABLE public.leads 
ALTER COLUMN stage TYPE lead_stage USING stage::lead_stage;

-- PASSO 4: Criar trigger para atualizar updated_at na tabela leads
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_updated_at') THEN
    CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- PASSO 5: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads(updated_at);

-- PASSO 6: Migrar dados existentes para compatibilidade
UPDATE public.leads 
SET 
  stage = 'Novo Lead'::lead_stage,
  interest = COALESCE(message, 'Interesse não especificado'),
  estimated_value = 300000.00, -- Valor padrão
  notes = message,
  updated_at = NOW()
WHERE stage IS NULL OR interest IS NULL;

-- PASSO 7: Inserir dados de exemplo compatíveis com o kanban
INSERT INTO public.leads (name, email, phone, source, stage, interest, estimated_value, notes, property_id) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'Site', 'Novo Lead', 'Apartamento 2 quartos', 350000.00, 'Interessado em imóveis na zona sul', null),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Facebook', 'Qualificado', 'Casa 3 quartos', 450000.00, 'Família com 2 filhos', null),
('Pedro Costa', 'pedro@email.com', '(11) 77777-7777', 'Indicação', 'Visita Agendada', 'Apartamento cobertura', 800000.00, 'Visita marcada para sexta-feira', null),
('Ana Oliveira', 'ana@email.com', '(11) 66666-6666', 'Google Ads', 'Em Negociação', 'Sala comercial', 280000.00, 'Negociando condições de pagamento', null),
('Carlos Lima', 'carlos@email.com', '(11) 55555-5555', 'OLX', 'Documentação', 'Casa térrea', 520000.00, 'Aguardando documentos do financiamento', null),
('Fernanda Rocha', 'fernanda@email.com', '(11) 44444-4444', 'ZAP Imóveis', 'Contrato', 'Apartamento studio', 220000.00, 'Contrato em análise jurídica', null),
('Roberto Dias', 'roberto@email.com', '(11) 33333-3333', 'Viva Real', 'Fechamento', 'Casa de campo', 650000.00, 'Aguardando assinatura final', null)
ON CONFLICT (email) DO NOTHING;

-- PASSO 8: Criar view para relatórios do kanban
CREATE OR REPLACE VIEW public.kanban_stats AS
SELECT 
  stage,
  COUNT(*) as lead_count,
  AVG(estimated_value) as avg_value,
  SUM(estimated_value) as total_value,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM public.leads 
WHERE stage IS NOT NULL
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'Novo Lead' THEN 1
    WHEN 'Qualificado' THEN 2
    WHEN 'Visita Agendada' THEN 3
    WHEN 'Em Negociação' THEN 4
    WHEN 'Documentação' THEN 5
    WHEN 'Contrato' THEN 6
    WHEN 'Fechamento' THEN 7
  END;

-- PASSO 9: Criar função para mover lead entre estágios
CREATE OR REPLACE FUNCTION move_lead_stage(
  lead_id UUID,
  new_stage lead_stage
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.leads 
  SET 
    stage = new_stage,
    updated_at = NOW()
  WHERE id = lead_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- PASSO 10: Criar função para buscar leads por estágio
CREATE OR REPLACE FUNCTION get_leads_by_stage(
  stage_filter lead_stage DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  stage lead_stage,
  interest TEXT,
  estimated_value DECIMAL,
  notes TEXT,
  property_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  IF stage_filter IS NULL THEN
    RETURN QUERY
    SELECT 
      l.id, l.name, l.email, l.phone, l.source, 
      l.stage, l.interest, l.estimated_value, l.notes, 
      l.property_id, l.created_at, l.updated_at
    FROM public.leads l
    ORDER BY l.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT 
      l.id, l.name, l.email, l.phone, l.source, 
      l.stage, l.interest, l.estimated_value, l.notes, 
      l.property_id, l.created_at, l.updated_at
    FROM public.leads l
    WHERE l.stage = stage_filter
    ORDER BY l.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- PASSO 11: Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'leads'
ORDER BY ordinal_position;

-- PASSO 12: Verificar dados migrados
SELECT 
    stage,
    COUNT(*) as quantidade,
    AVG(estimated_value) as valor_medio
FROM public.leads 
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'Novo Lead' THEN 1
    WHEN 'Qualificado' THEN 2
    WHEN 'Visita Agendada' THEN 3
    WHEN 'Em Negociação' THEN 4
    WHEN 'Documentação' THEN 5
    WHEN 'Contrato' THEN 6
    WHEN 'Fechamento' THEN 7
  END;

-- PASSO 13: Verificar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'leads' 
AND schemaname = 'public'; 