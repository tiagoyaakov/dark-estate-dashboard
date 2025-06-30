import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  RefreshCw, 
  QrCode, 
  MessageCircle, 
  Users, 
  Signal,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  MoreVertical,
  Zap,
  TrendingUp,
  Eye,
  Monitor,
  User,
  Crown,
  Shield,
  Filter,
  Search,
  Activity,
  Wifi,
  WifiOff,
  RotateCcw,
  Check
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWhatsAppInstances, WhatsAppInstance } from '@/hooks/useWhatsAppInstances';
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

export function ConnectionsViewSimplified() {
  const { profile, isManager } = useUserProfile();
  const { 
    instances, 
    loading, 
    error, 
    createInstance, 
    updateInstanceStatus,
    deleteInstance,
    generateQrCode,
    getInstanceStats,
    loadAllUsers,
    refreshInstances,
    canCreateInstances,
    configureInstance,
    editInstanceConfig
  } = useWhatsAppInstances();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [newInstancePhone, setNewInstancePhone] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string>("self");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [showSystemAlert, setShowSystemAlert] = useState(false);
  
  // Novos estados para funcionalidades completas
  const [qrTimer, setQrTimer] = useState(15);
  const [qrExpired, setQrExpired] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [connectedInstanceName, setConnectedInstanceName] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConfigInstance, setSelectedConfigInstance] = useState<WhatsAppInstance | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [instanceConfig, setInstanceConfig] = useState<any>(null);
  const [configFields, setConfigFields] = useState({
    rejectCall: false,
    msgCall: '',
    groupsIgnore: false,
    alwaysOnline: false,
    readMessages: false,
    readStatus: false
  });

  // Filtrar instâncias
  const filteredInstances = instances.filter(instance => {
    const matchesSearch = instance.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || instance.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Obter estatísticas
  const stats = getInstanceStats();

  // Carregar usuários quando modal abrir (apenas para gestores)
  useEffect(() => {
    if (showAddModal && canCreateInstances) {
      loadAllUsers().then(users => {
        setAvailableUsers(users);
      });
    }
  }, [showAddModal, canCreateInstances]);

  // Timer do QR Code (15 segundos)
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (showQrModal && qrCode && !qrExpired) {
      setQrTimer(15); // Reset timer when modal opens
      timerInterval = setInterval(() => {
        setQrTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setQrExpired(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [showQrModal, qrCode, qrExpired]);

  // Monitorar conexão quando QR code modal estiver aberto
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (showQrModal && selectedInstance && !qrExpired) {
      // Verificar status a cada 2 segundos
      intervalId = setInterval(async () => {
        await refreshInstances();
        
        // Procurar a instância selecionada na lista atualizada
        const currentInstance = instances.find(inst => inst.id === selectedInstance.id);
        
        if (currentInstance && currentInstance.status === 'connected') {
          console.log('✅ Instância conectada com sucesso:', currentInstance.instance_name);
          
          // Fechar modal QR e mostrar sucesso
          setShowQrModal(false);
          setQrCode(null);
          setQrTimer(15);
          setQrExpired(false);
          setConnectedInstanceName(currentInstance.profile_name || currentInstance.instance_name);
          setShowSuccessModal(true);
          
          // Fechar modal de sucesso após 3 segundos
          setTimeout(() => {
            setShowSuccessModal(false);
          }, 3000);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [showQrModal, selectedInstance, qrExpired, instances]);

  // Criar nova instância
  const handleCreateInstance = async () => {
    try {
      setCreating(true);
      
      if (!newInstanceName.trim()) {
        throw new Error('Nome da instância é obrigatório');
      }

      if (!newInstancePhone.trim()) {
        throw new Error('Número de telefone é obrigatório para criar a instância');
      }

      const result = await createInstance({
        instance_name: newInstanceName,
        phone_number: newInstancePhone,
        assigned_user_id: assignedUserId === "self" ? undefined : assignedUserId
      });

      setNewInstanceName("");
      setNewInstancePhone("");
      setAssignedUserId("self");
      setShowAddModal(false);

      // Mostrar alerta explicativo se a instância foi criada localmente mas não conectada ao sistema externo
      if (result && !result.api_key) {
        setShowSystemAlert(true);
      }
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Simular conexão (atualizar status)
  const handleConnect = async (instance: WhatsAppInstance) => {
    try {
      await updateInstanceStatus(instance.id, 'connected');
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  // Simular desconexão
  const handleDisconnect = async (instance: WhatsAppInstance) => {
    try {
      await updateInstanceStatus(instance.id, 'disconnected');
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  // Deletar instância
  const handleDeleteInstance = async (instanceId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta instância?')) {
      try {
        await deleteInstance(instanceId);
      } catch (error: any) {
        console.error('Erro ao deletar instância:', error);
        alert(`Erro: ${error.message}`);
      }
    }
  };

  // Gerar QR Code
  const handleGenerateQrCode = async (instance: WhatsAppInstance) => {
    try {
      setGeneratingQr(true);
      setSelectedInstance(instance);
      
      const qrCodeData = await generateQrCode(instance.id);
      
      if (qrCodeData) {
        setQrCode(qrCodeData);
        setQrTimer(15); // Reset timer
        setQrExpired(false); // Reset expired state
        setShowQrModal(true);
      } else {
        alert('Não foi possível gerar o QR code');
      }
    } catch (error: any) {
      console.error('Erro ao gerar QR code:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setGeneratingQr(false);
    }
  };

  // Retry QR Code quando expirado
  const handleRetryQrCode = async () => {
    if (selectedInstance) {
      setQrExpired(false);
      await handleGenerateQrCode(selectedInstance);
    }
  };

  // Configurar instância
  const handleShowConfig = async (instance: WhatsAppInstance) => {
    setSelectedConfigInstance(instance);
    setShowConfigModal(true);
    setLoadingConfig(true);
    setInstanceConfig(null);

    try {
      const result = await configureInstance(instance.instance_name, {
        instanceName: instance.instance_name,
        instanceId: instance.id
      });

      if (result && result.success && result.data) {
        const configData = Array.isArray(result.data) && result.data[0]?.Setting ? 
          result.data[0].Setting : result.data;
        
        setInstanceConfig(configData);
        
        // Atualizar campos com os dados recebidos
        if (configData) {
          setConfigFields({
            rejectCall: Boolean(configData.rejectCall),
            msgCall: String(configData.msgCall || ''),
            groupsIgnore: Boolean(configData.groupsIgnore),
            alwaysOnline: Boolean(configData.alwaysOnline),
            readMessages: Boolean(configData.readMessages),
            readStatus: Boolean(configData.readStatus)
          });
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar configurações:', error);
      alert('Erro ao carregar configurações. Tente novamente.');
    } finally {
      setLoadingConfig(false);
    }
  };

  // Salvar configurações
  const handleSaveConfig = async () => {
    if (!selectedConfigInstance) return;

    try {
      setSavingConfig(true);
      
      await editInstanceConfig(selectedConfigInstance.instance_name, {
        instanceName: selectedConfigInstance.instance_name,
        instanceId: selectedConfigInstance.id,
        config: configFields
      });
      
      setShowConfigModal(false);
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Componente para exibir instância
  const InstanceCard = ({ instance }: { instance: WhatsAppInstance }) => {
    const statusConfig = {
      connected: { 
        color: 'bg-green-500', 
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        icon: CheckCircle,
        text: 'Conectado',
        description: 'Online e funcionando'
      },
      disconnected: { 
        color: 'bg-red-500', 
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: XCircle,
        text: 'Desconectado',
        description: 'Offline - clique para conectar'
      },
      connecting: { 
        color: 'bg-yellow-500', 
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        icon: Clock,
        text: 'Conectando',
        description: 'Estabelecendo conexão...'
      },
      qr_code: { 
        color: 'bg-blue-500', 
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        icon: QrCode,
        text: 'QR Code',
        description: 'Escaneie o QR Code'
      },
      error: { 
        color: 'bg-red-600', 
        textColor: 'text-red-400',
        bgColor: 'bg-red-600/10',
        borderColor: 'border-red-600/30',
        icon: AlertTriangle,
        text: 'Erro',
        description: 'Problema na conexão'
      }
    }[instance.status];

    const StatusIcon = statusConfig.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className={`bg-gray-800/60 backdrop-blur-sm border-gray-700 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50 ${statusConfig.borderColor}`}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar/Foto de Perfil */}
                <div className="relative">
                  {instance.profile_pic_url ? (
                    <div className="relative">
                      <img 
                        src={instance.profile_pic_url} 
                        alt={instance.profile_name || instance.instance_name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-600"
                        onError={(e) => {
                          // Fallback para ícone se a imagem falhar
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {/* Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${statusConfig.color} border-2 border-gray-800 flex items-center justify-center`}>
                    {instance.status === 'connecting' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="h-2 w-2 border border-white border-t-transparent rounded-full"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Nome da Instância */}
                  <CardTitle className="text-white text-xl font-bold truncate">
                    {instance.instance_name}
                  </CardTitle>
                  
                  {/* Nome do Perfil WhatsApp */}
                  {instance.profile_name && (
                    <p className="text-gray-300 text-sm font-medium truncate mt-1">
                      {instance.profile_name}
                    </p>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${statusConfig.textColor} ${statusConfig.bgColor} border-current`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.text}
                    </Badge>
                    
                    {/* Badge do Usuário (apenas para gestores) */}
                    {isManager && instance.user_profile && (
                      <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <Crown className="h-3 w-3 mr-1" />
                        {instance.user_profile.full_name || 'Usuário'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Descrição do Status */}
                  <p className="text-gray-400 text-xs mt-1">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
              
              {/* Menu de ações rápidas no canto superior direito */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-700/50"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => handleGenerateQrCode(instance)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerar QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleShowConfig(instance)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteInstance(instance.id)}
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Instância
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Informações de Contato */}
              {instance.phone_number && (
                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{instance.phone_number}</p>
                    <p className="text-gray-400 text-xs">Número vinculado</p>
                  </div>
                </div>
              )}

              {/* Última Atividade */}
              {instance.last_seen && (
                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {new Date(instance.last_seen).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-gray-400 text-xs">Última atividade</p>
                  </div>
                </div>
              )}
              
              {/* Estatísticas em Grid Melhorado */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3 text-center group cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-500/30 transition-colors">
                    <MessageCircle className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-white font-bold text-lg">
                    {instance.message_count.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-400 text-xs">Mensagens</div>
                  {instance.message_count > 1000 && (
                    <Badge variant="outline" className="mt-1 text-xs text-blue-400 border-blue-500/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Alto volume
                    </Badge>
                  )}
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3 text-center group cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-500/30 transition-colors">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-white font-bold text-lg">
                    {instance.contact_count.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-400 text-xs">Contatos</div>
                  {instance.contact_count > 500 && (
                    <Badge variant="outline" className="mt-1 text-xs text-purple-400 border-purple-500/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Rede ampla
                    </Badge>
                  )}
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-3 text-center group cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-green-500/30 transition-colors">
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-white font-bold text-lg">
                    {instance.chat_count.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-gray-400 text-xs">Chats</div>
                  {instance.chat_count > 100 && (
                    <Badge variant="outline" className="mt-1 text-xs text-green-400 border-green-500/30">
                      <Zap className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </motion.div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateQrCode(instance)}
                  disabled={generatingQr}
                  className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {generatingQr ? 'Gerando...' : 'QR Code'}
                </Button>

                {instance.status === 'disconnected' ? (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(instance)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Conectar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDisconnect(instance)}
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShowConfig(instance)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Smartphone className="h-8 w-8 text-blue-400" />
        </motion.div>
        <p className="ml-3 text-gray-400">Carregando conexões...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Conexões WhatsApp
            {isManager && <span className="text-sm text-gray-400 ml-2">(Visão Gestor)</span>}
          </h1>
          <p className="text-gray-400">
            {isManager ? 
              'Gerencie todas as conexões WhatsApp da equipe' : 
              'Gerencie suas conexões WhatsApp pessoais'
            }
          </p>
        </div>
        
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Button 
            variant="outline"
            onClick={refreshInstances}
            className="border-blue-600/50 text-blue-400 hover:bg-blue-600/20 backdrop-blur-sm bg-gray-900/50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          {canCreateInstances ? (
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Conexão
            </Button>
          ) : (
            <Button 
              variant="outline"
              disabled
              className="border-gray-600 text-gray-400 cursor-not-allowed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Apenas Gestores
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Alert */}
      {showSystemAlert && (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-200">
            <strong>Sistema Híbrido:</strong> A instância foi criada localmente com sucesso! 
            O sistema externo WhatsApp pode estar temporariamente indisponível, mas você pode 
            tentar gerar o QR code quando precisar conectar.
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-6 px-2 text-orange-200 hover:bg-orange-500/20"
              onClick={() => setShowSystemAlert(false)}
            >
              Entendi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {[
          { title: "Total Instâncias", value: stats.total_instances, icon: Smartphone, color: "text-blue-400" },
          { title: "Conectadas", value: stats.connected_instances, icon: Wifi, color: "text-green-400" },
          { title: "Chats Ativos", value: stats.total_chats, icon: MessageCircle, color: "text-purple-400" },
          { title: "Mensagens", value: stats.total_messages, icon: Activity, color: "text-orange-400" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60 hover:bg-gray-800/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-700/50">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </motion.div>

      {/* Instances Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredInstances.map((instance, index) => (
          <motion.div
            key={instance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <InstanceCard instance={instance} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredInstances.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60">
            <CardContent className="p-12 text-center">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma conexão encontrada</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'Não encontramos conexões com os critérios de busca.' : 
                 canCreateInstances ? 'Nenhuma conexão foi criada ainda.' :
                 'Você ainda não possui conexões WhatsApp atribuídas.'}
              </p>
              {canCreateInstances ? (
                <Button 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Conexão
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Apenas gestores podem criar conexões</p>
                  <Button 
                    variant="outline"
                    disabled
                    className="border-gray-600 text-gray-400 cursor-not-allowed"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar ao Gestor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal Adicionar Instância */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-gray-900/95 border-gray-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {canCreateInstances ? 'Nova Conexão WhatsApp' : 'Conexão WhatsApp'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {canCreateInstances 
                ? 'Crie uma nova instância e atribua para um corretor'
                : 'Solicite ao seu gestor para criar uma nova conexão'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="instanceName" className="text-gray-300">Nome da Instância *</Label>
              <Input
                id="instanceName"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                placeholder="Ex: João - WhatsApp Principal"
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instancePhone" className="text-gray-300">Número de Telefone *</Label>
              <Input
                id="instancePhone"
                value={newInstancePhone}
                onChange={(e) => setNewInstancePhone(e.target.value)}
                placeholder="Ex: +55 11 99999-9999"
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-500">
                Número que será usado para conectar ao WhatsApp
              </p>
            </div>
            
            {canCreateInstances && (
              <div className="space-y-2">
                <Label htmlFor="assignedUser" className="text-gray-300">Atribuir Para *</Label>
                <Select
                  value={assignedUserId}
                  onValueChange={setAssignedUserId}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Atribuir instância para..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="self" className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        Eu mesmo (Gestor)
                      </div>
                    </SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-gray-300">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' && <Shield className="h-4 w-4 text-red-500" />}
                          {user.role === 'gestor' && <Crown className="h-4 w-4 text-yellow-500" />}
                          {user.role === 'corretor' && <User className="h-4 w-4 text-blue-500" />}
                          <span className="flex-1">{user.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  A instância será atribuída ao usuário selecionado
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {canCreateInstances ? 'Cancelar' : 'Fechar'}
            </Button>
            {canCreateInstances && (
              <Button
                onClick={handleCreateInstance}
                disabled={creating || !newInstanceName.trim() || !newInstancePhone.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Criando...' : 'Criar Instância'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal QR Code */}
      <Dialog open={showQrModal} onOpenChange={(open) => {
        setShowQrModal(open);
        if (!open) {
          setQrCode(null);
          setQrTimer(15);
          setQrExpired(false);
          setSelectedInstance(null);
        }
      }}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50 text-white max-w-md overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white">QR Code - {selectedInstance?.instance_name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Escaneie o QR code com seu WhatsApp para conectar
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {qrExpired ? (
              // Tela de erro por timeout
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-red-700/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/50">
                  <Clock className="h-12 w-12 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  QR Code Expirado
                </h3>
                <p className="text-gray-300 mb-6">
                  O tempo limite de 15 segundos foi atingido. Tente gerar um novo QR Code.
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQrModal(false);
                      setQrCode(null);
                      setQrTimer(15);
                      setQrExpired(false);
                    }}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleRetryQrCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : qrCode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="flex flex-col items-center space-y-6"
              >
                {/* QR Code com efeito visual */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl animate-pulse"></div>
                  <div className="relative bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
                    <img 
                      src={qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-56 h-56 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center p-8 text-gray-500">
                      <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>QR Code não pôde ser carregado</p>
                    </div>
                  </div>
                  
                  {/* Logo WhatsApp no canto */}
                  <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full shadow-lg">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2">
                  <Clock className={`h-5 w-5 ${qrTimer <= 5 ? 'text-red-400' : 'text-blue-400'}`} />
                  <span className={`text-lg font-bold ${qrTimer <= 5 ? 'text-red-400' : 'text-blue-400'}`}>
                    {qrTimer}s
                  </span>
                  <div className="flex items-center gap-2 text-xs text-blue-400 ml-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Aguardando conexão...</span>
                  </div>
                </div>
                
                {/* Instruções passo a passo */}
                <div className="w-full max-w-sm">
                  <h4 className="text-lg font-semibold text-white mb-4 text-center flex items-center justify-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-400" />
                    Como conectar
                  </h4>
                  
                  <div className="space-y-3">
                    {[
                      { icon: Phone, text: "Abra o WhatsApp no seu celular", color: "text-blue-400" },
                      { icon: Settings, text: "Toque em Menu ou Configurações", color: "text-purple-400" },
                      { icon: Monitor, text: 'Toque em "Aparelhos conectados"', color: "text-yellow-400" },
                      { icon: QrCode, text: "Escaneie este código QR", color: "text-green-400" }
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.3 }}
                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                      >
                        <div className={`h-8 w-8 rounded-full bg-gray-700/50 flex items-center justify-center ${step.color}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-300 bg-gray-700/50 px-2 py-1 rounded text-center min-w-[20px]">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-300">{step.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleGenerateQrCode(selectedInstance!)}
                    disabled={generatingQr}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${generatingQr ? 'animate-spin' : ''}`} />
                    {generatingQr ? 'Gerando novo QR...' : 'Atualizar QR Code'}
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative h-16 w-16 rounded-full border-4 border-gray-700 border-t-blue-500 mb-6"
                  />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-2">Gerando QR Code</p>
                  <p className="text-gray-400 text-sm">Aguarde alguns segundos...</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowQrModal(false);
                setQrCode(null);
                setQrTimer(15);
                setQrExpired(false);
                setSelectedInstance(null);
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-gray-900/95 border-gray-700/50 text-white max-w-sm">
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-green-600/30 to-green-700/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/50"
            >
              <Check className="h-12 w-12 text-green-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">
              Conectado com Sucesso!
            </h3>
            <p className="text-gray-300 mb-2">
              {connectedInstanceName || 'WhatsApp'} foi conectado com sucesso
            </p>
            <p className="text-sm text-gray-400">
              Esta janela fechará automaticamente...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="bg-gray-900/95 border-gray-700/50 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" />
              Configurações - {selectedConfigInstance?.instance_name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Personalize o comportamento da instância WhatsApp
            </DialogDescription>
          </DialogHeader>

          {loadingConfig ? (
            <div className="py-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Settings className="h-8 w-8 text-blue-400" />
              </motion.div>
              <p className="mt-3 text-gray-400">Carregando configurações...</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Rejeitar Chamadas */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rejectCall" className="text-gray-300">
                    Rejeitar Chamadas
                  </Label>
                  <p className="text-xs text-gray-500">
                    Recusa automaticamente chamadas recebidas
                  </p>
                </div>
                <Switch
                  id="rejectCall"
                  checked={configFields.rejectCall}
                  onCheckedChange={(checked) => 
                    setConfigFields(prev => ({ ...prev, rejectCall: checked }))
                  }
                />
              </div>

              {/* Mensagem de Chamada */}
              {configFields.rejectCall && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-500/30">
                  <Label htmlFor="msgCall" className="text-gray-300">
                    Mensagem ao Rejeitar Chamada
                  </Label>
                  <Textarea
                    id="msgCall"
                    value={configFields.msgCall}
                    onChange={(e) => 
                      setConfigFields(prev => ({ ...prev, msgCall: e.target.value }))
                    }
                    placeholder="Ex: Estou ocupado no momento..."
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>
              )}

              {/* Ignorar Grupos */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="groupsIgnore" className="text-gray-300">
                    Ignorar Grupos
                  </Label>
                  <p className="text-xs text-gray-500">
                    Não recebe mensagens de grupos
                  </p>
                </div>
                <Switch
                  id="groupsIgnore"
                  checked={configFields.groupsIgnore}
                  onCheckedChange={(checked) => 
                    setConfigFields(prev => ({ ...prev, groupsIgnore: checked }))
                  }
                />
              </div>

              {/* Sempre Online */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="alwaysOnline" className="text-gray-300">
                    Sempre Online
                  </Label>
                  <p className="text-xs text-gray-500">
                    Aparece sempre como online
                  </p>
                </div>
                <Switch
                  id="alwaysOnline"
                  checked={configFields.alwaysOnline}
                  onCheckedChange={(checked) => 
                    setConfigFields(prev => ({ ...prev, alwaysOnline: checked }))
                  }
                />
              </div>

              {/* Ler Mensagens */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="readMessages" className="text-gray-300">
                    Marcar como Lida
                  </Label>
                  <p className="text-xs text-gray-500">
                    Marca mensagens como lidas automaticamente
                  </p>
                </div>
                <Switch
                  id="readMessages"
                  checked={configFields.readMessages}
                  onCheckedChange={(checked) => 
                    setConfigFields(prev => ({ ...prev, readMessages: checked }))
                  }
                />
              </div>

              {/* Ler Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="readStatus" className="text-gray-300">
                    Ver Status
                  </Label>
                  <p className="text-xs text-gray-500">
                    Visualiza status automaticamente
                  </p>
                </div>
                <Switch
                  id="readStatus"
                  checked={configFields.readStatus}
                  onCheckedChange={(checked) => 
                    setConfigFields(prev => ({ ...prev, readStatus: checked }))
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowConfigModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={savingConfig || loadingConfig}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50"
            >
              {savingConfig ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 