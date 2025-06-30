-- Script para remover a obrigatoriedade de empresa no sistema
-- Execute no dashboard do Supabase -> SQL Editor

-- 1. Tornar company_id opcional (nullable) na tabela user_profiles
ALTER TABLE user_profiles 
ALTER COLUMN company_id DROP NOT NULL;

-- 2. Remover constraint de foreign key se existir (pode dar erro se não existir, é normal)
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_company_id_fkey;

-- 3. Atualizar usuários existentes que não tem company_id
UPDATE user_profiles 
SET company_id = NULL 
WHERE company_id = '';

-- 4. Verificar se existem profiles sem company_id (deve funcionar normalmente)
SELECT id, email, full_name, role, company_id, is_active 
FROM user_profiles 
WHERE company_id IS NULL 
LIMIT 5;

-- 5. Confirmar que o sistema está funcionando
SELECT 
  COUNT(*) as total_users,
  COUNT(company_id) as users_with_company,
  COUNT(*) - COUNT(company_id) as users_without_company
FROM user_profiles; 