-- CRIAÇÃO DA TABELA DE CONTRATOS
-- Execute no SQL Editor do Supabase

-- 1. Criar enum para tipos de contrato
DO $$ 
BEGIN
  CREATE TYPE contract_type AS ENUM ('Locação', 'Venda');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Tipo contract_type já existe';
END $$;

-- 2. Criar enum para status do contrato
DO $$ 
BEGIN
  CREATE TYPE contract_status AS ENUM ('Ativo', 'Pendente', 'Vencendo', 'Expirado', 'Cancelado');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Tipo contract_status já existe';
END $$;

-- 3. Criar tabela de contratos
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  tipo contract_type NOT NULL,
  status contract_status DEFAULT 'Pendente',
  
  -- Dados do cliente
  client_id TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_cpf TEXT,
  client_address TEXT,
  client_nationality TEXT,
  client_marital_status TEXT,
  
  -- Dados do locador
  landlord_name TEXT,
  landlord_email TEXT,
  landlord_phone TEXT,
  landlord_cpf TEXT,
  landlord_address TEXT,
  landlord_nationality TEXT,
  landlord_marital_status TEXT,
  
  -- Dados do fiador (se houver)
  guarantor_name TEXT,
  guarantor_email TEXT,
  guarantor_phone TEXT,
  guarantor_cpf TEXT,
  guarantor_address TEXT,
  guarantor_nationality TEXT,
  guarantor_marital_status TEXT,
  
  -- Dados da propriedade
  property_id TEXT,
  property_title TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type TEXT,
  property_area DECIMAL(10,2),
  property_city TEXT,
  property_state TEXT,
  property_zip_code TEXT,
  
  -- Dados do contrato
  template_id UUID REFERENCES public.contract_templates(id),
  template_name TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_assinatura DATE,
  proximo_vencimento DATE,
  
  -- Detalhes específicos do contrato
  contract_duration TEXT,
  payment_day TEXT,
  payment_method TEXT,
  contract_city TEXT,
  
  -- Arquivos
  contract_file_path TEXT,
  contract_file_name TEXT,
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 4. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contracts_numero ON public.contracts(numero);
CREATE INDEX IF NOT EXISTS idx_contracts_client_name ON public.contracts(client_name);
CREATE INDEX IF NOT EXISTS idx_contracts_property_title ON public.contracts(property_title);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tipo ON public.contracts(tipo);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at);
CREATE INDEX IF NOT EXISTS idx_contracts_data_inicio ON public.contracts(data_inicio);
CREATE INDEX IF NOT EXISTS idx_contracts_data_fim ON public.contracts(data_fim);
CREATE INDEX IF NOT EXISTS idx_contracts_proximo_vencimento ON public.contracts(proximo_vencimento);

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança
CREATE POLICY "Users can view all contracts" ON public.contracts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own contracts" ON public.contracts
  FOR DELETE USING (auth.uid() = created_by);

-- 8. Criar bucket no storage para contratos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- 9. Criar políticas para o storage de contratos
CREATE POLICY "Authenticated users can upload contracts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view contracts" ON storage.objects
  FOR SELECT USING (bucket_id = 'contracts');

CREATE POLICY "Users can update their own contracts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contracts" ON storage.objects
  FOR DELETE USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 10. Verificar estrutura criada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contracts'
ORDER BY ordinal_position; 