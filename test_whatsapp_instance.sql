-- Script para testar a criação de uma instância WhatsApp
-- Execute este script para verificar se a instância foi criada corretamente

-- 1. Listar todas as instâncias existentes
SELECT 
  wi.id,
  wi.instance_name,
  wi.phone_number,
  wi.status,
  wi.created_at,
  up.full_name as owner_name,
  up.email as owner_email,
  up.role as owner_role
FROM whatsapp_instances wi
JOIN user_profiles up ON wi.user_id = up.id
ORDER BY wi.created_at DESC;

-- 2. Verificar se as políticas RLS estão funcionando
-- (Este comando deve ser executado como um usuário específico)
SELECT 
  'Teste de isolamento - Usuário pode ver apenas suas próprias instâncias' as test_description,
  COUNT(*) as instances_visible
FROM whatsapp_instances
WHERE is_active = true;

-- 3. Verificar estatísticas gerais
SELECT 
  COUNT(*) as total_instances,
  COUNT(CASE WHEN status = 'connected' THEN 1 END) as connected_instances,
  COUNT(CASE WHEN status = 'disconnected' THEN 1 END) as disconnected_instances,
  COUNT(CASE WHEN status = 'qr_code' THEN 1 END) as qr_code_instances,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_instances
FROM whatsapp_instances;

-- 4. Verificar distribuição por usuário
SELECT 
  up.full_name,
  up.role,
  COUNT(wi.id) as instance_count,
  STRING_AGG(wi.instance_name, ', ') as instance_names
FROM user_profiles up
LEFT JOIN whatsapp_instances wi ON up.id = wi.user_id AND wi.is_active = true
GROUP BY up.id, up.full_name, up.role
ORDER BY up.role, up.full_name; 