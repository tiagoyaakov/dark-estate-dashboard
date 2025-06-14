
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Calendar, X } from "lucide-react";
import { PropertyWithImages } from "@/hooks/useProperties";

interface PropertyDetailsPopupProps {
  property: PropertyWithImages | null;
  open: boolean;
  onClose: () => void;
}

export function PropertyDetailsPopup({ property, open, onClose }: PropertyDetailsPopupProps) {
  if (!property) return null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl text-white mb-2">{property.title}</DialogTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(property.status)}
                <span className="text-gray-400">{getTypeLabel(property.type)}</span>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Imagens</h3>
            {property.property_images && property.property_images.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {property.property_images.map((image, index) => (
                  <div key={image.id} className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={image.image_url} 
                      alt={`${property.title} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Nenhuma imagem disponível</span>
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            {/* Preço */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Preço</h3>
              <div className="text-3xl font-bold text-white">
                R$ {property.price.toLocaleString('pt-BR')}
              </div>
            </div>

            {/* Localização */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Localização</h3>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                {property.address}, {property.city}
              </div>
            </div>

            {/* Características */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Características</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Square className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                  <div className="text-sm text-gray-400">Área</div>
                  <div className="font-semibold text-white">{property.area}m²</div>
                </div>
                {property.bedrooms && (
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <div className="text-sm text-gray-400">Quartos</div>
                    <div className="font-semibold text-white">{property.bedrooms}</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <div className="text-sm text-gray-400">Banheiros</div>
                    <div className="font-semibold text-white">{property.bathrooms}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            {property.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Descrição</h3>
                <p className="text-gray-300 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Data de criação */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Informações Adicionais</h3>
              <div className="flex items-center text-gray-300">
                <Calendar className="h-4 w-4 mr-2" />
                Cadastrado em {formatDate(property.created_at)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Fechar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Editar Propriedade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
