-- ==================================================
-- CRIAR LEAD DE TESTE PARA VERIFICAR ISOLAMENTO
-- ==================================================

-- Verificar usuário atual primeiro
SELECT 
  '👤 USUÁRIO ATUAL' as info,
  auth.uid() as user_id,
  up.full_name as name,
  up.role
FROM public.user_profiles up
WHERE up.id = auth.uid();

-- Criar lead de teste vinculado ao usuário atual
INSERT INTO public.leads (
  name,
  email,
  phone,
  source,
  stage,
  user_id,
  created_at
) VALUES (
  'Lead Teste - ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI:SS'),
  'teste@teste.com',
  '11999999999',
  'Teste Manual',
  'Novo Lead',
  auth.uid(),
  NOW()
);

-- Verificar se o lead foi criado
SELECT 
  '✅ LEAD CRIADO' as status,
  l.id,
  l.name,
  l.user_id,
  up.full_name as owner_name,
  up.role as owner_role
FROM public.leads l
LEFT JOIN public.user_profiles up ON l.user_id = up.id
WHERE l.name LIKE 'Lead Teste -%'
ORDER BY l.created_at DESC
LIMIT 1; 