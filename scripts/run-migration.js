const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase (substitua pelas suas credenciais)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'sua-url-do-supabase';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sua-service-key';

// Criar cliente do Supabase com permissões de administrador
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração do banco de dados...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'database_migration_kanban_leads.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split('-- Step')
      .filter(cmd => cmd.trim().length > 0)
      .map(cmd => cmd.trim());
    
    console.log(`📋 Encontrados ${commands.length} comandos para executar`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.includes('SELECT') && command.includes('FROM information_schema')) {
        // Pular comandos de verificação que são apenas informativos
        console.log(`⏭️  Pulando comando de verificação ${i + 1}`);
        continue;
      }
      
      console.log(`🔄 Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command
        });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error);
          // Continuar com os próximos comandos mesmo se houver erro
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.error(`❌ Erro ao executar comando ${i + 1}:`, err.message);
      }
    }
    
    // Verificar se a migração foi bem-sucedida
    console.log('\n🔍 Verificando estrutura da tabela leads...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'leads')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('❌ Erro ao verificar estrutura da tabela:', tableError);
    } else {
      console.log('📊 Estrutura atual da tabela leads:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    // Verificar se há dados na tabela
    const { data: leadCount, error: countError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar leads:', countError);
    } else {
      console.log(`📈 Total de leads na tabela: ${leadCount?.length || 0}`);
    }
    
    console.log('\n🎉 Migração concluída!');
    console.log('💡 Agora você pode usar o sistema kanban integrado com o banco de dados.');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Função alternativa usando SQL direto (caso a função exec_sql não esteja disponível)
async function runMigrationDirect() {
  try {
    console.log('🚀 Iniciando migração direta...');
    
    // 1. Adicionar colunas à tabela leads
    console.log('🔄 Adicionando novas colunas...');
    
    const alterTableCommands = [
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Novo Lead';",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interest TEXT;",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2) DEFAULT 0;",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();"
    ];
    
    for (const cmd of alterTableCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: cmd });
      if (error) console.warn('⚠️ ', error.message);
    }
    
    // 2. Criar enum para estágios
    console.log('🔄 Criando enum para estágios...');
    const { error: enumError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DO $$ BEGIN
          CREATE TYPE lead_stage AS ENUM (
            'Novo Lead',
            'Qualificado', 
            'Visita Agendada',
            'Em Negociação',
            'Documentação',
            'Contrato',
            'Fechamento'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    });
    
    if (enumError) console.warn('⚠️ Enum já existe:', enumError.message);
    
    // 3. Migrar dados existentes
    console.log('🔄 Migrando dados existentes...');
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        interest: 'Imóvel residencial',
        estimated_value: 300000,
        notes: 'Lead migrado automaticamente'
      })
      .is('interest', null);
    
    if (updateError) console.warn('⚠️ Erro na migração de dados:', updateError.message);
    
    console.log('✅ Migração direta concluída!');
    
  } catch (error) {
    console.error('❌ Erro na migração direta:', error);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const isDirect = args.includes('--direct');

// Executar migração
if (isDirect) {
  runMigrationDirect();
} else {
  runMigration();
}

module.exports = { runMigration, runMigrationDirect }; 