import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Bed, Bath, Square, Plus, Filter } from "lucide-react";
import { PropertyWithImages } from "@/hooks/useProperties";
import { DatabaseTest } from "./DatabaseTest";

interface PropertyListProps {
  properties: PropertyWithImages[];
  loading: boolean;
  onAddNew: () => void;
}

export function PropertyList({ properties, loading, onAddNew }: PropertyListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  console.log('🏠 PropertyList - Estado atual:', { 
    propertiesCount: properties.length, 
    loading,
    properties: properties.slice(0, 2) // Log apenas as primeiras 2 para debug
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-400">Carregando propriedades...</div>
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter(property => {
    const statusMatch = statusFilter === "all" || property.status === statusFilter;
    const typeMatch = typeFilter === "all" || property.type === typeFilter;
    return statusMatch && typeMatch;
  });

  console.log('🔍 Propriedades filtradas:', filteredProperties.length);

  const getStatusBadge = (status: PropertyWithImages["status"]) => {
    const variants = {
      available: "bg-green-600 text-white",
      sold: "bg-blue-600 text-white", 
      rented: "bg-yellow-600 text-black"
    };
    
    const labels = {
      available: "Disponível",
      sold: "Vendido",
      rented: "Alugado"
    };

    return (
      <Badge className={variants[status || "available"]}>
        {labels[status || "available"]}
      </Badge>
    );
  };

  const getTypeLabel = (type: PropertyWithImages["type"]) => {
    const labels = {
      house: "Casa",
      apartment: "Apartamento", 
      commercial: "Comercial",
      land: "Terreno"
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Propriedades</h1>
          <p className="text-gray-400">Gerencie seu portfólio de imóveis</p>
        </div>
        <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Imóvel
        </Button>
      </div>

      {/* Componente de teste do banco - remover depois */}
      <DatabaseTest />

      {/* Debug info - remover depois */}
      <div className="p-4 bg-gray-700 rounded-lg text-sm text-gray-300">
        <strong>🔧 Debug Info:</strong><br/>
        Total de propriedades: {properties.length}<br/>
        Propriedades filtradas: {filteredProperties.length}<br/>
        Status do loading: {loading ? 'Carregando...' : 'Concluído'}
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <Filter className="h-5 w-5 text-gray-400" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gray-900 border-gray-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-600">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="sold">Vendido</SelectItem>
            <SelectItem value="rented">Alugado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-gray-900 border-gray-600 text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-600">
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="house">Casa</SelectItem>
            <SelectItem value="apartment">Apartamento</SelectItem>
            <SelectItem value="commercial">Comercial</SelectItem>
            <SelectItem value="land">Terreno</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-gray-400 ml-auto">
          {filteredProperties.length} de {properties.length} propriedades
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader className="p-0">
              <div className="h-48 bg-gray-700 rounded-t-lg flex items-center justify-center">
                {property.property_images && property.property_images.length > 0 ? (
                  <img 
                    src={property.property_images[0].image_url} 
                    alt={property.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-gray-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <CardTitle className="text-lg text-white">{property.title}</CardTitle>
                {getStatusBadge(property.status)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{getTypeLabel(property.type)}</span>
                  <span className="text-2xl font-bold text-white">
                    R$ {(property.price / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {property.area}m²
                </div>
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                {property.description}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {properties.length === 0 ? 'Nenhuma propriedade cadastrada' : 'Nenhuma propriedade encontrada'}
          </h3>
          <p className="text-gray-500 mb-4">
            {properties.length === 0 
              ? 'Comece adicionando sua primeira propriedade ao sistema.'
              : 'Não há propriedades que correspondam aos filtros selecionados.'
            }
          </p>
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {properties.length === 0 ? 'Adicionar Primeira Propriedade' : 'Adicionar Propriedade'}
          </Button>
        </div>
      )}
    </div>
  );
}
