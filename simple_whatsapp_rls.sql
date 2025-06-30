-- Políticas RLS simplificadas para whatsapp_instances
-- Versão mais permissiva para resolver o problema

-- 1. Desabilitar RLS temporariamente para limpeza
ALTER TABLE whatsapp_instances DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "whatsapp_instances_select_policy" ON whatsapp_instances;
DROP POLICY IF EXISTS "whatsapp_instances_insert_policy" ON whatsapp_instances;
DROP POLICY IF EXISTS "whatsapp_instances_update_policy" ON whatsapp_instances;
DROP POLICY IF EXISTS "whatsapp_instances_delete_policy" ON whatsapp_instances;

-- Remover outras políticas que podem existir
DROP POLICY IF EXISTS "Users can view own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Users can insert own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Users can update own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Users can delete own instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Managers can view all instances" ON whatsapp_instances;
DROP POLICY IF EXISTS "Managers can manage all instances" ON whatsapp_instances;

-- 3. Criar políticas simples e funcionais

-- Política para SELECT (visualizar)
CREATE POLICY "whatsapp_select" ON whatsapp_instances
    FOR SELECT 
    TO authenticated
    USING (
        user_id = auth.uid()
        OR 
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE role IN ('admin', 'gestor')
        )
    );

-- Política para INSERT (criar) - Mais permissiva
CREATE POLICY "whatsapp_insert" ON whatsapp_instances
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE role IN ('admin', 'gestor')
        )
    );

-- Política para UPDATE (atualizar)
CREATE POLICY "whatsapp_update" ON whatsapp_instances
    FOR UPDATE 
    TO authenticated
    USING (
        user_id = auth.uid()
        OR 
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE role IN ('admin', 'gestor')
        )
    )
    WITH CHECK (
        user_id = auth.uid()
        OR 
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE role IN ('admin', 'gestor')
        )
    );

-- Política para DELETE (deletar)
CREATE POLICY "whatsapp_delete" ON whatsapp_instances
    FOR DELETE 
    TO authenticated
    USING (
        user_id = auth.uid()
        OR 
        auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE role IN ('admin', 'gestor')
        )
    );

-- 4. Habilitar RLS novamente
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as políticas foram criadas
SELECT 
    'Políticas criadas' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'whatsapp_instances'
ORDER BY policyname;

-- 6. Teste final
SELECT 
    'Teste de permissões' as info,
    CASE 
        WHEN auth.uid() IN (
            SELECT id FROM user_profiles 
            WHERE role IN ('admin', 'gestor')
        ) THEN 'PODE criar instâncias'
        ELSE 'NÃO PODE criar instâncias'
    END as can_create; 