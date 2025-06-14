
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { PropertyWithImages, DatabasePropertyImage } from "@/hooks/useProperties";

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

export function usePropertyEdit(property: PropertyWithImages) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: property.title,
    type: property.type as PropertyType,
    price: property.price.toString(),
    area: property.area.toString(),
    bedrooms: property.bedrooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    address: property.address,
    city: property.city,
    state: property.state,
    status: property.status as PropertyStatus,
    description: property.description || "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<DatabasePropertyImage[]>(property.property_images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadNewImages = async (propertyId: string) => {
    if (imageFiles.length === 0) return [];

    const uploadPromises = imageFiles.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}_${index}.${fileExt}`;

      console.log('📤 Fazendo upload da imagem:', fileName);

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

      console.log('🔗 URL pública gerada:', publicUrl);

      const { error: insertError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: publicUrl,
          image_order: existingImages.length + index
        });

      if (insertError) {
        console.error('❌ Erro ao inserir no banco:', insertError);
        throw insertError;
      }
      
      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const deleteMarkedImages = async () => {
    if (imagesToDelete.length === 0) return;

    console.log('🗑️ Deletando imagens marcadas:', imagesToDelete);

    const deletePromises = imagesToDelete.map(async (imageId) => {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('❌ Erro ao deletar imagem:', error);
        throw error;
      }
      console.log('✅ Imagem deletada com sucesso:', imageId);
    });
    await Promise.all(deletePromises);
  };

  const handleSubmit = async (onSuccess: () => void) => {
    if (!formData.title || !formData.type || !formData.price || !formData.area || !formData.address || !formData.city || !formData.state) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    console.log('💾 Iniciando salvamento da propriedade...');
    setLoading(true);

    try {
      console.log('📝 Atualizando dados na tabela properties para ID:', property.id);
      console.log('🔎 Campos a serem atualizados:', {
        title: formData.title,
        type: formData.type,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        status: formData.status,
        description: formData.description || null,
      });

      // 1. Update property data
      const { error: propertyError, data: updatedRows } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          type: formData.type,
          price: parseFloat(formData.price),
          area: parseFloat(formData.area),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          status: formData.status,
          description: formData.description || null,
        })
        .eq('id', property.id)
        .select();

      console.log("🔄 Resultado do update properties:", { propertyError, updatedRows });

      if (propertyError) {
        console.error('❌ Erro ao atualizar propriedade:', propertyError);
        throw propertyError;
      }

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error("Nenhuma propriedade foi atualizada. Verifique o campo ID.");
      }

      // 2. Delete marked images
      await deleteMarkedImages();

      // 3. Upload new images if any
      if (imageFiles.length > 0) {
        console.log('📤 Fazendo upload de novas imagens...');
        await uploadNewImages(property.id);
      }

      console.log('✅ Propriedade atualizada com sucesso!');
      
      toast({
        title: "Sucesso!",
        description: "Propriedade atualizada com sucesso.",
      });

      onSuccess();
    } catch (error) {
      console.error('💥 Erro ao atualizar propriedade:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar propriedade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    imageFiles,
    imagePreviewUrls,
    existingImages,
    imagesToDelete,
    handleFormChange,
    handleSubmit,
    setImageFiles,
    setImagePreviewUrls,
    setExistingImages,
    setImagesToDelete,
  };
}
