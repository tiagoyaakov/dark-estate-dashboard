-- ==================================================
-- SISTEMA DE ISOLAMENTO DE DADOS POR USUÁRIO
-- ==================================================

-- 1. Adicionar user_id na tabela leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Adicionar user_id na tabela properties  
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON public.contracts(created_by);

-- 4. Atualizar RLS policies para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

-- Criar novas políticas para leads
CREATE POLICY "Users can view own leads" ON public.leads
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

CREATE POLICY "Users can insert own leads" ON public.leads
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own leads" ON public.leads
FOR UPDATE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

CREATE POLICY "Users can delete own leads" ON public.leads
FOR DELETE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

-- 5. Atualizar RLS policies para properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON public.properties;

-- Criar novas políticas para properties
CREATE POLICY "Users can view own properties" ON public.properties
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

CREATE POLICY "Users can insert own properties" ON public.properties
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own properties" ON public.properties
FOR UPDATE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

CREATE POLICY "Users can delete own properties" ON public.properties
FOR DELETE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

-- 6. Atualizar RLS policies para contracts (usando created_by)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can insert own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can update own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can delete own contracts" ON public.contracts;

-- Criar novas políticas para contracts
CREATE POLICY "Users can view own contracts" ON public.contracts
FOR SELECT USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

CREATE POLICY "Users can insert own contracts" ON public.contracts
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own contracts" ON public.contracts
FOR UPDATE USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

CREATE POLICY "Users can delete own contracts" ON public.contracts
FOR DELETE USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
);

-- 7. Property images herdam permissão da propriedade pai
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view property images" ON public.property_images;
DROP POLICY IF EXISTS "Users can insert property images" ON public.property_images;
DROP POLICY IF EXISTS "Users can update property images" ON public.property_images;
DROP POLICY IF EXISTS "Users can delete property images" ON public.property_images;

-- Criar políticas para property_images baseadas na propriedade pai
CREATE POLICY "Users can view property images" ON public.property_images
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
    )
  )
);

CREATE POLICY "Users can insert property images" ON public.property_images
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update property images" ON public.property_images
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
    )
  )
);

CREATE POLICY "Users can delete property images" ON public.property_images
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin'))
    )
  )
);

-- 8. Função para popular user_id em dados existentes (opcional - executar se necessário)
CREATE OR REPLACE FUNCTION populate_existing_user_ids()
RETURNS TEXT AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar um usuário admin para atribuir dados órfãos
  SELECT id INTO admin_user_id 
  FROM public.user_profiles 
  WHERE role = 'admin' 
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RETURN 'Nenhum usuário admin encontrado. Dados existentes não foram atualizados.';
  END IF;
  
  -- Atualizar leads sem user_id
  UPDATE public.leads 
  SET user_id = admin_user_id 
  WHERE user_id IS NULL;
  
  -- Atualizar properties sem user_id
  UPDATE public.properties 
  SET user_id = admin_user_id 
  WHERE user_id IS NULL;
  
  RETURN 'Dados existentes atribuídos ao usuário admin: ' || admin_user_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 9. Verificar criação
SELECT 'Sistema de isolamento de dados por usuário criado com sucesso!' AS status;

-- 10. Instruções para popular dados existentes
SELECT 'Para popular dados existentes, execute: SELECT populate_existing_user_ids();' AS instruction; 