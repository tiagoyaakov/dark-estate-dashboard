import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  DollarSign,
  User,
  Building2,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Sparkles,
  Zap,
  Shield,
  Key,
  Home,
  Building,
  MapPin,
  Upload,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractTemplateUpload } from "@/components/ContractTemplateUpload";
import { ContractTemplatesList } from "@/components/ContractTemplatesList";
import { NewContractModal } from './NewContractModal';
import MissingDataModal from './MissingDataModal';
import { PdfViewerModal } from './PdfViewerModal';
import { useContracts } from '@/hooks/useContracts';
import { toast } from 'sonner';

// Componente para as partículas flutuantes
const FloatingParticle = ({ delay = 0, duration = 20, type = 'default' }) => {
  const particleVariants = {
    default: "w-2 h-2 bg-blue-400/20 rounded-full",
    star: "w-1 h-1 bg-yellow-400/30 rounded-full",
    spark: "w-0.5 h-4 bg-purple-400/40 rounded-full",
    glow: "w-3 h-3 bg-emerald-400/25 rounded-full blur-sm"
  };

  return (
    <motion.div
      className={`absolute ${particleVariants[type]}`}
      initial={{ 
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
        opacity: 0,
        scale: 0
      }}
      animate={{
        y: -50,
        opacity: [0, 1, 0.8, 0],
        scale: [0, 1, 1.2, 0],
        rotate: 360
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Componente para luzes pulsantes
const PulsingLights = () => (
  <div className="absolute inset-0 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${20 + Math.random() * 40}px`,
          height: `${20 + Math.random() * 40}px`,
        }}
        animate={{
          opacity: [0, 0.3, 0],
          scale: [0.5, 1.5, 0.5],
          background: [
            "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)"
          ]
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          delay: i * 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Componente para efeito de vidro quebrado
const GlassShards = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${30 + Math.random() * 60}px`,
          height: `${30 + Math.random() * 60}px`,
          clipPath: "polygon(30% 0%, 0% 50%, 30% 100%, 100% 70%, 70% 30%)",
          transform: `rotate(${Math.random() * 360}deg)`
        }}
        animate={{
          opacity: [0, 0.4, 0],
          rotate: [0, 180, 360],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 8 + Math.random() * 6,
          delay: i * 0.7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Componente para os ícones flutuantes
const FloatingIcon = ({ Icon, delay = 0, x = 0, y = 0, color = "blue" }) => {
  const colorVariants = {
    blue: "text-blue-300/10",
    purple: "text-purple-300/10",
    emerald: "text-emerald-300/10",
    yellow: "text-yellow-300/10",
    pink: "text-pink-300/10"
  };

  return (
    <motion.div
      className={`absolute ${colorVariants[color]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: [0, 0.4, 0],
        scale: [0, 1.2, 0],
        rotate: [0, 360, 720],
        y: [-30, 30, -30],
        x: [-10, 10, -10]
      }}
      transition={{
        duration: 10 + Math.random() * 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon size={35 + Math.random() * 20} />
    </motion.div>
  );
};

// Componente para o grid arquitetônico
const ArchitecturalGrid = () => (
  <div className="absolute inset-0 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full">
      <defs>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <motion.path
            d="M 80 0 L 0 0 0 80"
            fill="none"
            stroke="rgba(59, 130, 246, 0.08)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.circle
            cx="40"
            cy="40"
            r="2"
            fill="rgba(147, 51, 234, 0.1)"
            animate={{
              r: [1, 4, 1],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </pattern>
        
        <pattern id="hexGrid" width="100" height="87" patternUnits="userSpaceOnUse">
          <motion.polygon
            points="50,0 93.3,25 93.3,62 50,87 6.7,62 6.7,25"
            fill="none"
            stroke="rgba(16, 185, 129, 0.06)"
            strokeWidth="1"
            animate={{
              opacity: [0, 0.2, 0],
              strokeWidth: [0.5, 2, 0.5]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#hexGrid)" opacity="0.5" />
    </svg>

    {/* Formas geométricas arquitetônicas */}
    <motion.div
      className="absolute top-20 left-10 border border-blue-400/20"
      style={{ width: "120px", height: "120px" }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ 
        opacity: [0, 0.4, 0],
        scale: [0, 1.1, 0],
        rotate: [0, 180, 360],
        borderRadius: ["0%", "50%", "0%"]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <motion.div
      className="absolute bottom-20 right-10 border-2 border-emerald-400/20"
      style={{ width: "80px", height: "140px" }}
      initial={{ opacity: 0, y: 50, skewY: 0 }}
      animate={{ 
        opacity: [0, 0.5, 0],
        y: [50, -20, 50],
        skewY: [-5, 5, -5],
        borderColor: [
          "rgba(16, 185, 129, 0.2)",
          "rgba(59, 130, 246, 0.2)",
          "rgba(147, 51, 234, 0.2)",
          "rgba(16, 185, 129, 0.2)"
        ]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Removido mockContracts - agora usando dados reais do banco

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ativo':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50';
    case 'Pendente':
      return 'bg-purple-500/20 text-purple-300 border-purple-400/50';
    case 'Vencendo':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50';
    case 'Expirado':
      return 'bg-slate-500/20 text-slate-300 border-slate-400/50';
    case 'Cancelado':
      return 'bg-slate-500/20 text-slate-300 border-slate-400/50';
    default:
      return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Ativo':
      return CheckCircle;
    case 'Pendente':
      return Clock;
    case 'Vencendo':
      return AlertCircle;
    case 'Expirado':
      return XCircle;
    case 'Cancelado':
      return XCircle;
    default:
      return FileText;
  }
};

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'Locação':
      return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
    case 'Venda':
      return 'bg-violet-500/20 text-violet-300 border-violet-400/50';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-400/50';
  }
};

export function ContractsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('todos');
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showTemplateUploadModal, setShowTemplateUploadModal] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  
  // Hook para gerenciar contratos
  const { contracts, loading, createContract, deleteContract, generateContractNumber, calculateNextDueDate } = useContracts();
  
  // Estados para o MissingDataModal
  const [showMissingDataModal, setShowMissingDataModal] = useState(false);
  const [missingData, setMissingData] = useState<Record<string, any>>({});
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [contractProcessingData, setContractProcessingData] = useState<any>(null);
  
  // Estados para funcionalidades dos botões
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Gerar partículas
  useEffect(() => {
    const particleArray = Array.from({ length: 20 }, (_, i) => i);
    setParticles(particleArray);
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.property_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === 'todos' || 
                      (selectedTab === 'ativos' && contract.status === 'Ativo') ||
                      (selectedTab === 'pendentes' && contract.status === 'Pendente') ||
                      (selectedTab === 'vencendo' && contract.status === 'Vencendo') ||
                      (selectedTab === 'expirados' && contract.status === 'Expirado') ||
                      (selectedTab === 'locacao' && contract.tipo === 'Locação') ||
                      (selectedTab === 'venda' && contract.tipo === 'Venda');

    return matchesSearch && matchesTab;
  });

  const particleTypes = ['default', 'star', 'spark', 'glow'];

  const handleNewContract = (contractData: any) => {
    console.log('Novo contrato criado:', contractData);
    // Fechar o modal após sucesso
    setShowNewContractModal(false);
  };

  const handleMissingDataRequired = (missing: Record<string, any>, templateName: string, processingData: any) => {
    console.log('🔔 Dados faltantes detectados no componente pai');
    setMissingData(missing);
    setSelectedTemplateName(templateName);
    setContractProcessingData(processingData);
    setShowNewContractModal(false); // Fechar modal principal
    setShowMissingDataModal(true); // Abrir modal de dados faltantes
  };

  const handleMissingDataSubmit = async (additionalData: Record<string, any>) => {
    console.log('📝 Dados adicionais coletados:', additionalData);
    setShowMissingDataModal(false);
    
    if (!contractProcessingData) {
      console.error('❌ Dados de processamento não encontrados');
      return;
    }

    try {
      const { client, property, template, templateBlob, placeholders } = contractProcessingData;
      
      // Mesclar dados existentes com dados adicionais coletados
      console.log('🔄 Mesclando dados coletados:', additionalData);
      const completeContractData = {
        client: {
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          cpf: additionalData.client?.cpf || '',
          address: additionalData.client?.address || '',
          nationality: additionalData.client?.nationality || '',
          marital_status: additionalData.client?.marital_status || '',
        },
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          property_type: property.property_type,
          area: property.area,
          price: property.price,
          description: property.description,
          city: additionalData.property?.city || '',
          state: additionalData.property?.state || '',
          zip_code: additionalData.property?.zip_code || '',
        },
        template: {
          id: template.id,
          name: template.name,
          file_name: template.file_name,
          file_path: template.file_path,
          file_type: template.file_type || ''
        },
        landlord: {
          id: '',
          name: additionalData.landlord?.name || '',
          email: additionalData.landlord?.email || '',
          phone: additionalData.landlord?.phone || '',
          cpf: additionalData.landlord?.cpf || '',
          address: additionalData.landlord?.address || '',
          nationality: additionalData.landlord?.nationality || '',
          marital_status: additionalData.landlord?.marital_status || '',
        },
        guarantor: {
          id: '',
          name: additionalData.guarantor?.name || '',
          email: additionalData.guarantor?.email || '',
          phone: additionalData.guarantor?.phone || '',
          cpf: additionalData.guarantor?.cpf || '',
          address: additionalData.guarantor?.address || '',
          nationality: additionalData.guarantor?.nationality || '',
          marital_status: additionalData.guarantor?.marital_status || '',
        },
        contractDate: new Date(),
        contractDuration: additionalData.contract?.contractDuration || '',
        paymentDay: additionalData.contract?.paymentDay || '',
        paymentMethod: additionalData.contract?.paymentMethod || '',
        contractCity: additionalData.contract?.contractCity || '',
      };

      console.log('✅ Dados completos preparados, processando contrato...');
      
      // Processar o contrato
      const { processContract } = await import('@/utils/contractProcessor');
      const { blob: pdfBlob, fileName } = await processContract(completeContractData);

      // Criar URL para download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('🎉 Contrato gerado e baixado com sucesso!');
      
      // Salvar contrato no banco de dados
      const contractNumber = generateContractNumber();
      const nextDueDate = calculateNextDueDate(
        new Date().toISOString().split('T')[0], 
        additionalData.contract?.paymentDay || ''
      );

      const contractToSave = {
        numero: contractNumber,
        tipo: (property.property_type === 'Apartamento' || property.property_type === 'Casa' ? 'Locação' : 'Venda') as 'Locação' | 'Venda',
        status: 'Ativo' as 'Ativo' | 'Pendente' | 'Vencendo' | 'Expirado' | 'Cancelado',
        client_id: client.id,
        client_name: client.name,
        client_email: client.email || '',
        client_phone: client.phone || '',
        client_cpf: additionalData.client?.cpf || '',
        client_address: additionalData.client?.address || '',
        client_nationality: additionalData.client?.nationality || '',
        client_marital_status: additionalData.client?.marital_status || '',
        landlord_name: additionalData.landlord?.name || '',
        landlord_email: additionalData.landlord?.email || '',
        landlord_phone: additionalData.landlord?.phone || '',
        landlord_cpf: additionalData.landlord?.cpf || '',
        landlord_address: additionalData.landlord?.address || '',
        landlord_nationality: additionalData.landlord?.nationality || '',
        landlord_marital_status: additionalData.landlord?.marital_status || '',
        guarantor_name: additionalData.guarantor?.name || '',
        guarantor_email: additionalData.guarantor?.email || '',
        guarantor_phone: additionalData.guarantor?.phone || '',
        guarantor_cpf: additionalData.guarantor?.cpf || '',
        guarantor_address: additionalData.guarantor?.address || '',
        guarantor_nationality: additionalData.guarantor?.nationality || '',
        guarantor_marital_status: additionalData.guarantor?.marital_status || '',
        property_id: property.id,
        property_title: property.title,
        property_address: property.address,
        property_type: property.property_type,
        property_area: property.area || null,
        property_city: additionalData.property?.city || '',
        property_state: additionalData.property?.state || '',
        property_zip_code: additionalData.property?.zip_code || '',
        template_id: template.id,
        template_name: template.name,
        valor: property.price || 0,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: additionalData.contract?.contractDuration ? 
          new Date(Date.now() + parseInt(additionalData.contract.contractDuration) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 ano
        data_assinatura: new Date().toISOString().split('T')[0],
        proximo_vencimento: nextDueDate,
        contract_duration: additionalData.contract?.contractDuration || '',
        payment_day: additionalData.contract?.paymentDay || '',
        payment_method: additionalData.contract?.paymentMethod || '',
        contract_city: additionalData.contract?.contractCity || '',
        contract_file_path: fileName,
        contract_file_name: fileName
      };

      console.log('💾 Salvando contrato no banco:', contractToSave);
      const savedContract = await createContract(contractToSave);
      
      if (savedContract) {
        console.log('✅ Contrato salvo no banco com sucesso:', savedContract);
        toast.success('Contrato gerado, baixado e salvo com sucesso!');
      } else {
        console.warn('⚠️ Contrato gerado mas houve problema ao salvar no banco');
        toast.success('Contrato gerado e baixado com sucesso!');
      }
      
      // Chamar callback de sucesso
      handleNewContract({
        client: completeContractData.client,
        property: completeContractData.property,
        template: template.name
      });

      // Resetar estado
      setMissingData({});
      setSelectedTemplateName('');
      setContractProcessingData(null);

    } catch (error) {
      console.error('💥 Erro ao processar contrato com dados adicionais:', error);
      toast.error('Erro ao processar contrato. Tente novamente.');
    }
  };

  const handleMissingDataClose = () => {
    setShowMissingDataModal(false);
    setMissingData({});
    setSelectedTemplateName('');
    setContractProcessingData(null);
  };

  // Função para visualizar contrato
  const handleViewContract = async (contract: any) => {
    try {
      console.log('👁️ Visualizando contrato:', contract.numero);
      
      if (!contract.numero) {
        toast.error('Dados do contrato incompletos');
        return;
      }

      // Abrir modal de visualização
      setSelectedContract(contract);
      setShowPdfViewerModal(true);
      toast.success('Contrato carregado para visualização');
      
    } catch (error) {
      console.error('❌ Erro ao visualizar contrato:', error);
      toast.error('Erro ao visualizar contrato');
    }
  };

  // Função para baixar PDF do contrato
  const handleDownloadContract = async (contract: any) => {
    if (downloadingId === contract.id) return;
    
    setDownloadingId(contract.id);
    try {
      console.log('⬇️ Baixando contrato:', contract.numero);
      
      if (!contract.numero) {
        toast.error('Dados do contrato incompletos');
        return;
      }

      // Criar um documento HTML mais completo para download
      const pdfContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Contrato_${contract.numero}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #007bff;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #007bff;
              margin: 0;
              font-size: 2em;
            }
            .header h2 {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 1.5em;
            }
            .section {
              margin-bottom: 25px;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: #f9f9f9;
            }
            .section h3 {
              color: #007bff;
              margin: 0 0 15px 0;
              font-size: 1.3em;
            }
            .info { 
              margin-bottom: 12px; 
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .label { 
              font-weight: bold; 
              color: #555;
            }
            .value {
              color: #333;
              text-align: right;
            }
            .status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status.ativo { background: #d4edda; color: #155724; }
            .status.pendente { background: #fff3cd; color: #856404; }
            .status.vencendo { background: #f8d7da; color: #721c24; }
            .financial {
              background: #007bff;
              color: white;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .financial .value {
              font-size: 2em;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CONTRATO ${contract.tipo?.toUpperCase() || 'INDEFINIDO'}</h1>
            <h2>Número: ${contract.numero}</h2>
          </div>
          
          <div class="section">
            <h3>Informações do Cliente</h3>
            <div class="info">
              <span class="label">Nome:</span>
              <span class="value">${contract.client_name || 'Não informado'}</span>
            </div>
            <div class="info">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status ${contract.status?.toLowerCase() || 'pendente'}">${contract.status || 'Pendente'}</span>
              </span>
            </div>
          </div>
          
          <div class="section">
            <h3>Informações da Propriedade</h3>
            <div class="info">
              <span class="label">Título:</span>
              <span class="value">${contract.property_title || 'Não informado'}</span>
            </div>
            <div class="info">
              <span class="label">Endereço:</span>
              <span class="value">${contract.property_address || 'Não informado'}</span>
            </div>
          </div>
          
          <div class="financial">
            <h3>Valor do Contrato</h3>
            <div class="value">R$ ${typeof contract.valor === 'string' ? parseFloat(contract.valor || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : (contract.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          
          <div class="section">
            <h3>Datas Importantes</h3>
            <div class="info">
              <span class="label">Data de Início:</span>
              <span class="value">${contract.data_inicio ? new Date(contract.data_inicio).toLocaleDateString('pt-BR') : 'Não informado'}</span>
            </div>
            <div class="info">
              <span class="label">Data de Fim:</span>
              <span class="value">${contract.data_fim ? new Date(contract.data_fim).toLocaleDateString('pt-BR') : 'Indefinido'}</span>
            </div>
            ${contract.data_assinatura ? `
            <div class="info">
              <span class="label">Data de Assinatura:</span>
              <span class="value">${new Date(contract.data_assinatura).toLocaleDateString('pt-BR')}</span>
            </div>
            ` : ''}
            ${contract.proximo_vencimento ? `
            <div class="info">
              <span class="label">Próximo Vencimento:</span>
              <span class="value">${new Date(contract.proximo_vencimento).toLocaleDateString('pt-BR')}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h3>Detalhes do Contrato</h3>
            <div class="info">
              <span class="label">Tipo:</span>
              <span class="value">${contract.tipo || 'Não informado'}</span>
            </div>
            <div class="info">
              <span class="label">Data de Criação:</span>
              <span class="value">${contract.created_at ? new Date(contract.created_at).toLocaleDateString('pt-BR') + ' às ' + new Date(contract.created_at).toLocaleTimeString('pt-BR') : 'Não informado'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Dashboard Imobiliário - Contratos</strong></p>
            <p>Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>Este é um documento oficial do sistema de contratos.</p>
          </div>
        </body>
        </html>
      `;

      // Converter HTML para Blob e fazer download
      const blob = new Blob([pdfContent], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${contract.numero}_${new Date().toISOString().split('T')[0]}.html`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Contrato baixado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao baixar contrato:', error);
      toast.error('Erro ao baixar contrato');
    } finally {
      setDownloadingId(null);
    }
  };

  // Função para deletar contrato
  const handleDeleteContract = async (contract: any) => {
    if (deletingId === contract.id) return;

    const confirmed = window.confirm(
      `⚠️ CONFIRMAÇÃO DE EXCLUSÃO ⚠️\n\n` +
      `Tem certeza que deseja excluir o contrato?\n\n` +
      `📋 Número: ${contract.numero}\n` +
      `👤 Cliente: ${contract.client_name || 'Não informado'}\n` +
      `🏠 Propriedade: ${contract.property_title || 'Não informado'}\n` +
      `💰 Valor: R$ ${typeof contract.valor === 'string' ? parseFloat(contract.valor || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : (contract.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
      `⚠️ ATENÇÃO: Esta ação não pode ser desfeita!\n\n` +
      `Clique em "OK" para confirmar a exclusão ou "Cancelar" para manter o contrato.`
    );

    if (!confirmed) return;

    setDeletingId(contract.id);
    try {
      console.log('🗑️ Deletando contrato:', contract.numero);
      toast.loading('Excluindo contrato...', { id: 'delete-contract' });
      
      const success = await deleteContract(contract.id);
      
      if (success) {
        toast.success('✅ Contrato excluído com sucesso!', { id: 'delete-contract' });
      } else {
        toast.error('❌ Erro ao excluir contrato', { id: 'delete-contract' });
      }
      
    } catch (error) {
      console.error('❌ Erro ao deletar contrato:', error);
      toast.error('❌ Erro inesperado ao excluir contrato', { id: 'delete-contract' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/90 via-purple-950/80 to-slate-950">
      {/* Background arquitetônico animado */}
      <ArchitecturalGrid />
      
      {/* Luzes pulsantes */}
      <PulsingLights />
      
      {/* Efeito de vidro */}
      <GlassShards />
      
      {/* Partículas flutuantes variadas */}
      {particles.map((particle, index) => (
        <FloatingParticle 
          key={particle} 
          delay={index * 1.5} 
          duration={12 + Math.random() * 8}
          type={particleTypes[index % particleTypes.length]}
        />
      ))}

      {/* Ícones flutuantes com cores variadas */}
      <FloatingIcon Icon={FileText} delay={0} x={8} y={15} color="blue" />
      <FloatingIcon Icon={Building2} delay={2} x={88} y={12} color="emerald" />
      <FloatingIcon Icon={FileCheck} delay={4} x={12} y={75} color="purple" />
      <FloatingIcon Icon={DollarSign} delay={6} x={85} y={78} color="yellow" />
      <FloatingIcon Icon={Calendar} delay={8} x={50} y={8} color="pink" />
      <FloatingIcon Icon={Star} delay={3} x={25} y={45} color="blue" />
      <FloatingIcon Icon={Sparkles} delay={7} x={75} y={40} color="purple" />
      <FloatingIcon Icon={CheckCircle} delay={5} x={60} y={85} color="emerald" />

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent via-purple-900/10 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/5 to-transparent" />

      {/* Conteúdo principal */}
      <div className="relative z-10 min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            type: "spring",
            stiffness: 80
          }}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-2"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Contratos
              </motion.h1>
              <p className="text-gray-400">Gerencie todos os contratos de locação e venda</p>
            </div>
            
            {/* Action Buttons */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline"
                  className="border-blue-600/50 text-blue-400 hover:bg-blue-600/20 backdrop-blur-sm bg-gray-900/50 shadow-lg"
                  onClick={() => setShowTemplateUploadModal(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Template
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  onClick={() => setShowNewContractModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contrato
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Quick Stats Cards */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              { title: "Total", value: contracts.length, icon: FileText, color: "from-slate-800/80 to-slate-900/80", iconColor: "text-blue-300", borderColor: "border-blue-400/40" },
              { title: "Ativos", value: contracts.filter(c => c.status === 'Ativo').length, icon: CheckCircle, color: "from-slate-800/80 to-slate-900/80", iconColor: "text-emerald-300", borderColor: "border-emerald-400/40" },
              { title: "Pendentes", value: contracts.filter(c => c.status === 'Pendente').length, icon: Clock, color: "from-slate-800/80 to-slate-900/80", iconColor: "text-purple-300", borderColor: "border-purple-400/40" },
              { title: "Vencendo", value: contracts.filter(c => c.status === 'Vencendo').length, icon: AlertCircle, color: "from-slate-800/80 to-slate-900/80", iconColor: "text-indigo-300", borderColor: "border-indigo-400/40" },
              { title: "Receita/Mês", value: `R$ ${contracts.filter(c => c.tipo === 'Locação' && c.status === 'Ativo').reduce((sum, c) => sum + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "from-slate-800/80 to-slate-900/80", iconColor: "text-violet-300", borderColor: "border-violet-400/40" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-gradient-to-r ${stat.color} ${stat.borderColor} backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${stat.iconColor}`}>{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por número, cliente ou propriedade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 backdrop-blur-sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                {['todos', 'ativos', 'pendentes', 'vencendo', 'expirados', 'locacao', 'venda', 'templates'].map((tab, index) => (
                  <motion.div key={tab} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <TabsTrigger 
                      value={tab} 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white capitalize"
                    >
                      {tab === 'todos' ? 'Todos' : 
                       tab === 'ativos' ? 'Ativos' :
                       tab === 'pendentes' ? 'Pendentes' :
                       tab === 'vencendo' ? 'Vencendo' :
                       tab === 'expirados' ? 'Expirados' :
                       tab === 'locacao' ? 'Locação' : 
                       tab === 'venda' ? 'Venda' : 'Templates'}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>

              {/* Templates Tab Content */}
              <TabsContent value="templates" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ContractTemplatesList />
                </motion.div>
              </TabsContent>

              {/* Other Tabs Content */}
              {['todos', 'ativos', 'pendentes', 'vencendo', 'expirados', 'locacao', 'venda'].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
                  {/* Loading State */}
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid gap-4"
                    >
                      {Array.from({ length: 3 }).map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60 shadow-lg">
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                      className="w-5 h-5 bg-gray-600 rounded-full"
                                    />
                                    <div className="h-6 bg-gray-600 rounded animate-pulse w-32" />
                                    <div className="h-6 bg-gray-600 rounded animate-pulse w-20" />
                                    <div className="h-6 bg-gray-600 rounded animate-pulse w-16" />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-gray-600 rounded" />
                                      <div className="h-4 bg-gray-600 rounded animate-pulse w-24" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-gray-600 rounded" />
                                      <div className="h-4 bg-gray-600 rounded animate-pulse w-32" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-gray-600 rounded" />
                                      <div className="h-4 bg-gray-600 rounded animate-pulse w-20" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-gray-600 rounded" />
                                      <div className="h-4 bg-gray-600 rounded animate-pulse w-36" />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {Array.from({ length: 4 }).map((_, btnIndex) => (
                                    <div key={btnIndex} className="w-8 h-8 bg-gray-600 rounded animate-pulse" />
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="inline-block"
                        >
                          <Sparkles className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        </motion.div>
                        <p className="text-gray-400">Carregando contratos...</p>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Contracts List */}
                      <motion.div 
                        className="grid gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.7, duration: 0.8 }}
                      >
                        <AnimatePresence>
                          {filteredContracts.map((contract, index) => {
                            const StatusIcon = getStatusIcon(contract.status);
                            return (
                              <motion.div
                                key={contract.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                              >
                                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60 hover:bg-gray-800/70 transition-all duration-300 shadow-lg hover:shadow-xl">
                                  <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                      {/* Contract Info */}
                                      <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                          <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                          >
                                            <StatusIcon className="h-5 w-5 text-gray-400" />
                                          </motion.div>
                                          <h3 className="text-lg font-semibold text-white">{contract.numero}</h3>
                                          <motion.div whileHover={{ scale: 1.1 }}>
                                            <Badge variant="outline" className={getTipoColor(contract.tipo)}>
                                              {contract.tipo}
                                            </Badge>
                                          </motion.div>
                                          <motion.div whileHover={{ scale: 1.1 }}>
                                            <Badge variant="outline" className={getStatusColor(contract.status)}>
                                              {contract.status}
                                            </Badge>
                                          </motion.div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                          <div className="flex items-center gap-2 text-gray-300">
                                            <User className="h-4 w-4" />
                                            <span>{contract.client_name}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-300">
                                            <Building2 className="h-4 w-4" />
                                            <span className="truncate">{contract.property_address}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-300">
                                            <DollarSign className="h-4 w-4" />
                                            <span>R$ {typeof contract.valor === 'string' ? parseFloat(contract.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : contract.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(contract.data_inicio).toLocaleDateString('pt-BR')} - {contract.data_fim ? new Date(contract.data_fim).toLocaleDateString('pt-BR') : 'Indefinido'}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-4 text-sm">
                                          {contract.data_assinatura && (
                                            <motion.div 
                                              className="text-emerald-400"
                                              animate={{ scale: [1, 1.05, 1] }}
                                              transition={{ duration: 2, repeat: Infinity }}
                                            >
                                              Assinado em: {new Date(contract.data_assinatura).toLocaleDateString('pt-BR')}
                                            </motion.div>
                                          )}
                                          {contract.proximo_vencimento && (
                                            <motion.div 
                                              className="text-yellow-400"
                                              animate={{ opacity: [0.7, 1, 0.7] }}
                                              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                            >
                                              Próximo vencimento: {new Date(contract.proximo_vencimento).toLocaleDateString('pt-BR')}
                                            </motion.div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2">
                                        {[
                                          { 
                                            icon: Eye, 
                                            color: "bg-blue-700 border-blue-600 text-blue-100 hover:bg-blue-600 hover:text-white", 
                                            label: "Ver",
                                            action: () => handleViewContract(contract),
                                            loading: false
                                          },
                                          { 
                                            icon: Download, 
                                            color: "bg-blue-700 border-blue-600 text-blue-100 hover:bg-blue-600 hover:text-white", 
                                            label: "Baixar",
                                            action: () => handleDownloadContract(contract),
                                            loading: downloadingId === contract.id
                                          },
                                          { 
                                            icon: Trash2, 
                                            color: "bg-red-700 border-red-600 text-red-100 hover:bg-red-600 hover:text-white", 
                                            label: "Deletar",
                                            action: () => handleDeleteContract(contract),
                                            loading: deletingId === contract.id
                                          }
                                        ].map((action, actionIndex) => (
                                          <motion.div
                                            key={actionIndex}
                                            whileHover={{ scale: action.loading ? 1 : 1.1, y: action.loading ? 0 : -2 }}
                                            whileTap={{ scale: action.loading ? 1 : 0.9 }}
                                          >
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className={`${action.color} backdrop-blur-sm transition-all duration-200 min-w-[80px]`}
                                              title={action.label}
                                              onClick={action.action}
                                              disabled={action.loading || downloadingId !== null || deletingId !== null}
                                            >
                                              {action.loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <action.icon className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>

                      {filteredContracts.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8 }}
                        >
                          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60 shadow-lg">
                            <CardContent className="p-12 text-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                              >
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              </motion.div>
                              <h3 className="text-lg font-semibold text-white mb-2">Nenhum contrato encontrado</h3>
                              <p className="text-gray-400 mb-4">
                                {searchTerm ? 'Não encontramos contratos com os critérios de busca.' : 'Você ainda não possui contratos cadastrados.'}
                              </p>
                              <div className="flex gap-3 justify-center">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    variant="outline"
                                    className="border-blue-600 text-blue-400 hover:bg-blue-600/20 backdrop-blur-sm"
                                    onClick={() => setShowTemplateUploadModal(true)}
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Template
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    onClick={() => setShowNewContractModal(true)}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Primeiro Contrato
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </>
                  )}
                </TabsContent>
              ))}

              {/* Contracts List for filtered tabs */}
              {['todos', 'ativos', 'pendentes', 'vencendo', 'expirados', 'locacao', 'venda'].includes(selectedTab) && filteredContracts.length === 0 && (
                <TabsContent value={selectedTab} className="space-y-4 mt-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/60 shadow-lg">
                      <CardContent className="p-12 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="inline-block"
                        >
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-white mb-2">Nenhum contrato encontrado</h3>
                        <p className="text-gray-400 mb-4">
                          {searchTerm ? 'Não encontramos contratos com os critérios de busca.' : 'Você ainda não possui contratos cadastrados.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600/20 backdrop-blur-sm"
                              onClick={() => setShowTemplateUploadModal(true)}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Template
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              onClick={() => setShowNewContractModal(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Criar Primeiro Contrato
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Modal Novo Contrato */}
      <NewContractModal
        isOpen={showNewContractModal}
        onClose={() => setShowNewContractModal(false)}
        onSubmit={handleNewContract}
        onMissingDataRequired={handleMissingDataRequired}
      />

      {/* Modal Dados Faltantes */}
      <MissingDataModal
        isOpen={showMissingDataModal}
        onClose={handleMissingDataClose}
        missingData={missingData}
        onSubmit={handleMissingDataSubmit}
        templateName={selectedTemplateName}
      />

      {/* Modal Upload Template */}
      <ContractTemplateUpload
        open={showTemplateUploadModal}
        onOpenChange={setShowTemplateUploadModal}
      />

      {/* Modal Visualização de Contrato */}
      <PdfViewerModal
        isOpen={showPdfViewerModal}
        onClose={() => {
          setShowPdfViewerModal(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
      />
    </div>
  );
} 