-- CRIAÇÃO DA TABELA DE MODELOS DE CONTRATO
-- Execute no SQL Editor do Supabase

-- 1. Criar tabela para modelos de contrato
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 2. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_contract_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_templates_updated_at();

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contract_templates_created_by ON public.contract_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_contract_templates_created_at ON public.contract_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_contract_templates_is_active ON public.contract_templates(is_active);

-- 4. Configurar RLS (Row Level Security)
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança
CREATE POLICY "Users can view contract templates" ON public.contract_templates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert contract templates" ON public.contract_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own contract templates" ON public.contract_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own contract templates" ON public.contract_templates
  FOR DELETE USING (auth.uid() = created_by);

-- 6. Criar bucket no storage para documentos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-templates', 'contract-templates', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Criar políticas para o storage
CREATE POLICY "Authenticated users can upload contract templates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contract-templates' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view contract templates" ON storage.objects
  FOR SELECT USING (bucket_id = 'contract-templates');

CREATE POLICY "Users can update their own contract templates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'contract-templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contract templates" ON storage.objects
  FOR DELETE USING (bucket_id = 'contract-templates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Verificar estrutura criada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contract_templates'
ORDER BY ordinal_position; 