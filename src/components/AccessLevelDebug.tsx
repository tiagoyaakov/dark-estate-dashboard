
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AccessDebugInfo {
  currentUser: {
    id: string;
    email: string;
    role: string;
    full_name: string;
  };
  visibleLeads: Array<{
    id: string;
    name: string;
    source: string;
    stage: string;
  }>;
  allLeads: number;
  totalProperties: number;
}

export function AccessLevelDebug() {
  const { profile, isManager, isAdmin } = useUserProfile();
  const [debugInfo, setDebugInfo] = useState<AccessDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const runAccessTest = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // 1. Buscar leads visíveis para o usuário atual
      const { data: visibleLeads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, source, stage')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // 2. Contar todas as propriedades
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const debugData: AccessDebugInfo = {
        currentUser: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          full_name: profile.full_name
        },
        visibleLeads: (visibleLeads || []).map(lead => ({
          id: lead.id,
          name: lead.name,
          source: lead.source,
          stage: lead.stage
        })),
        allLeads: visibleLeads?.length || 0,
        totalProperties: propertiesCount || 0
      };

      setDebugInfo(debugData);
    } catch (error) {
      console.error('Erro no teste de acesso:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      runAccessTest();
    }
  }, [profile, isManager]);

  if (!debugInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>🔍 Debug - Níveis de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runAccessTest} disabled={loading}>
            {loading ? 'Carregando...' : 'Executar Teste de Acesso'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎭 Usuário Atual
            <Badge variant={debugInfo.currentUser.role === 'admin' ? 'destructive' : debugInfo.currentUser.role === 'gestor' ? 'default' : 'secondary'}>
              {debugInfo.currentUser.role.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {debugInfo.currentUser.full_name}</p>
            <p><strong>Email:</strong> {debugInfo.currentUser.email}</p>
            <p><strong>Role:</strong> {debugInfo.currentUser.role}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>👁️ Leads Visíveis ({debugInfo.visibleLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {debugInfo.visibleLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-gray-600">
                    Origem: {lead.source} | Estágio: {lead.stage}
                  </p>
                </div>
                <Badge variant="outline">
                  Lead #{lead.id.substring(0, 8)}
                </Badge>
              </div>
            ))}
            {debugInfo.visibleLeads.length === 0 && (
              <p className="text-gray-500">Nenhum lead visível</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Total de Leads</span>
              <Badge>{debugInfo.allLeads}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Total de Propriedades</span>
              <Badge>{debugInfo.totalProperties}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Comportamento Esperado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {debugInfo.currentUser.role === 'corretor' && (
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="font-medium text-blue-800">👤 CORRETOR</p>
                <p className="text-blue-700">Deve ver APENAS seus próprios leads (quando implementado RLS)</p>
              </div>
            )}
            {debugInfo.currentUser.role === 'gestor' && (
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <p className="font-medium text-green-800">👔 GESTOR</p>
                <p className="text-green-700">Deve ver leads de TODOS os corretores</p>
              </div>
            )}
            {debugInfo.currentUser.role === 'admin' && (
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                <p className="font-medium text-red-800">👑 ADMIN</p>
                <p className="text-red-700">Deve ver ABSOLUTAMENTE TUDO</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={runAccessTest} disabled={loading}>
          {loading ? 'Carregando...' : '🔄 Atualizar Teste'}
        </Button>
      </div>
    </div>
  );
}
