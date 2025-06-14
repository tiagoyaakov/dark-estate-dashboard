
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, DollarSign, Eye, Globe, Users, MapPin } from "lucide-react";
import { PropertyWithImages } from "@/hooks/useProperties";
import { useClients } from "@/hooks/useClients";

interface DashboardContentProps {
  properties: PropertyWithImages[];
  loading: boolean;
}

export function DashboardContent({ properties, loading }: DashboardContentProps) {
  const { clients, loading: clientsLoading } = useClients();

  if (loading || clientsLoading) {
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

  // Dados reais dos clientes por status
  const clientsByStatus = {
    new: clients.filter(c => c.status === "new").length,
    contacted: clients.filter(c => c.status === "contacted").length,
    qualified: clients.filter(c => c.status === "qualified").length,
    converted: clients.filter(c => c.status === "converted").length,
    lost: clients.filter(c => c.status === "lost").length,
  };

  // Simulando origem dos clientes baseado nos dados reais
  const totalClients = clients.length;
  const clientOrigins = [
    { source: "OLX", count: Math.floor(totalClients * 0.35), percentage: 35, color: "bg-blue-500" },
    { source: "ZAP Imóveis", count: Math.floor(totalClients * 0.25), percentage: 25, color: "bg-green-500" },
    { source: "Viva Real", count: Math.floor(totalClients * 0.22), percentage: 22, color: "bg-purple-500" },
    { source: "Facebook", count: Math.floor(totalClients * 0.12), percentage: 12, color: "bg-indigo-500" },
    { source: "Google Ads", count: Math.floor(totalClients * 0.06), percentage: 6, color: "bg-yellow-500" },
  ];

  const stats = [
    {
      title: "Total de Imóveis",
      value: totalProperties.toString(),
      icon: Building2,
      change: "+2.5%",
      changeType: "positive" as const,
    },
    {
      title: "Disponíveis",
      value: availableProperties.toString(),
      icon: Eye,
      change: "+1.2%", 
      changeType: "positive" as const,
    },
    {
      title: "Valor Médio",
      value: `R$ ${(averagePrice / 1000).toFixed(0)}k`,
      icon: DollarSign,
      change: "+5.4%",
      changeType: "positive" as const,
    },
    {
      title: "Total de Leads",
      value: totalClients.toString(),
      icon: Users,
      change: "+8.1%",
      changeType: "positive" as const,
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
              <p className="text-xs text-green-400 mt-1">
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
              Status dos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Novos</span>
                  <span className="text-sm font-medium text-white">{clientsByStatus.new}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Contatados</span>
                  <span className="text-sm font-medium text-white">{clientsByStatus.contacted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Qualificados</span>
                  <span className="text-sm font-medium text-white">{clientsByStatus.qualified}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Convertidos</span>
                  <span className="text-sm font-medium text-white">{clientsByStatus.converted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Perdidos</span>
                  <span className="text-sm font-medium text-white">{clientsByStatus.lost}</span>
                </div>
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
  );
}
