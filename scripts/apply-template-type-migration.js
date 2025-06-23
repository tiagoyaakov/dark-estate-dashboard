const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Iniciando migração do template_type...');
  
  try {
    // 1. Verificar se a coluna já existe
    console.log('🔍 Verificando estrutura atual da tabela...');
    
    const { data: columns, error: columnError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT column_name FROM information_schema.columns 
              WHERE table_name = 'contract_templates' 
              AND table_schema = 'public' 
              AND column_name = 'template_type'`
      });

    if (columnError) {
      console.error('❌ Erro ao verificar colunas:', columnError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Coluna template_type já existe!');
      return;
    }

    // 2. Aplicar migração
    console.log('📝 Aplicando migração...');
    
    const migrationSQL = `
      -- Adicionar coluna template_type
      ALTER TABLE public.contract_templates 
      ADD COLUMN template_type varchar(20) 
      CHECK (template_type IN ('Locação', 'Venda')) 
      DEFAULT 'Locação';

      -- Atualizar registros existentes
      UPDATE public.contract_templates 
      SET template_type = 'Locação' 
      WHERE template_type IS NULL;

      -- Comentário
      COMMENT ON COLUMN public.contract_templates.template_type IS 'Tipo do template de contrato: Locação ou Venda';

      -- Índice
      CREATE INDEX IF NOT EXISTS idx_contract_templates_type 
      ON public.contract_templates (template_type) 
      WHERE is_active = true;
    `;

    const { error: migrationError } = await supabase
      .rpc('exec_sql', { sql: migrationSQL });

    if (migrationError) {
      console.error('❌ Erro na migração:', migrationError);
      return;
    }

    console.log('✅ Migração aplicada com sucesso!');

    // 3. Verificar resultado
    console.log('🔍 Verificando estrutura final...');
    
    const { data: finalColumns, error: finalError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT column_name, data_type, is_nullable, column_default 
              FROM information_schema.columns 
              WHERE table_name = 'contract_templates' 
              AND table_schema = 'public'
              ORDER BY ordinal_position`
      });

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
      return;
    }

    console.log('📊 Estrutura da tabela contract_templates:');
    console.table(finalColumns);

  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar migração
applyMigration()
  .then(() => {
    console.log('🎉 Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  }); 