-- ==================================================
-- ANÁLISE SEGURA DO PROBLEMA DE ISOLAMENTO
-- ==================================================

-- 1. VERIFICAR SE AS COLUNAS USER_ID EXISTEM
SELECT 
  '=== ESTRUTURA DAS TABELAS ===' as section,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('leads', 'properties', 'contracts') 
  AND column_name IN ('user_id', 'created_by')
ORDER BY table_name, column_name;

-- 2. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
  '=== STATUS RLS ===' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('leads', 'properties', 'contracts')
ORDER BY tablename;

-- 3. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
  '=== POLÍTICAS RLS ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  SUBSTRING(qual FROM 1 FOR 100) as policy_condition
FROM pg_policies 
WHERE tablename IN ('leads', 'properties', 'contracts')
ORDER BY tablename, cmd, policyname;

-- 4. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
  '=== USUÁRIOS NO SISTEMA ===' as section,
  id,
  email,
  full_name,
  role,
  created_at
FROM public.user_profiles 
ORDER BY role, created_at;

-- 5. VERIFICAR DADOS NA TABELA LEADS (DIAGNÓSTICO COMPLETO)
SELECT 
  '=== LEADS E SEUS USER_IDS ===' as section,
  l.id,
  l.name,
  l.user_id,
  up.full_name as owner_name,
  up.role as owner_role,
  l.created_at,
  CASE 
    WHEN l.user_id IS NULL THEN '⚠️ SEM OWNER'
    ELSE '✅ COM OWNER'
  END as status
FROM public.leads l
LEFT JOIN public.user_profiles up ON l.user_id = up.id
ORDER BY l.created_at DESC;

-- 6. VERIFICAR DADOS NA TABELA PROPERTIES (DIAGNÓSTICO COMPLETO)
SELECT 
  '=== PROPERTIES E SEUS USER_IDS ===' as section,
  p.id,
  SUBSTRING(p.title FROM 1 FOR 50) as title,
  p.user_id,
  up.full_name as owner_name,
  up.role as owner_role,
  p.created_at,
  CASE 
    WHEN p.user_id IS NULL THEN '⚠️ SEM OWNER'
    ELSE '✅ COM OWNER'
  END as status
FROM public.properties p
LEFT JOIN public.user_profiles up ON p.user_id = up.id
ORDER BY p.created_at DESC;

-- 7. VERIFICAR DADOS NA TABELA CONTRACTS
SELECT 
  '=== CONTRACTS E SEUS CREATED_BY ===' as section,
  c.id,
  c.numero,
  c.client_name,
  c.created_by,
  up.full_name as owner_name,
  up.role as owner_role,
  c.created_at,
  CASE 
    WHEN c.created_by IS NULL THEN '⚠️ SEM OWNER'
    ELSE '✅ COM OWNER'
  END as status
FROM public.contracts c
LEFT JOIN public.user_profiles up ON c.created_by = up.id
ORDER BY c.created_at DESC;

-- 8. CONTAGEM DE DADOS ÓRFÃOS
SELECT 
  '=== RESUMO DE DADOS SEM OWNER ===' as section,
  'leads' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as records_without_owner,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as records_with_owner,
  ROUND(
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) * 100.0 / COUNT(*), 2
  ) as percent_without_owner
FROM public.leads

UNION ALL

SELECT 
  '=== RESUMO DE DADOS SEM OWNER ===' as section,
  'properties' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as records_without_owner,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as records_with_owner,
  ROUND(
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) * 100.0 / COUNT(*), 2
  ) as percent_without_owner
FROM public.properties

UNION ALL

SELECT 
  '=== RESUMO DE DADOS SEM OWNER ===' as section,
  'contracts' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) as records_without_owner,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as records_with_owner,
  ROUND(
    COUNT(CASE WHEN created_by IS NULL THEN 1 END) * 100.0 / COUNT(*), 2
  ) as percent_without_owner
FROM public.contracts;

-- 9. VERIFICAR CONTEXTO ATUAL
SELECT 
  '=== CONTEXTO ATUAL ===' as section,
  auth.uid() as current_user_id,
  current_user as current_db_user,
  session_user as session_user;

-- 10. DISTRIBUIÇÃO POR USUÁRIO
SELECT 
  '=== DISTRIBUIÇÃO POR USUÁRIO ===' as section,
  up.full_name as usuario,
  up.role,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT c.id) as total_contracts
FROM public.user_profiles up
LEFT JOIN public.leads l ON l.user_id = up.id
LEFT JOIN public.properties p ON p.user_id = up.id
LEFT JOIN public.contracts c ON c.created_by = up.id
GROUP BY up.id, up.full_name, up.role
ORDER BY up.role, up.full_name;

-- 11. DIAGNÓSTICO FINAL
SELECT 
  '=== DIAGNÓSTICO FINAL ===' as section,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'user_id') 
    THEN '❌ COLUNA user_id NÃO EXISTE na tabela leads'
    
    WHEN (SELECT COUNT(*) FROM public.leads WHERE user_id IS NULL) > 0 
    THEN '⚠️ EXISTEM LEADS SEM user_id - Precisa executar correção'
    
    WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads')
    THEN '❌ NÃO EXISTEM POLÍTICAS RLS para leads - Precisa executar correção'
    
    ELSE '✅ ESTRUTURA PARECE OK - Verifique as políticas RLS'
  END as status_geral;

SELECT '📋 DIAGNÓSTICO CONCLUÍDO - Execute complete_isolation_fix.sql para corrigir!' as next_step; 