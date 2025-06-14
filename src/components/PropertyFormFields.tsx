
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type PropertyType = Tables<'properties'>['type'];
type PropertyStatus = Tables<'properties'>['status'];

interface PropertyFormData {
  title: string;
  type: PropertyType;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  address: string;
  city: string;
  state: string;
  status: PropertyStatus;
  description: string;
}

interface PropertyFormFieldsProps {
  formData: PropertyFormData;
  onChange: (field: string, value: string) => void;
}

export function PropertyFormFields({ formData, onChange }: PropertyFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Ex: Casa Moderna em Condomínio"
            className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-gray-300">Tipo *</Label>
          <Select value={formData.type} onValueChange={(value) => onChange("type", value)}>
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
            onChange={(e) => onChange("price", e.target.value)}
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
            onChange={(e) => onChange("area", e.target.value)}
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
            onChange={(e) => onChange("bedrooms", e.target.value)}
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
            onChange={(e) => onChange("bathrooms", e.target.value)}
            placeholder="3"
            className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-300">Endereço *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
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
            onChange={(e) => onChange("city", e.target.value)}
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
            onChange={(e) => onChange("state", e.target.value)}
            placeholder="SP"
            className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-gray-300">Status</Label>
          <Select value={formData.status} onValueChange={(value) => onChange("status", value)}>
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
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Descreva as características e diferenciais do imóvel..."
          className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
        />
      </div>
    </div>
  );
}
