-- ==================================================
-- TESTE DO ISOLAMENTO DE DADOS
-- ==================================================

-- 1. MOSTRAR CONTEXTO ATUAL
SELECT 
  '🔍 CONTEXTO ATUAL' as section,
  auth.uid() as current_user_id,
  up.full_name as current_user_name,
  up.role as current_user_role,
  public.get_user_role() as function_role_result
FROM public.user_profiles up
WHERE up.id = auth.uid();

-- 2. DADOS QUE O USUÁRIO ATUAL DEVERIA VER (SEM RLS)
SELECT 
  '📋 LEADS SEM FILTRO RLS (BYPASS)' as section,
  l.id,
  l.name,
  l.user_id,
  up.full_name as owner_name,
  up.role as owner_role,
  CASE 
    WHEN l.user_id = auth.uid() THEN '✅ PRÓPRIO'
    WHEN l.user_id IS NULL THEN '⚠️ ÓRFÃO'
    ELSE '❌ DE OUTRO USUÁRIO'
  END as ownership_status
FROM public.leads l
LEFT JOIN public.user_profiles up ON l.user_id = up.id
ORDER BY l.created_at DESC;

-- 3. DADOS QUE O USUÁRIO ATUAL VÊ COM RLS (REAL)
-- (Este comando mostra apenas o que o RLS permite ver)
SELECT 
  '🔒 LEADS COM RLS ATIVO' as section,
  COUNT(*) as total_visible_leads,
  string_agg(name, ', ') as visible_lead_names
FROM public.leads;

-- 4. TESTE DE INSERÇÃO COM USER_ID AUTOMÁTICO
SELECT 
  '🧪 TESTE DE INSERÇÃO' as section,
  'Usuário logado: ' || COALESCE(auth.uid()::text, 'NULL') as current_user_test;

-- 5. DISTRIBUIÇÃO DE DADOS POR USUÁRIO (APENAS ADMIN VÊ TUDO)
SELECT 
  '📊 DISTRIBUIÇÃO TOTAL (SÓ ADMIN VÊ)' as section,
  up.full_name as usuario,
  up.role,
  COUNT(DISTINCT l.id) as leads_count,
  COUNT(DISTINCT p.id) as properties_count,
  COUNT(DISTINCT c.id) as contracts_count
FROM public.user_profiles up
LEFT JOIN public.leads l ON l.user_id = up.id
LEFT JOIN public.properties p ON p.user_id = up.id  
LEFT JOIN public.contracts c ON c.created_by = up.id
GROUP BY up.id, up.full_name, up.role
ORDER BY up.role, up.full_name;

-- 6. VERIFICAR POLÍTICAS ATIVAS
SELECT 
  '🛡️ POLÍTICAS RLS ATIVAS' as section,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('leads', 'properties', 'contracts')
ORDER BY tablename, cmd;

-- 7. SIMULAÇÃO DE TESTE POR ROLE
SELECT 
  '🎭 SIMULAÇÃO COMPORTAMENTO POR ROLE' as section,
  CASE 
    WHEN public.get_user_role() = 'corretor' THEN 
      '👤 CORRETOR: Deve ver apenas seus próprios dados'
    WHEN public.get_user_role() = 'gestor' THEN 
      '👔 GESTOR: Deve ver dados de todos os corretores'
    WHEN public.get_user_role() = 'admin' THEN 
      '👑 ADMIN: Deve ver absolutamente tudo'
    ELSE
      '❓ ROLE DESCONHECIDO: ' || public.get_user_role()
  END as expected_behavior;

-- 8. INSTRUÇÕES DE TESTE MANUAL
SELECT 
  '📝 INSTRUÇÕES DE TESTE' as section,
  'Execute os seguintes testes:
1. Login como CORRETOR 1 → Criar lead → Deve ver apenas esse lead
2. Login como CORRETOR 2 → NÃO deve ver o lead do CORRETOR 1
3. Login como GESTOR → Deve ver leads de ambos corretores
4. Login como ADMIN → Deve ver tudo + gerenciar usuários' as manual_tests; 