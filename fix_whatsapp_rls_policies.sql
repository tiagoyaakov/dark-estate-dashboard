-- Corrigir políticas RLS para whatsapp_instances
-- Este script permite que gestores criem instâncias para outros usuários

-- 1. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Users can insert own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Users can update own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Users can delete own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Managers can view all instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Managers can manage all instances" ON whatsapp_instances;

-- 2. Criar políticas corretas para SELECT
CREATE POLICY "whatsapp_instances_select_policy" ON whatsapp_instances
    FOR SELECT USING (
        -- Usuários veem apenas suas próprias instâncias
        user_id = auth.uid()
        OR
        -- Gestores e admins veem todas as instâncias
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'gestor')
        )
    );

-- 3. Criar política para INSERT (permitir gestores criarem para outros)
CREATE POLICY "whatsapp_instances_insert_policy" ON whatsapp_instances
    FOR INSERT WITH CHECK (
        -- Gestores e admins podem criar instâncias
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'gestor')
        )
        OR
        -- Usuários podem criar apenas para si mesmos (se permitido)
        (user_id = auth.uid())
    );

-- 4. Criar política para UPDATE
CREATE POLICY "whatsapp_instances_update_policy" ON whatsapp_instances
    FOR UPDATE USING (
        -- Usuários podem atualizar suas próprias instâncias
        user_id = auth.uid()
        OR
        -- Gestores e admins podem atualizar qualquer instância
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'gestor')
        )
    );

-- 5. Criar política para DELETE
CREATE POLICY "whatsapp_instances_delete_policy" ON whatsapp_instances
    FOR DELETE USING (
        -- Usuários podem deletar suas próprias instâncias
        user_id = auth.uid()
        OR
        -- Gestores e admins podem deletar qualquer instância
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'gestor')
        )
    );

-- 6. Verificar se RLS está habilitado
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- 7. Testar as políticas
SELECT 
    'Políticas criadas com sucesso' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'whatsapp_instances';

-- 8. Verificar usuário atual e permissões
SELECT 
    'Usuário atual' as info,
    auth.uid() as current_user_id,
    up.full_name,
    up.email,
    up.role,
    CASE 
        WHEN up.role IN ('admin', 'gestor') THEN 'Pode criar instâncias para outros'
        ELSE 'Pode criar apenas para si mesmo'
    END as permissions
FROM user_profiles up 
WHERE up.id = auth.uid(); 