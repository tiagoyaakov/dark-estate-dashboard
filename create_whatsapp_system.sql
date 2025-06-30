-- Criar sistema completo de WhatsApp com isolamento por usuário
-- Tabelas para gerenciar instâncias, chats e mensagens WhatsApp

-- 1. Tabela de instâncias WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instance_name TEXT NOT NULL,
    phone_number TEXT,
    profile_name TEXT,
    profile_pic_url TEXT,
    status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'qr_code', 'error')),
    webhook_url TEXT,
    api_key TEXT,
    last_seen TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    chat_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constrains
    UNIQUE(user_id, instance_name),
    UNIQUE(instance_name)
);

-- 2. Tabela de chats WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id UUID NOT NULL REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_phone TEXT NOT NULL,
    contact_name TEXT,
    contact_avatar TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    tags TEXT[],
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constrains
    UNIQUE(instance_id, contact_phone)
);

-- 3. Tabela de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
    instance_id UUID NOT NULL REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id TEXT,
    from_me BOOLEAN NOT NULL DEFAULT false,
    contact_phone TEXT,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'location', 'contact')),
    content TEXT,
    media_url TEXT,
    caption TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_id ON whatsapp_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status ON whatsapp_instances(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_active ON whatsapp_instances(is_active);

CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_instance_id ON whatsapp_chats(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_user_id ON whatsapp_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_contact_phone ON whatsapp_chats(contact_phone);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_chat_id ON whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_instance_id ON whatsapp_messages(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);

-- 5. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_instances_updated_at BEFORE UPDATE ON whatsapp_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_chats_updated_at BEFORE UPDATE ON whatsapp_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Políticas RLS (Row Level Security)
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_instances
CREATE POLICY "Users can view own instances" ON whatsapp_instances
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view all company instances" ON whatsapp_instances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('gestor', 'admin')
        )
    );

CREATE POLICY "Users can create own instances" ON whatsapp_instances
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own instances" ON whatsapp_instances
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own instances" ON whatsapp_instances
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para whatsapp_chats
CREATE POLICY "Users can view own chats" ON whatsapp_chats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view all company chats" ON whatsapp_chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('gestor', 'admin')
        )
    );

CREATE POLICY "Users can manage own chats" ON whatsapp_chats
    FOR ALL USING (user_id = auth.uid());

-- Políticas para whatsapp_messages
CREATE POLICY "Users can view own messages" ON whatsapp_messages
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view all company messages" ON whatsapp_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('gestor', 'admin')
        )
    );

CREATE POLICY "Users can manage own messages" ON whatsapp_messages
    FOR ALL USING (user_id = auth.uid());

-- 7. Função para estatísticas
CREATE OR REPLACE FUNCTION get_whatsapp_stats(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    total_instances INTEGER,
    connected_instances INTEGER,
    total_chats INTEGER,
    total_messages INTEGER,
    unread_messages INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT wi.id)::INTEGER as total_instances,
        COUNT(DISTINCT CASE WHEN wi.status = 'connected' THEN wi.id END)::INTEGER as connected_instances,
        COUNT(DISTINCT wc.id)::INTEGER as total_chats,
        COUNT(DISTINCT wm.id)::INTEGER as total_messages,
        COALESCE(SUM(wc.unread_count), 0)::INTEGER as unread_messages
    FROM whatsapp_instances wi
    LEFT JOIN whatsapp_chats wc ON wi.id = wc.instance_id
    LEFT JOIN whatsapp_messages wm ON wc.id = wm.chat_id
    WHERE (user_id_param IS NULL OR wi.user_id = user_id_param)
    AND wi.is_active = true;
END;
$$ LANGUAGE plpgsql; 