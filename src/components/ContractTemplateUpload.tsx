import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle, CheckCircle, Building2, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContractTemplates } from '@/contexts/ContractTemplatesContext';
import { ALLOWED_FILE_TYPES, FILE_TYPE_LABELS, MAX_FILE_SIZE } from '@/types/contract-templates';

interface ContractTemplateUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContractTemplateUpload: React.FC<ContractTemplateUploadProps> = ({
  open,
  onOpenChange
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<'Locação' | 'Venda'>('Locação');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { createTemplate, uploading, uploadProgress } = useContractTemplates();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validar tipo de arquivo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Tipo de arquivo não permitido. Tipos aceitos: ${Object.values(FILE_TYPE_LABELS).join(', ')}`);
      return;
    }

    // Validar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      setError(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome do template é obrigatório');
      return;
    }

    if (!selectedFile) {
      setError('Selecione um arquivo para upload');
      return;
    }

    setError(null);

    const result = await createTemplate(
      name.trim(),
      description.trim() || null,
      templateType,
      selectedFile
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setError(result.error || 'Erro ao criar template');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setTemplateType('Locação');
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Template de Contrato
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contrato de Compra e Venda"
              disabled={uploading}
              required
            />
          </div>

          {/* Campo Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do template..."
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* Campo Tipo de Contrato */}
          <div className="space-y-2">
            <Label htmlFor="template-type">Tipo de Contrato *</Label>
            <Select 
              value={templateType} 
              onValueChange={(value: 'Locação' | 'Venda') => setTemplateType(value)}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Locação">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-500" />
                    <span>Locação</span>
                  </div>
                </SelectItem>
                <SelectItem value="Venda">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-500" />
                    <span>Venda</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Área de Upload */}
          <div className="space-y-2">
            <Label>Arquivo do Template *</Label>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  if (!uploading) {
                    document.getElementById('file-input')?.click();
                  }
                }}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-gray-500">
                  Tipos aceitos: {Object.values(FILE_TYPE_LABELS).join(', ')}
                </p>
                <p className="text-xs text-gray-500">
                  Tamanho máximo: {MAX_FILE_SIZE / 1024 / 1024}MB
                </p>
                
                <input
                  id="file-input"
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {FILE_TYPE_LABELS[selectedFile.type]} • {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Progresso do Upload */}
          {uploading && uploadProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando arquivo...</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <Progress value={uploadProgress.percentage} className="h-2" />
            </div>
          )}

          {/* Mensagens de Erro e Sucesso */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Template criado com sucesso! Fechando...
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading || !name.trim() || !selectedFile || success}
            >
              {uploading ? 'Enviando...' : 'Salvar Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 