-- ==================================================
-- SISTEMA DE GESTÃO DE USUÁRIOS E PERMISSÕES
-- ==================================================

-- 1. Criar tabela de perfis/roles de usuários
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('corretor', 'gestor', 'admin')) DEFAULT 'corretor',
  company_id UUID,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de empresas/imobiliárias
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  plan TEXT CHECK (plan IN ('basico', 'profissional', 'enterprise')) DEFAULT 'basico',
  max_users INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de instâncias WhatsApp por usuário
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  phone_number TEXT,
  profile_name TEXT,
  profile_pic_url TEXT,
  status TEXT CHECK (status IN ('connected', 'disconnected', 'connecting', 'qr_code', 'error')) DEFAULT 'disconnected',
  webhook_url TEXT,
  api_key TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  chat_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de conversas/chats
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  contact_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  tags TEXT[],
  lead_id UUID REFERENCES public.leads(id),
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  message_id TEXT, -- ID da mensagem no WhatsApp
  from_me BOOLEAN NOT NULL,
  contact_phone TEXT,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'location', 'contact')),
  content TEXT,
  media_url TEXT,
  caption TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Adicionar coluna user_id nas tabelas existentes para associar dados ao usuário
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id);
ALTER TABLE public.contract_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id);

-- 7. Adicionar coluna company_id nas tabelas existentes
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.contract_templates ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- ==================================================
-- TRIGGERS E FUNÇÕES
-- ==================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_whatsapp_instances_updated_at BEFORE UPDATE ON public.whatsapp_instances FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_whatsapp_chats_updated_at BEFORE UPDATE ON public.whatsapp_chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==================================================

-- Remover políticas antigas muito abertas
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can create properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can update properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can delete properties" ON public.properties;

-- Políticas para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Gestores can view all profiles in company" ON public.user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND up.company_id = user_profiles.company_id
  )
);

-- Políticas para companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company" ON public.companies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.company_id = companies.id
  )
);

-- Políticas para whatsapp_instances
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Corretores veem apenas suas instâncias
CREATE POLICY "Corretores can view own instances" ON public.whatsapp_instances
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND up.company_id = whatsapp_instances.company_id
  )
);

CREATE POLICY "Corretores can manage own instances" ON public.whatsapp_instances
FOR ALL USING (user_id = auth.uid());

-- Políticas para whatsapp_chats
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON public.whatsapp_chats
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.whatsapp_instances wi 
      WHERE wi.id = whatsapp_chats.instance_id 
      AND wi.company_id = up.company_id
    )
  )
);

CREATE POLICY "Users can manage own chats" ON public.whatsapp_chats
FOR ALL USING (user_id = auth.uid());

-- Políticas para whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.whatsapp_messages
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.whatsapp_instances wi 
      WHERE wi.id = whatsapp_messages.instance_id 
      AND wi.company_id = up.company_id
    )
  )
);

CREATE POLICY "Users can manage own messages" ON public.whatsapp_messages
FOR ALL USING (user_id = auth.uid());

-- Políticas atualizadas para properties (corretores veem apenas suas propriedades)
CREATE POLICY "Users can view own properties" ON public.properties
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND up.company_id = properties.company_id
  )
);

CREATE POLICY "Users can manage own properties" ON public.properties
FOR ALL USING (user_id = auth.uid());

-- Políticas similares para leads
CREATE POLICY "Users can view own leads" ON public.leads
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND up.company_id = leads.company_id
  )
);

CREATE POLICY "Users can manage own leads" ON public.leads
FOR ALL USING (user_id = auth.uid());

-- Políticas para contracts
CREATE POLICY "Users can view own contracts" ON public.contracts
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('gestor', 'admin')
    AND up.company_id = contracts.company_id
  )
);

CREATE POLICY "Users can manage own contracts" ON public.contracts
FOR ALL USING (user_id = auth.uid());

-- ==================================================
-- DADOS INICIAIS
-- ==================================================

-- Criar empresa padrão
INSERT INTO public.companies (id, name, plan, max_users)
VALUES (gen_random_uuid(), 'ImobiPro - Empresa Demo', 'enterprise', 50)
ON CONFLICT DO NOTHING;

-- ==================================================
-- FUNÇÕES AUXILIARES
-- ==================================================

-- Função para verificar se usuário é gestor
CREATE OR REPLACE FUNCTION public.is_manager(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_uuid 
    AND role IN ('gestor', 'admin')
  );
END;
$$ language plpgsql security definer;

-- Função para obter empresa do usuário
CREATE OR REPLACE FUNCTION public.get_user_company(user_uuid UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
  company_uuid UUID;
BEGIN
  SELECT company_id INTO company_uuid 
  FROM public.user_profiles 
  WHERE id = user_uuid;
  
  RETURN company_uuid;
END;
$$ language plpgsql security definer;

-- Comentários
COMMENT ON TABLE public.user_profiles IS 'Perfis e roles dos usuários do sistema';
COMMENT ON TABLE public.companies IS 'Empresas/imobiliárias que usam o sistema';
COMMENT ON TABLE public.whatsapp_instances IS 'Instâncias WhatsApp por usuário';
COMMENT ON TABLE public.whatsapp_chats IS 'Conversas WhatsApp de cada usuário';
COMMENT ON TABLE public.whatsapp_messages IS 'Mensagens dos chats WhatsApp'; 