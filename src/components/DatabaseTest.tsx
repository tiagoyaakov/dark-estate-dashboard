
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Trash2 } from "lucide-react";

export function DatabaseTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const insertSampleData = async () => {
    setLoading(true);
    try {
      console.log('🏗️ Inserindo dados de exemplo...');
      
      const sampleProperties = [
        {
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
        },
        {
          title: "Terreno Comercial",
          type: "land" as const,
          price: 1200000,
          area: 500,
          bedrooms: null,
          bathrooms: null,
          address: "Rua Comercial, 456",
          city: "São Paulo",
          state: "SP",
          status: "available" as const,
          description: "Excelente terreno para investimento comercial."
        }
      ];

      const { data, error } = await supabase
        .from('properties')
        .insert(sampleProperties)
        .select();

      if (error) {
        console.error('❌ Erro ao inserir dados:', error);
        throw error;
      }

      console.log('✅ Dados inseridos com sucesso:', data);
      toast({
        title: "Sucesso!",
        description: `${data.length} propriedades de exemplo foram adicionadas.`,
      });

    } catch (error) {
      console.error('💥 Erro:', error);
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
      console.log('🗑️ Limpando todos os dados...');
      
      // Primeiro deletar imagens
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (imagesError) {
        console.error('❌ Erro ao deletar imagens:', imagesError);
      }

      // Depois deletar propriedades
      const { error: propertiesError } = await supabase
        .from('properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (propertiesError) {
        console.error('❌ Erro ao deletar propriedades:', propertiesError);
        throw propertiesError;
      }

      console.log('✅ Dados limpos com sucesso');
      toast({
        title: "Sucesso!",
        description: "Todos os dados foram removidos.",
      });

    } catch (error) {
      console.error('💥 Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testando conexão...');
      
      const { data, error, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('❌ Erro na conexão:', error);
        throw error;
      }

      console.log('✅ Conexão OK:', { data, count });
      toast({
        title: "Conexão OK!",
        description: `Encontradas ${count || 0} propriedades no banco.`,
      });

    } catch (error) {
      console.error('💥 Erro de conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao conectar com o banco de dados.",
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
          Teste do Banco de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {loading ? "Inserindo..." : "Inserir Dados de Exemplo"}
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
        
        <div className="text-sm text-gray-400">
          <p>• <strong>Testar Conexão:</strong> Verifica se consegue acessar o banco</p>
          <p>• <strong>Inserir Dados:</strong> Adiciona 3 propriedades de exemplo</p>
          <p>• <strong>Limpar Dados:</strong> Remove todas as propriedades (cuidado!)</p>
        </div>
      </CardContent>
    </Card>
  );
}
