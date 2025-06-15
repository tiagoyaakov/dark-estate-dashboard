
-- MIGRAÇÃO: Converter colunas UUID para TEXT
-- Execute estes comandos no Supabase Dashboard > SQL Editor

-- PASSO 1: Remover todas as foreign key constraints primeiro
ALTER TABLE public.property_images 
DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;

ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_property_id_fkey;

-- PASSO 2: Converter todas as colunas para TEXT
-- 2.1. Alterar coluna id da tabela properties de UUID para TEXT
ALTER TABLE public.properties 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 2.2. Alterar coluna property_id da tabela property_images de UUID para TEXT  
ALTER TABLE public.property_images 
ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;

-- 2.3. Alterar coluna property_id da tabela leads de UUID para TEXT
ALTER TABLE public.leads 
ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;

-- PASSO 3: Recriar as foreign key constraints com os tipos corretos
ALTER TABLE public.property_images 
ADD CONSTRAINT property_images_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- PASSO 4: Verificar se as alterações foram aplicadas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'property_images', 'leads')
AND column_name IN ('id', 'property_id')
ORDER BY table_name, column_name;

-- PASSO 5: Verificar se as foreign keys foram recriadas
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
AND tc.table_name IN ('property_images', 'leads');
