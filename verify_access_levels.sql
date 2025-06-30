
-- ==================================================
-- VERIFICAÇÃO DOS NÍVEIS DE ACESSO
-- ==================================================

-- 1. VERIFICAR USUÁRIO ATUAL E SEU ROLE
SELECT 
  '🎭 USUÁRIO ATUAL' as section,
  auth.uid() as user_id,
  up.full_name,
  up.role,
  up.email
FROM public.user_profiles up
WHERE up.id = auth.uid();

-- 2. VERIFICAR POLÍTICAS RLS ATIVAS PARA LEADS
SELECT 
  '🛡️ POLÍTICAS RLS PARA LEADS' as section,
  policyname,
  cmd as operation,
  qual as condition
FROM pg_policies 
WHERE tablename = 'leads'
ORDER BY cmd;

-- 3. TESTAR VISIBILIDADE DE LEADS POR ROLE
SELECT 
  '👥 LEADS VISÍVEIS PELO USUÁRIO ATUAL' as section,
  l.id,
  l.name as lead_name,
  l.user_id as owner_id,
  up.full_name as owner_name,
  up.role as owner_role,
  CASE 
    WHEN l.user_id = auth.uid() THEN '✅ PRÓPRIO'
    ELSE '👁️ DE OUTRO USUÁRIO (GESTOR/ADMIN)'
  END as visibility_reason
FROM public.leads l
LEFT JOIN public.user_profiles up ON l.user_id = up.id
ORDER BY l.created_at DESC
LIMIT 10;

-- 4. CONTAR LEADS POR USUÁRIO (ADMIN VÊ TUDO)
SELECT 
  '📊 DISTRIBUIÇÃO DE LEADS POR CORRETOR' as section,
  up.full_name as corretor,
  up.role,
  COUNT(l.id) as total_leads
FROM public.user_profiles up
LEFT JOIN public.leads l ON l.user_id = up.id
GROUP BY up.id, up.full_name, up.role
ORDER BY up.role, COUNT(l.id) DESC;

-- 5. VERIFICAR SE AS POLÍTICAS ESTÃO FUNCIONANDO CORRETAMENTE
SELECT 
  '🔍 DIAGNÓSTICO DO SISTEMA' as section,
  CASE 
    WHEN public.get_user_role() = 'admin' THEN 
      '👑 ADMIN: Deveria ver TODOS os leads de TODOS os usuários'
    WHEN public.get_user_role() = 'gestor' THEN 
      '👔 GESTOR: Deveria ver TODOS os leads de TODOS os corretores'
    WHEN public.get_user_role() = 'corretor' THEN 
      '👤 CORRETOR: Deveria ver APENAS seus próprios leads'
    ELSE
      '❓ ROLE DESCONHECIDO: ' || public.get_user_role()
  END as expected_behavior;

-- 6. INSTRUÇÕES PARA TESTE
SELECT 
  '📝 COMO TESTAR OS NÍVEIS DE ACESSO' as section,
  'Execute este SQL com diferentes usuários logados:
  
1. 👤 Login como CORRETOR → Deve ver apenas leads próprios
2. 👔 Login como GESTOR → Deve ver leads de TODOS os corretores  
3. 👑 Login como ADMIN → Deve ver ABSOLUTAMENTE TUDO

Se um GESTOR não estiver vendo leads de outros corretores, 
há um problema nas políticas RLS que precisa ser corrigido.' as instructions;
