-- Script para testar o sistema de atribuição de instâncias WhatsApp

-- 1. Verificar estrutura das tabelas
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'whatsapp_instances' as table_name, COUNT(*) as count FROM whatsapp_instances;

-- 2. Listar usuários disponíveis para atribuição
SELECT 
  up.id,
  up.full_name,
  up.email,
  up.role,
  COUNT(wi.id) as instances_count
FROM user_profiles up
LEFT JOIN whatsapp_instances wi ON up.id = wi.user_id AND wi.is_active = true
GROUP BY up.id, up.full_name, up.email, up.role
ORDER BY up.role DESC, up.full_name;

-- 3. Verificar instâncias existentes
SELECT 
  wi.id,
  wi.instance_name,
  wi.status,
  up.full_name as owner_name,
  up.role as owner_role
FROM whatsapp_instances wi
JOIN user_profiles up ON wi.user_id = up.id
WHERE wi.is_active = true
ORDER BY wi.created_at DESC; 