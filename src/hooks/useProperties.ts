
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type DatabaseProperty = Tables<'properties'>;
export type DatabasePropertyImage = Tables<'property_images'>;

export interface PropertyWithImages extends DatabaseProperty {
  property_images: DatabasePropertyImage[];
}

export function useProperties() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      console.log('🔍 Iniciando busca de propriedades...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images!property_images_property_id_fkey (*)
        `)
        .order('created_at', { ascending: false });

      console.log('📊 Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('❌ Erro ao buscar propriedades:', error);
        throw error;
      }
      
      console.log('✅ Propriedades carregadas:', data?.length || 0);
      setProperties(data || []);
      setError(null);
    } catch (err) {
      console.error('💥 Erro na função fetchProperties:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar propriedades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();

    // Configurar real-time updates para a tabela properties
    console.log('🔄 Configurando real-time updates para propriedades...');
    
    // Criar canais com nomes únicos usando timestamp
    const timestamp = Date.now();
    const propertiesChannelName = `properties-changes-${timestamp}`;
    const imagesChannelName = `property-images-changes-${timestamp}`;
    
    const propertiesChannel = supabase
      .channel(propertiesChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('🔔 Mudança detectada na tabela properties:', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ Nova propriedade adicionada:', payload.new);
            fetchProperties();
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ Propriedade atualizada:', payload.new);
            fetchProperties();
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Propriedade removida:', payload.old);
            setProperties(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Configurar real-time updates para a tabela property_images
    const imagesChannel = supabase
      .channel(imagesChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_images'
        },
        (payload) => {
          console.log('🔔 Mudança detectada na tabela property_images:', payload);
          fetchProperties();
        }
      )
      .subscribe();

    // Cleanup na desmontagem do componente
    return () => {
      console.log('🧹 Limpando subscriptions do real-time...');
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(imagesChannel);
    };
  }, []);

  return { properties, loading, error, refetch: fetchProperties };
}
