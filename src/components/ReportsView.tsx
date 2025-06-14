
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, BarChart3, Download } from "lucide-react";

export function ReportsView() {
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
            <p className="text-gray-400 mb-4">Relatório de vendas por mês</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
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
            <p className="text-gray-400 mb-4">Relatório detalhado de propriedades</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
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
            <p className="text-gray-400 mb-4">Análise de tendências do mercado</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
