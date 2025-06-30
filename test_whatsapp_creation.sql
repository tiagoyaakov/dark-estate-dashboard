-- Teste para criar uma instância WhatsApp de exemplo
-- Execute este script após criar as tabelas

-- 1. Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'whatsapp%';

-- 2. Verificar usuário atual
SELECT auth.uid() as current_user_id;

-- 3. Criar uma instância de teste (substitua o user_id pelo UUID do seu usuário)
INSERT INTO whatsapp_instances (
    user_id, 
    instance_name, 
    phone_number, 
    status
) VALUES (
    auth.uid(),  -- Usuário atual
    'Teste WhatsApp',
    '+5511999999999',
    'disconnected'
);

-- 4. Verificar se foi criada
SELECT 
    id,
    user_id,
    instance_name,
    phone_number,
    status,
    webhook_url,
    created_at
FROM whatsapp_instances
ORDER BY created_at DESC;

-- 5. Teste de estatísticas
SELECT * FROM get_whatsapp_stats(auth.uid()); 