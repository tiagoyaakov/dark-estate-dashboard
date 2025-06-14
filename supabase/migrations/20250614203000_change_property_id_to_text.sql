
-- Alterar o tipo da coluna id de UUID para TEXT na tabela properties
-- Primeiro, vamos converter qualquer UUID existente para TEXT
ALTER TABLE public.properties ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Também precisamos alterar a coluna property_id na tabela property_images para manter a consistência
ALTER TABLE public.property_images ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;

-- Recriar a constraint de foreign key com o novo tipo
ALTER TABLE public.property_images 
DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;

ALTER TABLE public.property_images 
ADD CONSTRAINT property_images_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Atualizar a tabela leads também para manter consistência
ALTER TABLE public.leads ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;

ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_property_id_fkey;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES public.properties(id);
