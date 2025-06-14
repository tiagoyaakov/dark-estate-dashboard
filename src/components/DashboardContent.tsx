
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, DollarSign, Eye } from "lucide-react";
import { Property } from "@/pages/Index";

interface DashboardContentProps {
  properties: Property[];
}

export function DashboardContent({ properties }: DashboardContentProps) {
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === "available").length;
  const soldProperties = properties.filter(p => p.status === "sold").length;
  const rentedProperties = properties.filter(p => p.status === "rented").length;
  
  const totalValue = properties.reduce((sum, property) => sum + property.price, 0);
  const averagePrice = totalProperties > 0 ? totalValue / totalProperties : 0;

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
      title: "Vendidos/Alugados",
      value: (soldProperties + rentedProperties).toString(),
      icon: TrendingUp,
      change: "+3.1%",
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
          <Card key={stat.title} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Propriedades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{property.title}</p>
                      <p className="text-xs text-gray-400">{property.city}, {property.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      R$ {(property.price / 1000).toFixed(0)}k
                    </p>
                    <p className={`text-xs ${
                      property.status === "available" ? "text-green-400" : 
                      property.status === "sold" ? "text-blue-400" : "text-yellow-400"
                    }`}>
                      {property.status === "available" ? "Disponível" : 
                       property.status === "sold" ? "Vendido" : "Alugado"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "house", label: "Casas", count: properties.filter(p => p.type === "house").length },
                { type: "apartment", label: "Apartamentos", count: properties.filter(p => p.type === "apartment").length },
                { type: "commercial", label: "Comercial", count: properties.filter(p => p.type === "commercial").length },
                { type: "land", label: "Terrenos", count: properties.filter(p => p.type === "land").length },
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${totalProperties > 0 ? (item.count / totalProperties) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
