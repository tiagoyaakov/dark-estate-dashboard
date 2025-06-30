-- ==================================================
-- CORREÇÃO DAS POLÍTICAS RLS - ELIMINAR RECURSÃO INFINITA
-- ==================================================

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Gestores can view all profiles in company" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own company" ON public.companies;

DROP POLICY IF EXISTS "Corretores can view own instances" ON public.whatsapp_instances;
DROP POLICY IF EXISTS "Corretores can manage own instances" ON public.whatsapp_instances;

DROP POLICY IF EXISTS "Users can view own chats" ON public.whatsapp_chats;
DROP POLICY IF EXISTS "Users can manage own chats" ON public.whatsapp_chats;

DROP POLICY IF EXISTS "Users can view own messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Users can manage own messages" ON public.whatsapp_messages;

DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can manage own properties" ON public.properties;

DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can manage own leads" ON public.leads;

DROP POLICY IF EXISTS "Users can view own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can manage own contracts" ON public.contracts;

-- 2. CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR ROLE SEM RECURSÃO
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Buscar o role diretamente do auth.users usando raw_user_meta_data
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'corretor'
  ) INTO user_role;
  
  -- Se não encontrar no metadata, buscar na tabela sem causar recursão
  IF user_role IS NULL OR user_role = '' THEN
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = auth.uid()
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(user_role, 'corretor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO PARA OBTER COMPANY_ID SEM RECURSÃO
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
DECLARE
  company_uuid UUID;
BEGIN
  SELECT company_id INTO company_uuid 
  FROM public.user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. POLÍTICAS SIMPLES PARA USER_PROFILES (SEM RECURSÃO)
CREATE POLICY "Enable all for authenticated users" ON public.user_profiles
FOR ALL USING (auth.role() = 'authenticated');

-- 5. POLÍTICAS SIMPLES PARA COMPANIES
CREATE POLICY "Enable all for authenticated users" ON public.companies
FOR ALL USING (auth.role() = 'authenticated');

-- 6. POLÍTICAS PARA WHATSAPP_INSTANCES (SEM RECURSÃO)
CREATE POLICY "Users can view own instances or all if manager" ON public.whatsapp_instances
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can insert own instances" ON public.whatsapp_instances
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own instances or all if manager" ON public.whatsapp_instances
FOR UPDATE USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can delete own instances or all if manager" ON public.whatsapp_instances
FOR DELETE USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

-- 7. POLÍTICAS PARA WHATSAPP_CHATS
CREATE POLICY "Users can view own chats or all if manager" ON public.whatsapp_chats
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can manage own chats" ON public.whatsapp_chats
FOR ALL USING (user_id = auth.uid());

-- 8. POLÍTICAS PARA WHATSAPP_MESSAGES
CREATE POLICY "Users can view own messages or all if manager" ON public.whatsapp_messages
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can manage own messages" ON public.whatsapp_messages
FOR ALL USING (user_id = auth.uid());

-- 9. POLÍTICAS PARA PROPERTIES
CREATE POLICY "Users can view own properties or all if manager" ON public.properties
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can manage own properties" ON public.properties
FOR ALL USING (user_id = auth.uid());

-- 10. POLÍTICAS PARA LEADS
CREATE POLICY "Users can view own leads or all if manager" ON public.leads
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can manage own leads" ON public.leads
FOR ALL USING (user_id = auth.uid());

-- 11. POLÍTICAS PARA CONTRACTS
CREATE POLICY "Users can view own contracts or all if manager" ON public.contracts
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role() IN ('gestor', 'admin')
);

CREATE POLICY "Users can manage own contracts" ON public.contracts
FOR ALL USING (user_id = auth.uid());

-- 12. ATUALIZAR A FUNÇÃO DE CRIAÇÃO DE USUÁRIO PARA INCLUIR ROLE NO METADATA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir o perfil
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'corretor')
  );
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- 13. GARANTIR QUE AS TABELAS TENHAM RLS HABILITADO
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- 14. COMENTÁRIOS
COMMENT ON FUNCTION public.get_user_role() IS 'Obtém o role do usuário sem causar recursão nas políticas RLS';
COMMENT ON FUNCTION public.get_user_company_id() IS 'Obtém o company_id do usuário sem causar recursão nas políticas RLS';

-- 15. TESTE DAS FUNÇÕES
SELECT 'Função get_user_role criada com sucesso' as status; 