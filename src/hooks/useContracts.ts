import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Contract = Tables<'contracts'>;
export type ContractInsert = TablesInsert<'contracts'>;
export type ContractUpdate = TablesUpdate<'contracts'>;

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os contratos
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando contratos no banco...');
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar contratos:', error);
        setError(error.message);
        return;
      }

      console.log(`✅ ${data?.length || 0} contratos encontrados:`, data);
      setContracts(data || []);
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar contratos:', err);
      setError('Erro inesperado ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  // Criar um novo contrato
  const createContract = async (contractData: ContractInsert): Promise<Contract | null> => {
    try {
      console.log('📝 Criando contrato no banco:', contractData);

      const { data, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar contrato:', error);
        toast.error(`Erro ao salvar contrato: ${error.message}`);
        return null;
      }

      console.log('✅ Contrato criado com sucesso:', data);
      toast.success('Contrato salvo com sucesso!');
      
      // Atualizar lista local
      setContracts(prev => {
        console.log('🔄 Atualizando lista local de contratos...');
        const newList = [data, ...prev];
        console.log('📋 Nova lista de contratos:', newList.length, 'contratos');
        return newList;
      });
      
      // Força uma nova busca para garantir sincronização
      setTimeout(() => {
        console.log('🔄 Forçando refresh da lista de contratos...');
        fetchContracts();
      }, 1000);
      
      return data;
    } catch (err) {
      console.error('💥 Erro inesperado ao criar contrato:', err);
      toast.error('Erro inesperado ao salvar contrato');
      return null;
    }
  };

  // Atualizar um contrato
  const updateContract = async (id: string, updates: ContractUpdate): Promise<Contract | null> => {
    try {
      console.log('📝 Atualizando contrato:', id, updates);

      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar contrato:', error);
        toast.error(`Erro ao atualizar contrato: ${error.message}`);
        return null;
      }

      console.log('✅ Contrato atualizado com sucesso:', data);
      toast.success('Contrato atualizado com sucesso!');
      
      // Atualizar lista local
      setContracts(prev => prev.map(contract => 
        contract.id === id ? data : contract
      ));
      
      return data;
    } catch (err) {
      console.error('💥 Erro inesperado ao atualizar contrato:', err);
      toast.error('Erro inesperado ao atualizar contrato');
      return null;
    }
  };

  // Deletar um contrato (soft delete)
  const deleteContract = async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deletando contrato:', id);

      const { error } = await supabase
        .from('contracts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar contrato:', error);
        toast.error(`Erro ao deletar contrato: ${error.message}`);
        return false;
      }

      console.log('✅ Contrato deletado com sucesso');
      toast.success('Contrato deletado com sucesso!');
      
      // Remover da lista local
      setContracts(prev => prev.filter(contract => contract.id !== id));
      
      return true;
    } catch (err) {
      console.error('💥 Erro inesperado ao deletar contrato:', err);
      toast.error('Erro inesperado ao deletar contrato');
      return false;
    }
  };

  // Gerar número único do contrato
  const generateContractNumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `CTR-${year}-${timestamp}`;
  };

  // Calcular próximo vencimento (para contratos de locação)
  const calculateNextDueDate = (startDate: string, paymentDay: string): string | null => {
    if (!paymentDay) return null;
    
    const start = new Date(startDate);
    const day = parseInt(paymentDay);
    
    const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, day);
    return nextMonth.toISOString().split('T')[0];
  };

  // Buscar contratos por status
  const getContractsByStatus = (status: Contract['status']) => {
    return contracts.filter(contract => contract.status === status);
  };

  // Buscar contratos por tipo
  const getContractsByType = (type: Contract['tipo']) => {
    return contracts.filter(contract => contract.tipo === type);
  };

  // Carregar contratos na inicialização
  useEffect(() => {
    fetchContracts();
  }, []);

  // Configurar real-time updates
  useEffect(() => {
    console.log('📡 Configurando real-time updates para contratos...');
    const channel = supabase
      .channel('contracts_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contracts'
        },
        (payload) => {
          console.log('📡 Mudança em contracts detectada:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newContract = payload.new as Contract;
            console.log('➕ Novo contrato via real-time:', newContract);
            if (newContract.is_active) {
              setContracts(prev => {
                console.log('📋 Adicionando contrato via real-time à lista');
                return [newContract, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedContract = payload.new as Contract;
            console.log('🔄 Contrato atualizado via real-time:', updatedContract);
            setContracts(prev => 
              prev.map(contract => 
                contract.id === updatedContract.id ? updatedContract : contract
              ).filter(contract => contract.is_active)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedContract = payload.old as Contract;
            console.log('🗑️ Contrato deletado via real-time:', deletedContract);
            setContracts(prev => prev.filter(c => c.id !== deletedContract.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do canal real-time contracts:', status);
      });

    return () => {
      console.log('🧹 Removendo canal real-time contracts...');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    generateContractNumber,
    calculateNextDueDate,
    getContractsByStatus,
    getContractsByType,
  };
} 