-- Create contract_templates table
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  template_type TEXT CHECK (template_type IN ('Locacao', 'Venda')) DEFAULT 'Locacao',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  numero TEXT NOT NULL UNIQUE,
  tipo TEXT CHECK (tipo IN ('Locacao', 'Venda')) NOT NULL,
  status TEXT CHECK (status IN ('Ativo', 'Pendente', 'Vencendo', 'Expirado', 'Cancelado')) DEFAULT 'Pendente',
  
  -- Client information
  client_id TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_cpf TEXT,
  client_address TEXT,
  client_nationality TEXT,
  client_marital_status TEXT,
  
  -- Landlord information
  landlord_name TEXT,
  landlord_email TEXT,
  landlord_phone TEXT,
  landlord_cpf TEXT,
  landlord_address TEXT,
  landlord_nationality TEXT,
  landlord_marital_status TEXT,
  
  -- Guarantor information
  guarantor_name TEXT,
  guarantor_email TEXT,
  guarantor_phone TEXT,
  guarantor_cpf TEXT,
  guarantor_address TEXT,
  guarantor_nationality TEXT,
  guarantor_marital_status TEXT,
  
  -- Property information
  property_id TEXT,
  property_title TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type TEXT,
  property_area DECIMAL(10,2),
  property_city TEXT,
  property_state TEXT,
  property_zip_code TEXT,
  
  -- Template and contract details
  template_id TEXT,
  template_name TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_assinatura DATE,
  proximo_vencimento DATE,
  contract_duration TEXT,
  payment_day TEXT,
  payment_method TEXT,
  contract_city TEXT,
  contract_file_path TEXT,
  contract_file_name TEXT,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Add missing columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_purpose TEXT CHECK (property_purpose IN ('Aluguel', 'Venda')) DEFAULT 'Aluguel';

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS proprietario_nome TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS proprietario_estado_civil TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS proprietario_cpf TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS proprietario_endereco TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS proprietario_email TEXT;

-- Add missing columns to leads table  
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Novo Lead';

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT '';

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2) DEFAULT 0;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS cpf TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS endereco TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS estado_civil TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS imovel_interesse TEXT;

-- Add foreign key constraints (only if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contract_templates') AND 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contracts') THEN
        ALTER TABLE public.contracts 
        ADD CONSTRAINT IF NOT EXISTS contracts_template_id_fkey 
        FOREIGN KEY (template_id) REFERENCES public.contract_templates(id);
        
        ALTER TABLE public.contracts 
        ADD CONSTRAINT IF NOT EXISTS contracts_property_id_fkey 
        FOREIGN KEY (property_id) REFERENCES public.properties(id);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Anyone can view contract templates" ON public.contract_templates;
CREATE POLICY "Anyone can view contract templates" ON public.contract_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create contract templates" ON public.contract_templates;
CREATE POLICY "Anyone can create contract templates" ON public.contract_templates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update contract templates" ON public.contract_templates;
CREATE POLICY "Anyone can update contract templates" ON public.contract_templates FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete contract templates" ON public.contract_templates;
CREATE POLICY "Anyone can delete contract templates" ON public.contract_templates FOR DELETE USING (true);

DROP POLICY IF EXISTS "Anyone can view contracts" ON public.contracts;
CREATE POLICY "Anyone can view contracts" ON public.contracts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create contracts" ON public.contracts;
CREATE POLICY "Anyone can create contracts" ON public.contracts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update contracts" ON public.contracts;
CREATE POLICY "Anyone can update contracts" ON public.contracts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete contracts" ON public.contracts;
CREATE POLICY "Anyone can delete contracts" ON public.contracts FOR DELETE USING (true);

-- Create or replace update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at 
BEFORE UPDATE ON public.contracts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contract_templates_updated_at ON public.contract_templates;
CREATE TRIGGER update_contract_templates_updated_at 
BEFORE UPDATE ON public.contract_templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at 
BEFORE UPDATE ON public.leads 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 