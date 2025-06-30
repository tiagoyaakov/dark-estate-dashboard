-- ==================================================
-- CORREÇÃO COMPLETA DO ISOLAMENTO DE DADOS
-- ==================================================

-- Começar com diagnóstico
SELECT '🔍 INICIANDO DIAGNÓSTICO COMPLETO...' as status;

-- 1. VERIFICAR E CRIAR COLUNAS USER_ID SE NÃO EXISTIREM
DO $$
BEGIN
  -- Verificar e adicionar user_id na tabela leads
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE '✅ Coluna user_id adicionada à tabela leads';
  ELSE
    RAISE NOTICE '✅ Coluna user_id já existe na tabela leads';
  END IF;

  -- Verificar e adicionar user_id na tabela properties
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.properties ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE '✅ Coluna user_id adicionada à tabela properties';
  ELSE
    RAISE NOTICE '✅ Coluna user_id já existe na tabela properties';
  END IF;
END $$;

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON public.contracts(created_by);

SELECT '📊 Índices criados com sucesso' as status;

-- 3. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

SELECT '🔒 RLS habilitado em todas as tabelas' as status;

-- 4. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Remover políticas da tabela leads
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'leads' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.leads';
  END LOOP;
  
  -- Remover políticas da tabela properties
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'properties' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.properties';
  END LOOP;
  
  -- Remover políticas da tabela contracts
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'contracts' LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.contracts';
  END LOOP;
  
  RAISE NOTICE '🧹 Todas as políticas antigas removidas';
END $$;

-- 5. CRIAR FUNÇÃO AUXILIAR ROBUSTA
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.user_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'corretor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

SELECT '⚙️ Função auxiliar criada' as status;

-- 6. CRIAR POLÍTICAS RIGOROSAS PARA LEADS
CREATE POLICY "rls_leads_select" ON public.leads
FOR SELECT USING (
  user_id = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "rls_leads_insert" ON public.leads
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "rls_leads_update" ON public.leads
FOR UPDATE USING (
  user_id = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "rls_leads_delete" ON public.leads
FOR DELETE USING (
  user_id = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

SELECT '🔐 Políticas RLS criadas para LEADS' as status;

-- 7. CRIAR POLÍTICAS RIGOROSAS PARA PROPERTIES
CREATE POLICY "rls_properties_select" ON public.properties
FOR SELECT USING (
  user_id = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "rls_properties_insert" ON public.properties
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "rls_properties_update" ON public.properties
FOR UPDATE USING (
  user_id = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "rls_properties_delete" ON public.properties
FOR DELETE USING (
  user_id = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

SELECT '🔐 Políticas RLS criadas para PROPERTIES' as status;

-- 8. CRIAR POLÍTICAS RIGOROSAS PARA CONTRACTS
CREATE POLICY "rls_contracts_select" ON public.contracts
FOR SELECT USING (
  created_by = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "rls_contracts_insert" ON public.contracts
FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "rls_contracts_update" ON public.contracts
FOR UPDATE USING (
  created_by = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "rls_contracts_delete" ON public.contracts
FOR DELETE USING (
  created_by = auth.uid() 
  OR public.get_user_role() IN ('gestor', 'admin')
);

SELECT '🔐 Políticas RLS criadas para CONTRACTS' as status;

-- 9. ATRIBUIR DADOS ÓRFÃOS AO PRIMEIRO ADMIN
DO $$
DECLARE
  admin_id UUID;
  leads_updated INTEGER;
  properties_updated INTEGER;
  contracts_updated INTEGER;
BEGIN
  -- Buscar primeiro admin
  SELECT id INTO admin_id 
  FROM public.user_profiles 
  WHERE role = 'admin' 
  ORDER BY created_at 
  LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    -- Atualizar leads órfãos
    UPDATE public.leads 
    SET user_id = admin_id 
    WHERE user_id IS NULL;
    GET DIAGNOSTICS leads_updated = ROW_COUNT;
    
    -- Atualizar properties órfãs
    UPDATE public.properties 
    SET user_id = admin_id 
    WHERE user_id IS NULL;
    GET DIAGNOSTICS properties_updated = ROW_COUNT;
    
    -- Atualizar contracts órfãos
    UPDATE public.contracts 
    SET created_by = admin_id 
    WHERE created_by IS NULL;
    GET DIAGNOSTICS contracts_updated = ROW_COUNT;
    
    RAISE NOTICE '🔄 Dados órfãos atribuídos ao admin %: % leads, % properties, % contracts', 
      admin_id, leads_updated, properties_updated, contracts_updated;
  ELSE
    RAISE NOTICE '⚠️ Nenhum admin encontrado para atribuir dados órfãos';
  END IF;
END $$;

-- 10. VERIFICAÇÃO FINAL
SELECT 
  '🎯 VERIFICAÇÃO FINAL - LEADS' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_owner,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphans
FROM public.leads;

SELECT 
  '🎯 VERIFICAÇÃO FINAL - PROPERTIES' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_owner,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphans
FROM public.properties;

SELECT 
  '🎯 VERIFICAÇÃO FINAL - CONTRACTS' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as with_owner,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) as orphans
FROM public.contracts;

-- 11. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  '🔍 POLÍTICAS ATIVAS' as status,
  tablename,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('leads', 'properties', 'contracts')
GROUP BY tablename
ORDER BY tablename;

SELECT '🎉 ISOLAMENTO CONFIGURADO COM SUCESSO!' as final_status;
SELECT '⚠️ IMPORTANTE: Faça logout/login na aplicação para aplicar as mudanças' as importante; 