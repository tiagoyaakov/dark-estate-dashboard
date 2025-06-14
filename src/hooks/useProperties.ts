
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
          property_images (*)
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
  }, []);

  return { properties, loading, error, refetch: fetchProperties };
}
