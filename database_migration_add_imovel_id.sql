
-- MIGRAÇÃO: Adicionar nova coluna imovel_id do tipo TEXT
-- Execute estes comandos no Supabase Dashboard > SQL Editor

-- PASSO 1: Adicionar nova coluna imovel_id na tabela properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS imovel_id TEXT UNIQUE;

-- PASSO 2: Adicionar nova coluna imovel_id na tabela property_images
ALTER TABLE public.property_images 
ADD COLUMN IF NOT EXISTS imovel_id TEXT;

-- PASSO 3: Adicionar nova coluna imovel_id na tabela leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS imovel_id TEXT;

-- PASSO 4: Migrar dados existentes (converter UUID para TEXT)
-- 4.1. Migrar dados da tabela properties
UPDATE public.properties 
SET imovel_id = id::TEXT 
WHERE imovel_id IS NULL;

-- 4.2. Migrar dados da tabela property_images
UPDATE public.property_images 
SET imovel_id = property_id::TEXT 
WHERE imovel_id IS NULL;

-- 4.3. Migrar dados da tabela leads
UPDATE public.leads 
SET imovel_id = property_id::TEXT 
WHERE imovel_id IS NULL;

-- PASSO 5: Criar foreign key constraints com as novas colunas
ALTER TABLE public.property_images 
ADD CONSTRAINT property_images_imovel_id_fkey 
FOREIGN KEY (imovel_id) REFERENCES public.properties(imovel_id) ON DELETE CASCADE;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_imovel_id_fkey 
FOREIGN KEY (imovel_id) REFERENCES public.properties(imovel_id) ON DELETE CASCADE;

-- PASSO 6: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_properties_imovel_id ON public.properties(imovel_id);
CREATE INDEX IF NOT EXISTS idx_property_images_imovel_id ON public.property_images(imovel_id);
CREATE INDEX IF NOT EXISTS idx_leads_imovel_id ON public.leads(imovel_id);

-- PASSO 7: Verificar se as colunas foram criadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'property_images', 'leads')
AND column_name = 'imovel_id'
ORDER BY table_name;

-- PASSO 8: Verificar se os dados foram migrados
SELECT 
    'properties' as tabela,
    COUNT(*) as total_registros,
    COUNT(imovel_id) as registros_com_imovel_id
FROM public.properties
UNION ALL
SELECT 
    'property_images' as tabela,
    COUNT(*) as total_registros,
    COUNT(imovel_id) as registros_com_imovel_id
FROM public.property_images
UNION ALL
SELECT 
    'leads' as tabela,
    COUNT(*) as total_registros,
    COUNT(imovel_id) as registros_com_imovel_id
FROM public.leads;

-- PASSO 9: Verificar foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema='public'
AND tc.table_name IN ('property_images', 'leads')
AND kcu.column_name = 'imovel_id';
