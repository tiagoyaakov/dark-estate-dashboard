
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';

export function IsolationDebug() {
  const { profile } = useUserProfile();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    try {
      // 1. Verificar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. Buscar todos os leads (sem filtro - para ver se RLS está funcionando)
      const { data: allLeads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, created_at');
      
      // 3. Buscar todas as propriedades
      const { data: allProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, created_at');
      
      setDebugInfo({
        currentUser: {
          id: user?.id,
          email: user?.email,
          profile: profile
        },
        leads: {
          data: allLeads,
          error: leadsError,
          total: allLeads?.length || 0
        },
        properties: {
          data: allProperties,
          error: propertiesError,
          total: allProperties?.length || 0
        }
      });
    } catch (error) {
      console.error('Erro no debug:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCreateLead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      const testLead = {
        name: `Lead Teste - ${new Date().toLocaleTimeString()}`,
        email: 'teste@teste.com',
        phone: '11999999999',
        source: 'Manual',
        stage: 'Novo Lead'
      };

      console.log('🧪 Criando lead de teste:', testLead);

      const { data, error } = await supabase
        .from('leads')
        .insert([testLead])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar lead:', error);
        alert(`Erro: ${error.message}`);
      } else {
        console.log('✅ Lead criado:', data);
        alert(`Lead criado com sucesso! ID: ${data.id}`);
        runDebug(); // Atualizar debug
      }
    } catch (error) {
      console.error('Erro:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  useEffect(() => {
    runDebug();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">🔍 Debug do Isolamento de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runDebug} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar Debug'}
            </Button>
            <Button onClick={testCreateLead} variant="outline">
              Criar Lead Teste
            </Button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              {/* Usuário Atual */}
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">👤 Usuário Atual</h3>
                <pre className="text-sm text-gray-300 overflow-auto">
                  {JSON.stringify(debugInfo.currentUser, null, 2)}
                </pre>
              </div>

              {/* Leads */}
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">📋 Leads</h3>
                <div className="text-gray-300 mb-2">
                  <p>Total: {debugInfo.leads.total}</p>
                  {debugInfo.leads.error && (
                    <p className="text-red-400">Erro: {debugInfo.leads.error.message}</p>
                  )}
                </div>
                <pre className="text-xs text-gray-400 overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.leads.data, null, 2)}
                </pre>
              </div>

              {/* Propriedades */}
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">🏠 Propriedades</h3>
                <div className="text-gray-300 mb-2">
                  <p>Total: {debugInfo.properties.total}</p>
                  {debugInfo.properties.error && (
                    <p className="text-red-400">Erro: {debugInfo.properties.error.message}</p>
                  )}
                </div>
                <pre className="text-xs text-gray-400 overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.properties.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
