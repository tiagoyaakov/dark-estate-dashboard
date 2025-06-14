
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Link2, Settings, CheckCircle } from "lucide-react";

export function PortalsView() {
  const portals = [
    {
      name: "Viva Real",
      status: "connected",
      properties: 45,
      logo: "🏠"
    },
    {
      name: "ZAP Imóveis",
      status: "connected",
      properties: 38,
      logo: "🏢"
    },
    {
      name: "OLX",
      status: "disconnected",
      properties: 0,
      logo: "📱"
    },
    {
      name: "Imóvel Web",
      status: "pending",
      properties: 12,
      logo: "🌐"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-600 text-white",
      disconnected: "bg-red-600 text-white",
      pending: "bg-yellow-600 text-black"
    };
    
    const labels = {
      connected: "Conectado",
      disconnected: "Desconectado",
      pending: "Pendente"
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Portais</h1>
        <p className="text-gray-400">Gerencie suas integrações com portais imobiliários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portals.map((portal) => (
          <Card key={portal.name} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3">
                  <span className="text-2xl">{portal.logo}</span>
                  {portal.name}
                </CardTitle>
                {getStatusBadge(portal.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Propriedades Sincronizadas:</span>
                  <span className="text-white font-medium">{portal.properties}</span>
                </div>
                
                <div className="flex gap-2">
                  {portal.status === "connected" ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Link2 className="h-4 w-4 mr-2" />
                        Sincronizar
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Globe className="h-4 w-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
