-- Habilitar menu Conexões para corretores
-- Permite que cada corretor gerencie suas próprias conexões WhatsApp

UPDATE role_permissions 
SET is_enabled = true 
WHERE role = 'corretor' 
AND permission_key = 'menu_connections';

-- Verificar se a atualização funcionou
SELECT 
    role,
    permission_key,
    permission_name,
    is_enabled
FROM role_permissions 
WHERE permission_key = 'menu_connections'
ORDER BY role; 