
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
      addDiagnostic('🔧 Iniciando verificação das colunas...');
      
      // Verificar se as colunas já são do tipo TEXT
      addDiagnostic('📝 Verificando tipo atual das colunas...');
      
      // Como não podemos executar SQL diretamente, vamos tentar inserir dados com IDs de texto
      // Se funcionar, significa que a migração já foi aplicada ou não é necessária
      
      const testId = "TEST_" + Date.now().toString();
      
      addDiagnostic('🧪 Testando inserção com ID de texto...');
      
      const { data: testProperty, error: insertError } = await supabase
        .from('properties')
        .insert({
          id: testId,
          title: "Teste Migração",
          type: "house" as const,
          price: 100000,
          area: 100,
          address: "Teste",
          city: "Teste",
          state: "Teste",
          status: "available" as const,
        })
        .select()
        .single();

      if (insertError) {
        addDiagnostic(`❌ Erro ao inserir com ID texto: ${insertError.message}`);
        
        if (insertError.message.includes('invalid input syntax for type uuid')) {
          addDiagnostic('🔍 Confirmado: colunas ainda são UUID, migração necessária');
          addDiagnostic('⚠️ A migração precisa ser aplicada no Supabase Dashboard');
          addDiagnostic('📋 Comandos SQL necessários:');
          addDiagnostic('1. ALTER TABLE properties ALTER COLUMN id TYPE TEXT USING id::TEXT;');
          addDiagnostic('2. ALTER TABLE property_images ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;');
          addDiagnostic('3. ALTER TABLE leads ALTER COLUMN property_id TYPE TEXT USING property_id::TEXT;');
          
          toast({
            title: "Migração Necessária",
            description: "Execute os comandos SQL no Supabase Dashboard para converter UUID para TEXT.",
            variant: "destructive",
          });
        } else {
          throw insertError;
        }
      } else {
        addDiagnostic('✅ Sucesso! ID de texto aceito - colunas já são TEXT');
        
        // Limpar o dado de teste
        await supabase.from('properties').delete().eq('id', testId);
        addDiagnostic('🧹 Dado de teste removido');
        
        addDiagnostic('🎉 As colunas já estão configuradas como TEXT!');
        toast({
          title: "Migração Completa",
          description: "As colunas já estão configuradas para aceitar IDs de texto.",
        });
      }

    } catch (error: any) {
      addDiagnostic(`💥 Erro na verificação: ${error.message}`);
      console.error('💥 Erro completo:', error);
      toast({
        title: "Erro na Verificação",
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
            {loading ? "Verificando..." : "Verificar Migração"}
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
          <p>• <strong>Verificar Migração:</strong> Testa se as colunas aceitam IDs de texto</p>
          <p>• <strong>Testar Conexão:</strong> Verifica conectividade e exibe logs detalhados</p>
          <p>• <strong>Inserir Dados:</strong> Adiciona propriedades de exemplo</p>
          <p>• <strong>Limpar Dados:</strong> Remove todas as propriedades</p>
        </div>
      </CardContent>
    </Card>
  );
}
