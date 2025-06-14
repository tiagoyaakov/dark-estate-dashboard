
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Upload, X, Image } from "lucide-react";
import { Property } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface PropertyFormProps {
  onSubmit: (property: Omit<Property, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function PropertyForm({ onSubmit, onCancel }: PropertyFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    type: "" as Property["type"],
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    state: "",
    status: "available" as Property["status"],
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.price || !formData.area || !formData.address || !formData.city || !formData.state) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const property: Omit<Property, "id" | "createdAt"> = {
      title: formData.title,
      type: formData.type,
      price: parseFloat(formData.price),
      area: parseFloat(formData.area),
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      status: formData.status,
      images: images.length > 0 ? images : ["/placeholder.svg"],
      description: formData.description,
    };

    onSubmit(property);
    toast({
      title: "Sucesso!",
      description: "Propriedade adicionada com sucesso.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Adicionar Propriedade</h1>
          <p className="text-gray-400">Preencha os dados do novo imóvel</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Propriedade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Casa Moderna em Condomínio"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="850000"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-gray-300">Área (m²) *</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  placeholder="250"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-gray-300">Quartos</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleChange("bedrooms", e.target.value)}
                  placeholder="4"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-gray-300">Banheiros</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleChange("bathrooms", e.target.value)}
                  placeholder="3"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Rua das Flores, 123"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-300">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="São Paulo"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-300">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="SP"
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="rented">Alugado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva as características e diferenciais do imóvel..."
                className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-gray-300">Imagens</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB cada)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg bg-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Propriedade
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
