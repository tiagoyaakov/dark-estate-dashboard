
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, DollarSign, Eye, Globe, Users, MapPin } from "lucide-react";
import { PropertyWithImages } from "@/hooks/useProperties";
import { useClients } from "@/hooks/useClients";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UpcomingAppointments } from "@/components/UpcomingAppointments";
import { LayoutPreview } from "@/components/LayoutPreview";

interface DashboardContentProps {
  properties: PropertyWithImages[];
  loading: boolean;
  onNavigateToAgenda?: () => void;
}

export function DashboardContent({ properties, loading, onNavigateToAgenda }: DashboardContentProps) {
  const { clients, loading: clientsLoading } = useClients();
  const [previousMonthData, setPreviousMonthData] = useState({
    properties: 0,
    available: 0,
    averagePrice: 0,
    clients: 0,
  });
  const [loadingPreviousData, setLoadingPreviousData] = useState(true);

  // Função para calcular dados do mês anterior
  const fetchPreviousMonthData = async () => {
    try {
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      console.log('📊 Buscando dados do mês anterior...');
      console.log('📅 Período:', firstDayLastMonth.toISOString(), 'até', lastDayLastMonth.toISOString());

      // Buscar propriedades do mês anterior
      const { data: prevProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .gte('created_at', firstDayLastMonth.toISOString())
        .lt('created_at', firstDayThisMonth.toISOString());

      if (propertiesError) {
        console.error('❌ Erro ao buscar propriedades do mês anterior:', propertiesError);
      }

      // Buscar clientes do mês anterior
      const { data: prevClients, error: clientsError } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', firstDayLastMonth.toISOString())
        .lt('created_at', firstDayThisMonth.toISOString());

      if (clientsError) {
        console.error('❌ Erro ao buscar clientes do mês anterior:', clientsError);
      }

      const prevPropertiesData = prevProperties || [];
      const prevClientsData = prevClients || [];

      const prevAvailable = prevPropertiesData.filter(p => p.status === "available").length;
      const prevTotalValue = prevPropertiesData.reduce((sum, prop) => sum + prop.price, 0);
      const prevAveragePrice = prevPropertiesData.length > 0 ? prevTotalValue / prevPropertiesData.length : 0;

      setPreviousMonthData({
        properties: prevPropertiesData.length,
        available: prevAvailable,
        averagePrice: prevAveragePrice,
        clients: prevClientsData.length,
      });

      console.log('✅ Dados do mês anterior carregados:', {
        properties: prevPropertiesData.length,
        available: prevAvailable,
        averagePrice: prevAveragePrice,
        clients: prevClientsData.length,
      });

    } catch (error) {
      console.error('💥 Erro ao buscar dados do mês anterior:', error);
    } finally {
      setLoadingPreviousData(false);
    }
  };

  useEffect(() => {
    if (!loading && !clientsLoading) {
      fetchPreviousMonthData();
    }
  }, [loading, clientsLoading]);

  if (loading || clientsLoading || loadingPreviousData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-400">Carregando dados...</div>
        </div>
      </div>
    );
  }

  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === "available").length;
  const soldProperties = properties.filter(p => p.status === "sold").length;
  const rentedProperties = properties.filter(p => p.status === "rented").length;
  
  const totalValue = properties.reduce((sum, property) => sum + property.price, 0);
  const averagePrice = totalProperties > 0 ? totalValue / totalProperties : 0;

  // Dados reais dos clientes por origem
  const clientsBySource = clients.reduce((acc, client) => {
    acc[client.source] = (acc[client.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalClients = clients.length;

  // Função para calcular percentual de mudança
  const calculatePercentageChange = (current: number, previous: number): { change: string, type: "positive" | "negative" | "neutral" } => {
    if (previous === 0) {
      if (current > 0) return { change: "+100%", type: "positive" };
      return { change: "0%", type: "neutral" };
    }
    
    const percentChange = ((current - previous) / previous) * 100;
    const formattedChange = Math.abs(percentChange).toFixed(1);
    
    if (percentChange > 0) {
      return { change: `+${formattedChange}%`, type: "positive" };
    } else if (percentChange < 0) {
      return { change: `-${formattedChange}%`, type: "negative" };
    }
    return { change: "0%", type: "neutral" };
  };

  // Calcular mudanças percentuais
  const propertiesChange = calculatePercentageChange(totalProperties, previousMonthData.properties);
  const availableChange = calculatePercentageChange(availableProperties, previousMonthData.available);
  const averagePriceChange = calculatePercentageChange(averagePrice, previousMonthData.averagePrice);
  const clientsChange = calculatePercentageChange(totalClients, previousMonthData.clients);

  const stats = [
    {
      title: "Total de Imóveis",
      value: totalProperties.toString(),
      icon: Building2,
      change: propertiesChange.change,
      changeType: propertiesChange.type,
    },
    {
      title: "Disponíveis",
      value: availableProperties.toString(),
      icon: Eye,
      change: availableChange.change, 
      changeType: availableChange.type,
    },
    {
      title: "Valor Médio",
      value: `R$ ${(averagePrice / 1000).toFixed(0)}k`,
      icon: DollarSign,
      change: averagePriceChange.change,
      changeType: averagePriceChange.type,
    },
    {
      title: "Total de Leads",
      value: totalClients.toString(),
      icon: Users,
      change: clientsChange.change,
      changeType: clientsChange.type,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do seu portfólio imobiliário</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className={`text-xs mt-1 ${
                stat.changeType === "positive" ? "text-green-400" : 
                stat.changeType === "negative" ? "text-red-400" : "text-gray-400"
              }`}>
                {stat.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Propriedades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{property.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      R$ {(property.price / 1000).toFixed(0)}k
                    </p>
                    <p className={`text-xs px-2 py-1 rounded-full ${
                      property.status === "available" ? "text-green-400 bg-green-400/10" : 
                      property.status === "sold" ? "text-blue-400 bg-blue-400/10" : "text-yellow-400 bg-yellow-400/10"
                    }`}>
                      {property.status === "available" ? "Disponível" : 
                       property.status === "sold" ? "Vendido" : "Alugado"}
                    </p>
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  Nenhuma propriedade cadastrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Origem dos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {Object.entries(clientsBySource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{source}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                ))}
                {Object.keys(clientsBySource).length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    Nenhum cliente cadastrado
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Total de Leads
                  </span>
                  <span className="text-white font-medium">{totalClients}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget de Próximos Compromissos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments onViewAll={onNavigateToAgenda} />
        
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: "house", label: "Casas", count: properties.filter(p => p.type === "house").length, icon: "🏠" },
                { type: "apartment", label: "Apartamentos", count: properties.filter(p => p.type === "apartment").length, icon: "🏢" },
                { type: "commercial", label: "Comercial", count: properties.filter(p => p.type === "commercial").length, icon: "🏪" },
                { type: "land", label: "Terrenos", count: properties.filter(p => p.type === "land").length, icon: "🏞️" },
              ].map((item) => (
                <div key={item.type} className="p-4 rounded-lg bg-gray-700/30 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-lg font-semibold text-white">{item.count}</div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
