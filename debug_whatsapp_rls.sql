-- Script para debugar problemas RLS nas instâncias WhatsApp

-- 1. Verificar usuário atual
SELECT 
    'Usuário atual logado' as info,
    auth.uid() as current_user_id;

-- 2. Verificar perfil do usuário atual
SELECT 
    'Perfil do usuário atual' as info,
    up.*
FROM user_profiles up 
WHERE up.id = auth.uid();

-- 3. Verificar se RLS está habilitado
SELECT 
    'Status RLS' as info,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'whatsapp_instances';

-- 4. Listar todas as políticas RLS da tabela
SELECT 
    'Políticas RLS existentes' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'whatsapp_instances';

-- 5. Testar permissões de SELECT
SELECT 
    'Teste SELECT' as info,
    COUNT(*) as instances_visible
FROM whatsapp_instances;

-- 6. Verificar se consegue inserir uma instância de teste (só para verificar)
-- CUIDADO: Este é apenas um teste - remova depois se inserir
/*
INSERT INTO whatsapp_instances (
    user_id,
    instance_name,
    phone_number,
    status,
    is_active
) VALUES (
    auth.uid(),
    'TESTE_DEBUG_' || extract(epoch from now()),
    '+55 11 99999-9999',
    'disconnected',
    true
) RETURNING id, user_id, instance_name;
*/

-- 7. Verificar se existe a função de verificação de role
SELECT 
    'Funções disponíveis' as info,
    proname as function_name
FROM pg_proc 
WHERE proname LIKE '%manager%' OR proname LIKE '%admin%';

-- 8. Testar consulta que as políticas usam
SELECT 
    'Teste consulta role' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'gestor')
        ) THEN 'É gestor/admin'
        ELSE 'NÃO é gestor/admin'
    END as user_role_check; 