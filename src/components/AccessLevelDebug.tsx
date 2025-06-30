
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
    owner_name: string;
    owner_role: string;
    is_own: boolean;
  }>;
  totalLeadsByUser: Array<{
    user_name: string;
    user_role: string;
    lead_count: number;
  }>;
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
        .select(`
          id,
          name,
          user_id,
          user_profiles!user_id(
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // 2. Buscar estatísticas gerais (apenas admin/gestor vê)
      let totalStats = [];
      if (isManager) {
        const { data: stats, error: statsError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            full_name,
            role,
            leads!user_id(count)
          `);

        if (!statsError && stats) {
          totalStats = stats.map(user => ({
            user_name: user.full_name,
            user_role: user.role,
            lead_count: user.leads?.length || 0
          }));
        }
      }

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
          owner_name: (lead.user_profiles as any)?.full_name || 'Desconhecido',
          owner_role: (lead.user_profiles as any)?.role || 'Desconhecido',
          is_own: lead.user_id === profile.id
        })),
        totalLeadsByUser: totalStats
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
                    Proprietário: {lead.owner_name} ({lead.owner_role})
                  </p>
                </div>
                <Badge variant={lead.is_own ? 'default' : 'outline'}>
                  {lead.is_own ? '✅ PRÓPRIO' : '👁️ DE OUTRO'}
                </Badge>
              </div>
            ))}
            {debugInfo.visibleLeads.length === 0 && (
              <p className="text-gray-500">Nenhum lead visível</p>
            )}
          </div>
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Estatísticas Gerais (apenas Gestor/Admin)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.totalLeadsByUser.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{stat.user_name}</p>
                    <Badge variant="outline">{stat.user_role}</Badge>
                  </div>
                  <Badge>{stat.lead_count} leads</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>🎯 Comportamento Esperado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {debugInfo.currentUser.role === 'corretor' && (
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="font-medium text-blue-800">👤 CORRETOR</p>
                <p className="text-blue-700">Deve ver APENAS seus próprios leads</p>
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
