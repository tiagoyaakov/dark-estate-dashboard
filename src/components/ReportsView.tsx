
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, BarChart3, Download } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useClients } from "@/hooks/useClients";
import { exportSalesReport, exportPropertiesReport, exportMarketAnalysisReport } from "@/utils/reportExports";
import { useToast } from "@/hooks/use-toast";

export function ReportsView() {
  const { properties, loading: propertiesLoading } = useProperties();
  const { clients, loading: clientsLoading } = useClients();
  const { toast } = useToast();

  const isLoading = propertiesLoading || clientsLoading;

  const handleSalesExport = () => {
    try {
      exportSalesReport(properties, clients);
      toast({
        title: "Relatório exportado!",
        description: "O relatório de vendas foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o relatório de vendas.",
        variant: "destructive",
      });
    }
  };

  const handlePropertiesExport = () => {
    try {
      exportPropertiesReport(properties);
      toast({
        title: "Relatório exportado!",
        description: "O relatório de propriedades foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o relatório de propriedades.",
        variant: "destructive",
      });
    }
  };

  const handleMarketAnalysisExport = () => {
    try {
      exportMarketAnalysisReport(properties, clients);
      toast({
        title: "Relatório exportado!",
        description: "O relatório de análise de mercado foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar a análise de mercado.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
        <p className="text-gray-400">Visualize e exporte relatórios detalhados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vendas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Relatório de vendas e aluguéis realizados</p>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <div>Propriedades vendidas: {properties.filter(p => p.status === 'sold').length}</div>
              <div>Propriedades alugadas: {properties.filter(p => p.status === 'rented').length}</div>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSalesExport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Carregando..." : "Exportar CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Propriedades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Relatório completo de todas as propriedades</p>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <div>Total de propriedades: {properties.length}</div>
              <div>Disponíveis: {properties.filter(p => p.status === 'available').length}</div>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handlePropertiesExport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Carregando..." : "Exportar CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Análise de tendências e origem de clientes</p>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <div>Total de leads: {clients.length}</div>
              <div>Fontes ativas: {new Set(clients.map(c => c.source)).size}</div>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleMarketAnalysisExport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Carregando..." : "Exportar CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
