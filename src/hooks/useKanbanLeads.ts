import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { 
  KanbanLead, 
  LeadStage,
  databaseLeadToKanbanLead,
  kanbanLeadToDatabaseLead 
} from '@/types/kanban';

type DatabaseLead = Tables<'leads'>;

export function useKanbanLeads() {
  const [leads, setLeads] = useState<KanbanLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os leads do banco de dados
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Converter dados do banco para formato do kanban
      const kanbanLeads = (data as DatabaseLead[]).map(dbLead => 
        databaseLeadToKanbanLead({
          ...dbLead,
          stage: (dbLead.stage || 'Novo Lead') as LeadStage,
          interest: dbLead.interest || null,
          estimated_value: dbLead.estimated_value || null,
          notes: dbLead.notes || null,
          updated_at: dbLead.updated_at || null
        })
      );
      setLeads(kanbanLeads);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar leads';
      setError(errorMessage);
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar estágio de um lead
  const updateLeadStage = useCallback(async (leadId: string, newStage: LeadStage) => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('leads')
        .update({ 
          stage: newStage,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Atualizar estado local imediatamente
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, stage: newStage }
            : lead
        )
      );

      return true;
    } catch (err) {
      console.error('Erro ao atualizar estágio do lead:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lead');
      return false;
    }
  }, []);

  // Criar novo lead
  const createLead = useCallback(async (leadData: Omit<KanbanLead, 'id' | 'dataContato'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          name: leadData.nome,
          email: leadData.email || null,
          phone: leadData.telefone || null,
          source: leadData.origem,
          stage: leadData.stage as LeadStage,
          interest: leadData.interesse || null,
          estimated_value: leadData.valor || null,
          notes: leadData.observacoes || null
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Adicionar ao estado local
      const newKanbanLead = databaseLeadToKanbanLead({
        ...data,
        stage: (data.stage || 'Novo Lead') as LeadStage,
        interest: data.interest || null,
        estimated_value: data.estimated_value || null,
        notes: data.notes || null,
        updated_at: data.updated_at || null
      });
      setLeads(prevLeads => [newKanbanLead, ...prevLeads]);

      return newKanbanLead;
    } catch (err) {
      console.error('Erro ao criar lead:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar lead');
      return null;
    }
  }, []);

  // Atualizar lead completo
  const updateLead = useCallback(async (leadId: string, updates: Partial<KanbanLead>) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: updates.nome,
          email: updates.email || null,
          phone: updates.telefone || null,
          source: updates.origem,
          stage: updates.stage as LeadStage,
          interest: updates.interesse || null,
          estimated_value: updates.valor || null,
          notes: updates.observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, ...updates }
            : lead
        )
      );

      return true;
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lead');
      return false;
    }
  }, []);

  // Deletar lead
  const deleteLead = useCallback(async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Remover do estado local
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));

      return true;
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar lead');
      return false;
    }
  }, []);

  // Buscar leads por estágio
  const getLeadsByStage = useCallback((stage: string) => {
    return leads.filter(lead => lead.stage === stage);
  }, [leads]);

  // Configurar escuta em tempo real
  useEffect(() => {
    fetchLeads();

    // Configurar subscription para mudanças em tempo real
    const subscription = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('Mudança detectada na tabela leads:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              const newLead = databaseLeadToKanbanLead({
                ...payload.new as DatabaseLead,
                stage: (payload.new.stage || 'Novo Lead') as LeadStage,
                interest: payload.new.interest || null,
                estimated_value: payload.new.estimated_value || null,
                notes: payload.new.notes || null,
                updated_at: payload.new.updated_at || null
              });
              setLeads(prevLeads => {
                // Verificar se o lead já existe para evitar duplicatas
                const exists = prevLeads.some(lead => lead.id === newLead.id);
                if (!exists) {
                  return [newLead, ...prevLeads];
                }
                return prevLeads;
              });
              break;
              
            case 'UPDATE':
              const updatedLead = databaseLeadToKanbanLead({
                ...payload.new as DatabaseLead,
                stage: (payload.new.stage || 'Novo Lead') as LeadStage,
                interest: payload.new.interest || null,
                estimated_value: payload.new.estimated_value || null,
                notes: payload.new.notes || null,
                updated_at: payload.new.updated_at || null
              });
              setLeads(prevLeads => 
                prevLeads.map(lead => 
                  lead.id === updatedLead.id ? updatedLead : lead
                )
              );
              break;
              
            case 'DELETE':
              setLeads(prevLeads => 
                prevLeads.filter(lead => lead.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    updateLeadStage,
    createLead,
    updateLead,
    deleteLead,
    getLeadsByStage,
    // Estatísticas calculadas
    totalLeads: leads.length,
    totalValue: leads.reduce((sum, lead) => sum + (lead.valor || 0), 0),
    stageStats: leads.reduce((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
} 