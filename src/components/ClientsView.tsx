
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Mail, Phone, Plus, Filter, User } from "lucide-react";
import { useClients } from "@/hooks/useClients";

export function ClientsView() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { clients, loading, error } = useClients();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-400">Carregando clientes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-red-400">Erro ao carregar clientes: {error}</div>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter(client => {
    return statusFilter === "all" || client.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "bg-blue-600 text-white",
      contacted: "bg-yellow-600 text-black",
      qualified: "bg-green-600 text-white",
      converted: "bg-purple-600 text-white",
      lost: "bg-red-600 text-white"
    };
    
    const labels = {
      new: "Novo",
      contacted: "Contatado",
      qualified: "Qualificado",
      converted: "Convertido",
      lost: "Perdido"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-600 text-white"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-gray-400">Gerencie seus clientes e leads</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <Filter className="h-5 w-5 text-gray-400" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gray-900 border-gray-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-600">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="new">Novo</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="qualified">Qualificado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-gray-400 ml-auto">
          {filteredClients.length} de {clients.length} clientes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {client.name}
                </CardTitle>
                {getStatusBadge(client.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone || 'Não informado'}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Interesse:</span>
                <span className="text-white font-medium">{client.interest || 'Não especificado'}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Orçamento:</span>
                <span className="text-white font-medium">
                  {client.budget ? `R$ ${(client.budget / 1000).toFixed(0)}k` : 'Não informado'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Criado em:</span>
                <span className="text-white font-medium">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  Contatar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Não há clientes que correspondam aos filtros selecionados.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cliente
          </Button>
        </div>
      )}
    </div>
  );
}
