-- Migration: Create contracts system tables
-- This creates the missing tables that are defined in the TypeScript types but don't exist in the database

-- Create contract_templates table
CREATE TABLE public.contract_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  template_type TEXT CHECK (template_type IN ('Locação', 'Venda')) DEFAULT 'Locação',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create contracts table with all fields from TypeScript types
CREATE TABLE public.contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  numero TEXT NOT NULL UNIQUE,
  tipo TEXT CHECK (tipo IN ('Locação', 'Venda')) NOT NULL,
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

-- Add foreign key constraints
ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_template_id_fkey 
FOREIGN KEY (template_id) REFERENCES public.contract_templates(id);

ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id);

-- Add missing columns to existing tables that are referenced in the code
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_purpose TEXT CHECK (property_purpose IN ('Aluguel', 'Venda')) DEFAULT 'Aluguel',
ADD COLUMN IF NOT EXISTS proprietario_nome TEXT,
ADD COLUMN IF NOT EXISTS proprietario_estado_civil TEXT,
ADD COLUMN IF NOT EXISTS proprietario_cpf TEXT,
ADD COLUMN IF NOT EXISTS proprietario_endereco TEXT,
ADD COLUMN IF NOT EXISTS proprietario_email TEXT;

-- Add missing columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Novo Lead',
ADD COLUMN IF NOT EXISTS interest TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS estado_civil TEXT,
ADD COLUMN IF NOT EXISTS imovel_interesse TEXT;

-- Create storage bucket for contract templates if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contract-templates', 'contract-templates', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for contract templates bucket
CREATE POLICY "Authenticated users can view contract templates" ON storage.objects
FOR SELECT USING (bucket_id = 'contract-templates' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload contract templates" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'contract-templates' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contract templates" ON storage.objects
FOR UPDATE USING (bucket_id = 'contract-templates' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete contract templates" ON storage.objects
FOR DELETE USING (bucket_id = 'contract-templates' AND auth.role() = 'authenticated');

-- Enable Row Level Security
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - you can restrict later)
CREATE POLICY "Anyone can view contract templates" ON public.contract_templates
FOR SELECT USING (true);

CREATE POLICY "Anyone can create contract templates" ON public.contract_templates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update contract templates" ON public.contract_templates
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete contract templates" ON public.contract_templates
FOR DELETE USING (true);

CREATE POLICY "Anyone can view contracts" ON public.contracts
FOR SELECT USING (true);

CREATE POLICY "Anyone can create contracts" ON public.contracts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update contracts" ON public.contracts
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete contracts" ON public.contracts
FOR DELETE USING (true);

-- Create trigger for updated_at in contracts
CREATE TRIGGER update_contracts_updated_at 
BEFORE UPDATE ON public.contracts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at in contract_templates  
CREATE TRIGGER update_contract_templates_updated_at 
BEFORE UPDATE ON public.contract_templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at in leads (if not exists)
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at 
BEFORE UPDATE ON public.leads 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the properties table to use TEXT for enum values instead of custom enums
-- (to match what's defined in the TypeScript types)
ALTER TABLE public.properties 
ALTER COLUMN type TYPE TEXT,
ALTER COLUMN status TYPE TEXT;

-- Drop the old enum types if they exist and are not being used elsewhere
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS property_status CASCADE; 