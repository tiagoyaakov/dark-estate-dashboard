
-- MIGRAÇÃO: Converter colunas UUID para TEXT
-- Execute estes comandos no Supabase Dashboard > SQL Editor

-- 1. Alterar coluna id da tabela properties de UUID para TEXT
ALTER TABLE public.properties 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 2. Alterar coluna property_id da tabela property_images de UUID para TEXT  
ALTER TABLE public.property_images 
ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;

-- 3. Alterar coluna property_id da tabela leads de UUID para TEXT
ALTER TABLE public.leads 
ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;

-- 4. Recriar foreign key constraint entre property_images e properties
ALTER TABLE public.property_images 
DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;

ALTER TABLE public.property_images 
ADD CONSTRAINT property_images_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- 5. Recriar foreign key constraint entre leads e properties  
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_property_id_fkey;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- 6. Verificar se as alterações foram aplicadas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'property_images', 'leads')
AND column_name IN ('id', 'property_id')
ORDER BY table_name, column_name;
