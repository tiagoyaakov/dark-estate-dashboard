import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, X, Mail, Phone, MapPin, CreditCard, Heart, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useKanbanLeads } from '@/hooks/useKanbanLeads';
import { useProperties } from '@/hooks/useProperties';
import { KanbanLead, LeadStage } from '@/types/kanban';

const leadStages: LeadStage[] = [
  'Novo Lead',
  'Qualificado', 
  'Visita Agendada',
  'Em Negociação',
  'Documentação',
  'Contrato',
  'Fechamento'
];

const leadSources = [
  'Facebook',
  'Zap Imóveis',
  'Viva Real',
  'OLX',
  'Indicação',
  'Whatsapp',
  'Website',
  'Outros'
];

const estadosCivis = [
  'Solteiro',
  'Casado',
  'Divorciado',
  'Viúvo',
  'União Estável'
];

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: KanbanLead | null;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ 
  isOpen, 
  onClose, 
  leadToEdit = null 
}) => {
  const { createLead, updateLead } = useKanbanLeads();
  const { properties } = useProperties();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    estado_civil: '',
    source: '',
    stage: 'Novo Lead' as LeadStage,
    interest: '',
    estimated_value: '',
    notes: '',
    message: '',
    property_id: ''
  });

  // Resetar/popular formulário quando modal abre/fecha ou lead muda
  useEffect(() => {
    if (isOpen) {
      if (leadToEdit) {
        // Modo edição - popular com dados do lead
        setFormData({
          nome: leadToEdit.nome || '',
          email: leadToEdit.email || '',
          telefone: leadToEdit.telefone || '',
          cpf: leadToEdit.cpf || '',
          endereco: leadToEdit.endereco || '',
          estado_civil: leadToEdit.estado_civil || '',
          source: leadToEdit.origem || '',
          stage: (leadToEdit.stage || 'Novo Lead') as LeadStage,
          interest: leadToEdit.interesse || '',
          estimated_value: leadToEdit.valorEstimado?.toString() || '',
          notes: leadToEdit.observacoes || '',
          message: leadToEdit.message || '',
          property_id: leadToEdit.property_id || ''
        });
      } else {
        // Modo criação - resetar formulário
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          cpf: '',
          endereco: '',
          estado_civil: '',
          source: '',
          stage: 'Novo Lead',
          interest: '',
          estimated_value: '',
          notes: '',
          message: '',
          property_id: ''
        });
      }
    }
  }, [isOpen, leadToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim() && !formData.telefone.trim()) {
      toast.error('Email ou telefone são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const leadData = {
        nome: formData.nome.trim(),
        email: formData.email.trim() || '',
        telefone: formData.telefone.trim() || '',
        cpf: formData.cpf.trim() || '',
        endereco: formData.endereco.trim() || '',
        estado_civil: formData.estado_civil || '',
        origem: formData.source || 'Website',
        stage: formData.stage,
        interesse: formData.interest.trim() || '',
        valor: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
        valorEstimado: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
        observacoes: formData.notes.trim() || '',
        message: formData.message.trim() || '',
        property_id: formData.property_id || '',
        dataContato: new Date().toISOString().split('T')[0]
      };

      if (leadToEdit) {
        // Modo edição
        await updateLead(leadToEdit.id, leadData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        // Modo criação
        await createLead(leadData);
        toast.success('Novo cliente adicionado com sucesso!');
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="relative"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl" />

              {/* Conteúdo principal */}
              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {leadToEdit ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {leadToEdit ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
                      Informações Básicas
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-gray-300 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome Completo *
                        </Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => handleChange('nome', e.target.value)}
                          placeholder="Nome completo do cliente"
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="email@exemplo.com"
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-gray-300 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone/WhatsApp
                        </Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => handleChange('telefone', e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                        />
                      </div>

                      {/* Campos CPF, Estado Civil e Endereço */}
                      {true && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="cpf" className="text-gray-300 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              CPF
                            </Label>
                            <Input
                              id="cpf"
                              value={formData.cpf}
                              onChange={(e) => handleChange('cpf', e.target.value)}
                              placeholder="000.000.000-00"
                              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estado_civil" className="text-gray-300 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Estado Civil
                            </Label>
                            <Select value={formData.estado_civil} onValueChange={(value) => handleChange('estado_civil', value)}>
                              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                                <SelectValue placeholder="Selecione o estado civil" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {estadosCivis.map((estado) => (
                                  <SelectItem key={estado} value={estado} className="text-white hover:bg-gray-700">
                                    {estado}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="endereco" className="text-gray-300 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Endereço Completo
                            </Label>
                            <Input
                              id="endereco"
                              value={formData.endereco}
                              onChange={(e) => handleChange('endereco', e.target.value)}
                              placeholder="Rua, número, bairro, cidade, estado, CEP"
                              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Informações de Lead */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
                      Informações de Lead
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="source" className="text-gray-300">Origem</Label>
                        <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue placeholder="Como nos conheceu?" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {leadSources.map((source) => (
                              <SelectItem key={source} value={source} className="text-white hover:bg-gray-700">
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stage" className="text-gray-300">Estágio</Label>
                        <Select value={formData.stage} onValueChange={(value) => handleChange('stage', value as LeadStage)}>
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue placeholder="Estágio atual" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {leadStages.map((stage) => (
                              <SelectItem key={stage} value={stage} className="text-white hover:bg-gray-700">
                                {stage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimated_value" className="text-gray-300">Valor Estimado (R$)</Label>
                        <Input
                          id="estimated_value"
                          type="number"
                          value={formData.estimated_value}
                          onChange={(e) => handleChange('estimated_value', e.target.value)}
                          placeholder="850000"
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="interest" className="text-gray-300">Interesse</Label>
                        <Input
                          id="interest"
                          value={formData.interest}
                          onChange={(e) => handleChange('interest', e.target.value)}
                          placeholder="Ex: Casa 3 quartos, apartamento centro"
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="property_id" className="text-gray-300 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Imóvel de Interesse
                        </Label>
                        <Select value={formData.property_id} onValueChange={(value) => handleChange('property_id', value)}>
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue placeholder="Selecione um imóvel" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id} className="text-white hover:bg-gray-700">
                                <div className="flex flex-col">
                                  <span className="font-medium">{property.title}</span>
                                  <span className="text-sm text-gray-400">
                                    R$ {property.price?.toLocaleString('pt-BR')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-300">Mensagem Inicial</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          placeholder="Primeira mensagem ou contato do cliente..."
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-gray-300">Observações</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          placeholder="Observações internas sobre o cliente..."
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : leadToEdit ? "Atualizar Cliente" : "Adicionar Cliente"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 