// Tipos para o sistema Kanban de Leads
import { Tables } from '@/integrations/supabase/types';

export type LeadStage = 
  | 'Novo Lead'
  | 'Qualificado'
  | 'Visita Agendada'
  | 'Em Negociação'
  | 'Documentação'
  | 'Contrato'
  | 'Fechamento';

export interface DatabaseLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  stage: LeadStage;
  interest: string | null;
  estimated_value: number | null;
  notes: string | null;
  property_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  message?: string | null; // Campo legado
}

export interface KanbanLead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  interesse: string;
  valor: number;
  stage: string;
  dataContato: string;
  observacoes: string;
}

export interface KanbanStage {
  id: string;
  title: LeadStage;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  icon: any;
}

export interface KanbanStats {
  stage: LeadStage;
  lead_count: number;
  avg_value: number;
  total_value: number;
  percentage: number;
}

// Função para converter DatabaseLead para KanbanLead
export function databaseLeadToKanbanLead(dbLead: DatabaseLead): KanbanLead {
  return {
    id: dbLead.id,
    nome: dbLead.name,
    email: dbLead.email || '',
    telefone: dbLead.phone || '',
    origem: dbLead.source,
    interesse: dbLead.interest || 'Não especificado',
    valor: dbLead.estimated_value || 0,
    stage: dbLead.stage,
    dataContato: dbLead.created_at ? new Date(dbLead.created_at).toISOString().split('T')[0] : '',
    observacoes: dbLead.notes || ''
  };
}

// Função para converter KanbanLead para DatabaseLead (para updates)
export function kanbanLeadToDatabaseLead(kanbanLead: KanbanLead): Partial<DatabaseLead> {
  return {
    id: kanbanLead.id,
    name: kanbanLead.nome,
    email: kanbanLead.email || null,
    phone: kanbanLead.telefone || null,
    source: kanbanLead.origem,
    stage: kanbanLead.stage as LeadStage,
    interest: kanbanLead.interesse || null,
    estimated_value: kanbanLead.valor || null,
    notes: kanbanLead.observacoes || null,
    updated_at: new Date().toISOString()
  };
} 