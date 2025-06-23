# 🚀 Guia de Migração - Sistema Kanban de Leads

Este guia irá ajudá-lo a migrar sua tabela de leads para funcionar perfeitamente com o sistema kanban integrado.

## 📋 Pré-requisitos

1. **Acesso ao Supabase**: Você precisa ter acesso ao painel do Supabase
2. **Credenciais de Service Role**: Chave de service role do Supabase
3. **Node.js**: Versão 16 ou superior instalada

## 🛠️ Opções de Migração

### Opção 1: Migração via SQL Editor (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Entre no seu projeto
   - Navegue até **SQL Editor**

2. **Execute a Migração**
   - Copie todo o conteúdo do arquivo `database_migration_kanban_leads.sql`
   - Cole no SQL Editor do Supabase
   - Clique em **Run** para executar

3. **Verifique a Migração**
   - Vá para **Table Editor**
   - Abra a tabela `leads`
   - Confirme que as novas colunas foram adicionadas:
     - `stage` (enum)
     - `interest` (text)
     - `estimated_value` (decimal)
     - `notes` (text)
     - `updated_at` (timestamp)

### Opção 2: Migração via Script Node.js

1. **Configure as Variáveis de Ambiente**
   ```bash
   # No arquivo .env
   VITE_SUPABASE_URL=sua-url-do-supabase
   SUPABASE_SERVICE_ROLE_KEY=sua-service-key
   ```

2. **Instale Dependências**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Execute o Script**
   ```bash
   # Migração completa
   node scripts/run-migration.js
   
   # Ou migração direta (mais simples)
   node scripts/run-migration.js --direct
   ```

## 🔍 Verificação Pós-Migração

Após executar a migração, verifique se tudo está funcionando:

### 1. Estrutura da Tabela
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leads' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 2. Dados de Exemplo
```sql
SELECT id, name, email, stage, interest, estimated_value 
FROM public.leads 
LIMIT 5;
```

### 3. Enum de Estágios
```sql
SELECT unnest(enum_range(NULL::lead_stage)) as stage;
```

## 🎯 Funcionalidades Após a Migração

### ✅ Sistema Kanban Funcional
- **Arrastar e Soltar**: Mova leads entre estágios
- **Sincronização em Tempo Real**: Mudanças refletem instantaneamente
- **Estatísticas Dinâmicas**: Contadores e valores atualizados automaticamente

### ✅ Novos Campos Disponíveis
- **Stage**: Estágio atual do lead no funil
- **Interest**: Tipo de imóvel de interesse
- **Estimated Value**: Valor estimado do negócio
- **Notes**: Observações e anotações
- **Updated At**: Timestamp da última atualização

### ✅ Funcionalidades Avançadas
- **Filtros por Estágio**: Visualize leads por categoria
- **Estatísticas por Estágio**: Métricas detalhadas
- **Histórico de Mudanças**: Rastreamento de alterações
- **Performance Otimizada**: Índices para consultas rápidas

## 🔧 Solução de Problemas

### Erro: "Column already exists"
```sql
-- Se alguma coluna já existir, você pode pular essa etapa
-- O script usa IF NOT EXISTS para evitar conflitos
```

### Erro: "Type already exists"
```sql
-- Se o enum já existir:
DROP TYPE IF EXISTS lead_stage CASCADE;
-- Então execute novamente a criação do enum
```

### Erro: "Permission denied"
```sql
-- Certifique-se de estar usando a service role key
-- Não a anon key pública
```

### Dados Não Aparecem no Kanban
1. Verifique se os leads têm valores válidos no campo `stage`
2. Confirme se o campo `interest` não está vazio
3. Verifique se o campo `estimated_value` tem valores numéricos

## 📊 Estrutura Final da Tabela

Após a migração, sua tabela `leads` terá esta estrutura:

```sql
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    property_id UUID REFERENCES public.properties(id),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Novos campos para kanban
    stage lead_stage DEFAULT 'Novo Lead',
    interest TEXT,
    estimated_value DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎉 Próximos Passos

1. **Teste o Sistema**: Acesse a interface e teste o drag & drop
2. **Adicione Leads**: Crie novos leads pelo sistema
3. **Configure Automações**: Configure triggers personalizados se necessário
4. **Treine a Equipe**: Mostre as novas funcionalidades para sua equipe

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs do console do navegador
2. Confirme as credenciais do Supabase
3. Teste a conexão com o banco de dados
4. Verifique as permissões RLS (Row Level Security)

---

**🎯 Resultado Final**: Um sistema kanban totalmente funcional e sincronizado com seu banco de dados, permitindo gestão visual e eficiente do seu pipeline de vendas! 