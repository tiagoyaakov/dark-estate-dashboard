-- Teste direto de criação de instância WhatsApp
-- Execute este script para testar se consegue criar uma instância

-- 1. Verificar usuário atual e suas permissões
SELECT 
    'Informações do usuário' as test,
    auth.uid() as user_id,
    up.full_name,
    up.email,
    up.role,
    CASE 
        WHEN up.role IN ('admin', 'gestor') THEN 'SIM'
        ELSE 'NÃO'
    END as pode_criar_instancias
FROM user_profiles up 
WHERE up.id = auth.uid();

-- 2. Verificar se RLS está funcionando
SELECT 
    'Status RLS' as test,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'whatsapp_instances';

-- 3. Listar políticas ativas
SELECT 
    'Políticas ativas' as test,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'whatsapp_instances';

-- 4. Tentar criar uma instância de teste
-- ATENÇÃO: Só execute se for um usuário gestor/admin
DO $$
DECLARE
    test_instance_id uuid;
    current_user_role text;
BEGIN
    -- Verificar role do usuário
    SELECT role INTO current_user_role 
    FROM user_profiles 
    WHERE id = auth.uid();
    
    IF current_user_role IN ('admin', 'gestor') THEN
        BEGIN
            INSERT INTO whatsapp_instances (
                user_id,
                instance_name,
                phone_number,
                webhook_url,
                status,
                is_active
            ) VALUES (
                auth.uid(), -- Para si mesmo primeiro
                'TESTE_SQL_' || extract(epoch from now())::text,
                '+55 11 98765-4321',
                'https://webhook.test/teste',
                'disconnected',
                true
            ) RETURNING id INTO test_instance_id;
            
            RAISE NOTICE 'SUCESSO: Instância criada com ID: %', test_instance_id;
            
            -- Deletar o teste
            DELETE FROM whatsapp_instances WHERE id = test_instance_id;
            RAISE NOTICE 'Instância de teste removida';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERRO ao criar instância: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Usuário % não é gestor/admin (role: %)', auth.uid(), current_user_role;
    END IF;
END $$;

-- 5. Verificar instâncias existentes (se conseguir ver)
SELECT 
    'Instâncias visíveis' as test,
    COUNT(*) as total_instances
FROM whatsapp_instances;

-- 6. Se tiver erro, mostrar informações detalhadas para debug
SELECT 
    'Debug final' as test,
    auth.uid() as current_user,
    (SELECT role FROM user_profiles WHERE id = auth.uid()) as user_role,
    (SELECT COUNT(*) FROM whatsapp_instances) as visible_instances; 