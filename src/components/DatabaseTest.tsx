
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Trash2, AlertCircle, Wrench } from "lucide-react";

export function DatabaseTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const addDiagnostic = (message: string) => {
    setDiagnostics(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runMigration = async () => {
    setLoading(true);
    setDiagnostics([]);
    
    try {
      addDiagnostic('🔧 Iniciando migração do banco de dados...');
      
      // 1. Alterar tipo da coluna id na tabela properties
      addDiagnostic('📝 Alterando tipo da coluna id na tabela properties...');
      const { error: error1 } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.properties ALTER COLUMN id TYPE TEXT USING id::TEXT;'
      });
      
      if (error1) {
        addDiagnostic(`❌ Erro step 1: ${error1.message}`);
        throw error1;
      }
      addDiagnostic('✅ Coluna properties.id alterada para TEXT');

      // 2. Alterar tipo da coluna property_id na tabela property_images
      addDiagnostic('📝 Alterando property_images.property_id...');
      const { error: error2 } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.property_images ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;'
      });
      
      if (error2) {
        addDiagnostic(`❌ Erro step 2: ${error2.message}`);
        throw error2;
      }
      addDiagnostic('✅ Coluna property_images.property_id alterada para TEXT');

      // 3. Recriar foreign key constraint para property_images
      addDiagnostic('📝 Recriando constraint property_images...');
      const { error: error3 } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.property_images 
          DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;
          
          ALTER TABLE public.property_images 
          ADD CONSTRAINT property_images_property_id_fkey 
          FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
        `
      });
      
      if (error3) {
        addDiagnostic(`❌ Erro step 3: ${error3.message}`);
        throw error3;
      }
      addDiagnostic('✅ Constraint property_images recriada');

      // 4. Alterar tipo da coluna property_id na tabela leads
      addDiagnostic('📝 Alterando leads.property_id...');
      const { error: error4 } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.leads ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;'
      });
      
      if (error4) {
        addDiagnostic(`❌ Erro step 4: ${error4.message}`);
        throw error4;
      }
      addDiagnostic('✅ Coluna leads.property_id alterada para TEXT');

      // 5. Recriar foreign key constraint para leads
      addDiagnostic('📝 Recriando constraint leads...');
      const { error: error5 } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.leads 
          DROP CONSTRAINT IF EXISTS leads_property_id_fkey;
          
          ALTER TABLE public.leads 
          ADD CONSTRAINT leads_property_id_fkey 
          FOREIGN KEY (property_id) REFERENCES public.properties(id);
        `
      });
      
      if (error5) {
        addDiagnostic(`❌ Erro step 5: ${error5.message}`);
        throw error5;
      }
      addDiagnostic('✅ Constraint leads recriada');

      addDiagnostic('🎉 Migração concluída com sucesso!');
      toast({
        title: "Migração Concluída",
        description: "Todas as tabelas foram alteradas para usar TEXT ao invés de UUID.",
      });

    } catch (error: any) {
      addDiagnostic(`💥 Erro na migração: ${error.message}`);
      console.error('💥 Erro completo:', error);
      toast({
        title: "Erro na Migração",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setDiagnostics([]);
    
    try {
      addDiagnostic('🔍 Iniciando teste de conexão...');
      addDiagnostic('📡 Testando conectividade com o Supabase...');
      
      // Teste simples de conectividade
      const { data, error, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        addDiagnostic(`❌ Erro: ${error.message}`);
        addDiagnostic(`💡 Hint: ${error.hint || 'Sem dicas adicionais'}`);
        addDiagnostic(`🔧 Código: ${error.code || 'Sem código'}`);
        addDiagnostic(`📊 Details: ${JSON.stringify(error.details || {})}`);
        
        toast({
          title: "Erro de Conexão",
          description: `${error.message}. Verifique as configurações do Supabase.`,
          variant: "destructive",
        });
        
        throw error;
      }

      addDiagnostic(`✅ Conexão bem-sucedida!`);
      addDiagnostic(`📊 Total de propriedades: ${count || 0}`);
      addDiagnostic(`📋 Dados retornados: ${data?.length || 0} registros`);
      
      toast({
        title: "Conexão OK!",
        description: `Conectado com sucesso. ${count || 0} propriedades encontradas.`,
      });

    } catch (error: any) {
      addDiagnostic(`💥 Erro capturado: ${error.message}`);
      console.error('💥 Erro completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertSampleData = async () => {
    setLoading(true);
    try {
      addDiagnostic('🏗️ Inserindo dados de exemplo...');
      
      const sampleProperties = [
        {
          id: "CASA001",
          title: "Casa Moderna em Condomínio",
          type: "house" as const,
          price: 850000,
          area: 250,
          bedrooms: 4,
          bathrooms: 3,
          address: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          status: "available" as const,
          description: "Linda casa moderna com acabamento de primeira qualidade."
        },
        {
          id: "APT001",
          title: "Apartamento no Centro",
          type: "apartment" as const,
          price: 450000,
          area: 85,
          bedrooms: 2,
          bathrooms: 2,
          address: "Av. Paulista, 1000",
          city: "São Paulo",
          state: "SP",
          status: "available" as const,
          description: "Apartamento bem localizado próximo ao metrô."
        }
      ];

      const { data, error } = await supabase
        .from('properties')
        .insert(sampleProperties)
        .select();

      if (error) {
        addDiagnostic(`❌ Erro ao inserir: ${error.message}`);
        throw error;
      }

      addDiagnostic(`✅ ${data.length} propriedades inseridas com sucesso`);
      toast({
        title: "Sucesso!",
        description: `${data.length} propriedades de exemplo foram adicionadas.`,
      });

    } catch (error: any) {
      addDiagnostic(`💥 Erro: ${error.message}`);
      toast({
        title: "Erro",
        description: "Erro ao inserir dados de exemplo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    try {
      addDiagnostic('🗑️ Limpando todos os dados...');
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        addDiagnostic(`❌ Erro ao limpar: ${error.message}`);
        throw error;
      }

      addDiagnostic('✅ Dados limpos com sucesso');
      toast({
        title: "Sucesso!",
        description: "Todos os dados foram removidos.",
      });

    } catch (error: any) {
      addDiagnostic(`💥 Erro: ${error.message}`);
      toast({
        title: "Erro",
        description: "Erro ao limpar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnóstico do Banco de Dados
          {diagnostics.length > 0 && (
            <AlertCircle className="h-4 w-4 text-yellow-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={runMigration}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Wrench className="h-4 w-4 mr-2" />
            {loading ? "Migrando..." : "Rodar Migração"}
          </Button>
          
          <Button
            onClick={testConnection}
            disabled={loading}
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            {loading ? "Testando..." : "Testar Conexão"}
          </Button>
          
          <Button
            onClick={insertSampleData}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Inserindo..." : "Inserir Dados"}
          </Button>
          
          <Button
            onClick={clearAllData}
            disabled={loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {loading ? "Limpando..." : "Limpar Dados"}
          </Button>
        </div>

        {diagnostics.length > 0 && (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
            <h4 className="text-white font-medium mb-2">📋 Log de Diagnóstico:</h4>
            <div className="text-sm text-gray-300 space-y-1 max-h-60 overflow-y-auto">
              {diagnostics.map((msg, idx) => (
                <div key={idx} className="font-mono">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-400">
          <p>• <strong>Rodar Migração:</strong> Converte colunas UUID para TEXT</p>
          <p>• <strong>Testar Conexão:</strong> Verifica conectividade e exibe logs detalhados</p>
          <p>• <strong>Inserir Dados:</strong> Adiciona propriedades de exemplo</p>
          <p>• <strong>Limpar Dados:</strong> Remove todas as propriedades</p>
        </div>
      </CardContent>
    </Card>
  );
}
