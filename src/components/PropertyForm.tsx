
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { PropertyFormFields } from "./PropertyFormFields";
import { PropertyImageManager } from "./PropertyImageManager";

type PropertyType = Tables<'properties'>['type'];
type PropertyStatus = Tables<'properties'>['status'];

interface PropertyFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function PropertyForm({ onSubmit, onCancel }: PropertyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [formData, setFormData] = useState({
    propertyCode: "",
    title: "",
    type: "" as PropertyType,
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    state: "",
    status: "available" as PropertyStatus,
    description: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const checkPropertyCodeExists = async (code: string) => {
    if (!code.trim()) return false;
    
    console.log('🔍 Verificando se código existe (TEXT):', code.trim());
    setCheckingCode(true);
    try {
      const { data, error, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('id', code.trim());

      console.log('📊 Resultado da verificação (count):', { count, error });

      if (error) {
        console.error('❌ Erro ao verificar código:', error);
        return false;
      }

      const exists = (count || 0) > 0;
      console.log('✅ Código existe?', exists);
      return exists;
    } catch (error) {
      console.error('💥 Erro na verificação:', error);
      return false;
    } finally {
      setCheckingCode(false);
    }
  };

  const handleCodeBlur = async () => {
    if (!formData.propertyCode.trim()) return;

    console.log('👀 Verificando código ao sair do campo:', formData.propertyCode);
    const exists = await checkPropertyCodeExists(formData.propertyCode);
    if (exists) {
      toast({
        title: "Código já existe",
        description: "Este código de imóvel já está sendo usado. Por favor, escolha outro.",
        variant: "destructive",
      });
      setFormData(prev => ({ ...prev, propertyCode: "" }));
    }
  };

  const uploadImages = async (propertyId: string) => {
    console.log('📤 Iniciando upload de imagens para propriedade:', propertyId);
    console.log('📸 Quantidade de imagens:', imageFiles.length);

    const uploadPromises = imageFiles.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}_${index}.${fileExt}`;
      
      console.log('⬆️ Fazendo upload:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      console.log('🔗 URL pública:', publicUrl);

      const { error: insertError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: publicUrl,
          image_order: index
        });

      if (insertError) {
        console.error('❌ Erro ao inserir no banco:', insertError);
        throw insertError;
      }
      
      console.log('✅ Imagem salva com sucesso');
      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando submissão do formulário');
    console.log('📝 Dados do formulário:', formData);

    // Validação de campos obrigatórios
    if (!formData.propertyCode?.trim()) {
      console.log('❌ Código da propriedade não preenchido');
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o código da propriedade.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title?.trim() || !formData.type || !formData.price || !formData.area || !formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
      console.log('❌ Campos obrigatórios não preenchidos');
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o preço e área são números válidos
    const priceNum = parseFloat(formData.price);
    const areaNum = parseFloat(formData.area);
    
    if (isNaN(priceNum) || priceNum <= 0) {
      console.log('❌ Preço inválido');
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(areaNum) || areaNum <= 0) {
      console.log('❌ Área inválida');
      toast({
        title: "Área inválida",
        description: "Por favor, insira uma área válida maior que zero.",
        variant: "destructive",
      });
      return;
    }

    // Verificar novamente se o código já existe
    console.log('🔍 Verificação final do código...');
    const codeExists = await checkPropertyCodeExists(formData.propertyCode);
    if (codeExists) {
      console.log('❌ Código já existe na verificação final');
      toast({
        title: "Código já existe",
        description: "Este código de imóvel já está sendo usado. Por favor, escolha outro.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('💾 Inserindo propriedade no banco...');
      
      // Preparar dados para inserção
      const propertyData = {
        id: formData.propertyCode.trim(),
        title: formData.title.trim(),
        type: formData.type,
        price: priceNum,
        area: areaNum,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        status: formData.status,
        description: formData.description?.trim() || null,
      };

      console.log('📋 Dados preparados para inserção:', propertyData);

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      console.log('📊 Resultado da inserção:', { property, propertyError });

      if (propertyError) {
        console.error('❌ Erro ao inserir propriedade:', propertyError);
        throw new Error(`Erro na inserção: ${propertyError.message}`);
      }

      console.log('✅ Propriedade inserida com sucesso:', property);

      // Upload images if any
      if (imageFiles.length > 0) {
        console.log('📤 Iniciando upload de imagens...');
        await uploadImages(property.id);
        console.log('✅ Upload de imagens concluído');
      }

      console.log('🎉 Processo concluído com sucesso');
      toast({
        title: "Sucesso!",
        description: "Propriedade adicionada com sucesso.",
      });

      onSubmit();
    } catch (error) {
      console.error('💥 Erro geral:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao adicionar propriedade: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeBlur = async () => {
    if (!formData.propertyCode.trim()) return;

    console.log('👀 Verificando código ao sair do campo:', formData.propertyCode);
    const exists = await checkPropertyCodeExists(formData.propertyCode);
    if (exists) {
      toast({
        title: "Código já existe",
        description: "Este código de imóvel já está sendo usado. Por favor, escolha outro.",
        variant: "destructive",
      });
      setFormData(prev => ({ ...prev, propertyCode: "" }));
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log('✏️ Alterando campo:', field, '=', value);
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
            <PropertyFormFields 
              formData={formData} 
              onChange={handleChange}
              onCodeBlur={handleCodeBlur}
              checkingCode={checkingCode}
            />

            <PropertyImageManager
              existingImages={[]}
              onImagesChange={() => {}}
              onNewImagesChange={(files, previews) => {
                console.log('🖼️ Novas imagens selecionadas:', files.length);
                setImageFiles(files);
                setImagePreviewUrls(previews);
              }}
              onImagesToDeleteChange={() => {}}
              newImageFiles={imageFiles}
              newImagePreviews={imagePreviewUrls}
              imagesToDelete={[]}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Adicionar Propriedade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
