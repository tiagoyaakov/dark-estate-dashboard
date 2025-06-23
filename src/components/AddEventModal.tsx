import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PropertyWithImages } from "@/hooks/useProperties";
import { DatabaseClient } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { CustomModal } from "./CustomModal";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyWithImages[];
  clients: DatabaseClient[];
  onSubmit: (eventData: {
    propertyId: string;
    clientId: string;
    email: string;
    date: Date;
    time: string;
    type: string;
    corretor: string;
  }) => void;
}

export function AddEventModal({ 
  isOpen, 
  onClose, 
  properties, 
  clients, 
  onSubmit 
}: AddEventModalProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [eventType, setEventType] = useState<string>("Visita");
  const [selectedCorretor, setSelectedCorretor] = useState<string>("aleatorio");
  const [loading, setLoading] = useState(false);
  
  // Estados para modais personalizados
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success' as 'success' | 'error' | 'confirm' | 'alert',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client?.email) {
      setEmail(client.email);
    }
  };

  // Funções para atalhos de data
  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Horários comuns para seleção rápida (ordenados por popularidade)
  const commonTimes = [
    { label: "09:00", value: "09:00", popular: true },
    { label: "10:00", value: "10:00", popular: true },
    { label: "14:00", value: "14:00", popular: true },
    { label: "15:00", value: "15:00", popular: true },
    { label: "16:00", value: "16:00", popular: true },
    { label: "11:00", value: "11:00", popular: true },
    { label: "08:00", value: "08:00" },
    { label: "17:00", value: "17:00" },
    { label: "18:00", value: "18:00" },
  ];

  // Sugerir próximo horário disponível baseado na hora atual
  const getSuggestedTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Se for manhã (antes das 12h), sugerir horários da tarde
    if (currentHour < 12) {
      return "14:00";
    }
    // Se for tarde, sugerir próximo horário comercial
    else if (currentHour < 17) {
      const nextHour = currentHour + 1;
      return `${nextHour.toString().padStart(2, '0')}:00`;
    }
    // Se for final do dia, sugerir próximo dia útil manhã
    else {
      return "09:00";
    }
  };

  const setQuickTime = (timeValue: string) => {
    setTime(timeValue);
    setShowTimePicker(false);
  };

  // Função para mostrar modal personalizado
  const showCustomModal = (type: 'success' | 'error' | 'confirm' | 'alert', title: string, message: string, onConfirm?: () => void) => {
    setModalConfig({
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setShowModal(false))
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty || !selectedClient || !email || !selectedDate || !time) {
      showCustomModal('alert', 'Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    
    try {
      // Combinar data e hora
      const [hours, minutes] = time.split(':');
      const eventDateTime = new Date(selectedDate);
      eventDateTime.setHours(parseInt(hours), parseInt(minutes));

      await onSubmit({
        propertyId: selectedProperty,
        clientId: selectedClient,
        email,
        date: eventDateTime,
        time,
        type: eventType,
        corretor: selectedCorretor
      });

      // Mostrar sucesso e resetar formulário
      const resetForm = () => {
        setSelectedProperty("");
        setSelectedClient("");
        setEmail("");
        setSelectedDate(undefined);
        setTime("");
        setEventType("Visita");
        setSelectedCorretor("aleatorio");
        setShowDatePicker(false);
        setShowTimePicker(false);
        onClose();
      };

      showCustomModal(
        'success', 
        'Evento Criado! 🎉', 
        'Evento criado com sucesso no Google Calendar!',
        resetForm
      );
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      
      // Verificar se é erro de rede ou do webhook
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('fetch')) {
        showCustomModal('error', 'Erro de Conexão', 'Verifique sua internet e tente novamente.');
      } else if (errorMessage.includes('404') || errorMessage.includes('500')) {
        showCustomModal('alert', 'Serviço Indisponível', 'Serviço temporariamente indisponível. O evento foi salvo localmente.');
      } else {
        showCustomModal('error', 'Erro ao Criar Evento', `Erro: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Adicionar Evento na Agenda
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Evento */}
          <div className="space-y-2">
            <Label htmlFor="eventType" className="text-gray-300">
              Tipo de Evento
            </Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="Visita">Visita</SelectItem>
                <SelectItem value="Avaliação">Avaliação</SelectItem>
                <SelectItem value="Apresentação">Apresentação</SelectItem>
                <SelectItem value="Vistoria">Vistoria</SelectItem>
                <SelectItem value="Reunião">Reunião</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Imóvel */}
          <div className="space-y-2">
            <Label htmlFor="property" className="text-gray-300">
              Imóvel <span className="text-red-400">*</span>
            </Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-gray-300">
              Cliente <span className="text-red-400">*</span>
            </Label>
            <Select value={selectedClient} onValueChange={handleClientChange}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.email && `(${client.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Data e Hora - Seção Modernizada */}
          <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              <Label className="text-gray-300 font-medium">
                Data e Horário <span className="text-red-400">*</span>
              </Label>
            </div>

            {/* Seleção de Data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Data do evento</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  {showDatePicker ? "Ocultar calendário" : "Ver calendário"}
                </Button>
              </div>

              {/* Atalhos rápidos de data */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(0)}
                  className={cn(
                    "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-all",
                    selectedDate && selectedDate.toDateString() === new Date().toDateString() && 
                    "bg-blue-600 border-blue-500 text-white"
                  )}
                >
                  🌅 Hoje
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(1)}
                  className={cn(
                    "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-all",
                    selectedDate && selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString() && 
                    "bg-blue-600 border-blue-500 text-white"
                  )}
                >
                  🌄 Amanhã
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(2)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  📅 Em 2 dias
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(7)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  🗓️ Próxima semana
                </Button>
              </div>

              {/* Data selecionada */}
              {selectedDate && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 font-medium">
                      {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              )}

              {/* Calendário expandido */}
              {showDatePicker && (
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </div>
              )}
            </div>

            {/* Seleção de Horário */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Horário do evento</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  {showTimePicker ? "Ocultar horários" : "Ver mais horários"}
                </Button>
              </div>

              {/* Sugestão inteligente */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span className="text-yellow-300 text-sm font-medium">
                      Sugestão: {getSuggestedTime()}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickTime(getSuggestedTime())}
                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  >
                    Usar sugestão
                  </Button>
                </div>
              </div>

              {/* Horários rápidos populares */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Horários mais populares</span>
                <div className="grid grid-cols-3 gap-2">
                  {commonTimes.slice(0, 6).map((timeOption) => (
                    <Button
                      key={timeOption.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickTime(timeOption.value)}
                      className={cn(
                        "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-all relative",
                        time === timeOption.value && "bg-blue-600 border-blue-500 text-white",
                        timeOption.popular && "border-green-500/30"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span>🕐 {timeOption.label}</span>
                        {timeOption.popular && (
                          <span className="text-xs text-green-400">⭐</span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Mais horários */}
              {showTimePicker && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-700">
                  {commonTimes.slice(6).map((timeOption) => (
                    <Button
                      key={timeOption.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickTime(timeOption.value)}
                      className={cn(
                        "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-all",
                        time === timeOption.value && "bg-blue-600 border-blue-500 text-white"
                      )}
                    >
                      🕐 {timeOption.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input personalizado de horário */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Ou escolha um horário personalizado"
                  className="bg-gray-700 border-gray-600 text-white pl-10"
                />
              </div>

              {/* Horário selecionado */}
              {time && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 font-medium">
                      Horário selecionado: {time}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo do agendamento */}
            {selectedDate && time && (
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">
                      Agendamento confirmado para:
                    </div>
                    <div className="text-green-300 text-sm">
                      📅 {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {time}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de Corretor */}
          <div className="space-y-2">
            <Label htmlFor="corretor" className="text-gray-300">
              Corretor
            </Label>
            <Select value={selectedCorretor} onValueChange={setSelectedCorretor}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione um corretor" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="aleatorio" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎲</span>
                    <span>Aleatório (sistema escolhe)</span>
                  </div>
                </SelectItem>
                <SelectItem value="Isis" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👩‍💼</span>
                    <span>Isis - Corretora</span>
                  </div>
                </SelectItem>
                <SelectItem value="Arthur" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👨‍💼</span>
                    <span>Arthur - Corretor</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Indicador visual do corretor selecionado */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${
                selectedCorretor === 'aleatorio' ? 'bg-yellow-500' :
                selectedCorretor === 'Isis' ? 'bg-pink-500' :
                selectedCorretor === 'Arthur' ? 'bg-indigo-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-400">
                {selectedCorretor === 'aleatorio' ? 'Sistema escolherá automaticamente' :
                 selectedCorretor === 'Isis' ? 'Evento será atribuído à Isis' :
                 selectedCorretor === 'Arthur' ? 'Evento será atribuído ao Arthur' :
                 'Corretor selecionado'}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando no Google Calendar...
                </div>
              ) : (
                "Criar Evento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Modal personalizado para substituir alerts */}
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />
    </Dialog>
  );
} 