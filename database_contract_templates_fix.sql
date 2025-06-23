-- CORREÇÃO PARA SISTEMA DE UPLOAD DE TEMPLATES DE CONTRATO
-- Execute no SQL Editor do Supabase

-- 1. Criar bucket no storage para contract templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-templates', 'contract-templates', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can upload contract templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view contract templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own contract templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own contract templates" ON storage.objects;

-- 3. Criar políticas para o storage bucket contract-templates
CREATE POLICY "Authenticated users can upload contract templates"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'contract-templates' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view contract templates"
ON storage.objects FOR SELECT 
USING (bucket_id = 'contract-templates');

CREATE POLICY "Users can update their own contract templates"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'contract-templates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own contract templates"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'contract-templates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Verificar se o bucket foi criado
SELECT id, name, public FROM storage.buckets WHERE id = 'contract-templates';

-- 5. Verificar políticas do storage
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%contract%';

-- Adicionar campo template_type na tabela contract_templates
ALTER TABLE contract_templates 
ADD COLUMN template_type varchar(20) CHECK (template_type IN ('Locação', 'Venda')) DEFAULT 'Locação';

-- Comentário para documentar o campo
COMMENT ON COLUMN contract_templates.template_type IS 'Tipo do template de contrato: Locação ou Venda'; 