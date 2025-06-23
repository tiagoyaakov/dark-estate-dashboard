-- Migração: Adicionar campo template_type na tabela contract_templates
-- Data: $(date)
-- Objetivo: Permitir classificar templates como "Locação" ou "Venda"

-- 1. Adicionar coluna template_type
ALTER TABLE public.contract_templates 
ADD COLUMN IF NOT EXISTS template_type varchar(20) 
CHECK (template_type IN ('Locação', 'Venda')) 
DEFAULT 'Locação';

-- 2. Atualizar registros existentes (se houver) para 'Locação' por padrão
UPDATE public.contract_templates 
SET template_type = 'Locação' 
WHERE template_type IS NULL;

-- 3. Comentário para documentar o campo
COMMENT ON COLUMN public.contract_templates.template_type IS 'Tipo do template de contrato: Locação ou Venda';

-- 4. Criar índice para melhor performance nas consultas por tipo
CREATE INDEX IF NOT EXISTS idx_contract_templates_type 
ON public.contract_templates (template_type) 
WHERE is_active = true;

-- Verificação: Listar estrutura da tabela atualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'contract_templates' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 