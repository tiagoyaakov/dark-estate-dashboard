import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, Download, FileText, AlertCircle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { convertWordToPDF, isWordDocument, cleanupPdfUrl } from '@/utils/documentConverter';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  file_type?: string;
}

export function PdfViewerModal({ isOpen, onClose, fileUrl, fileName, file_type }: PdfViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useIframe, setUseIframe] = useState(false);
  const [pdfLoadTimeout, setPdfLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Estados para conversão de Word
  const [isConverting, setIsConverting] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Detecta se é um PDF
  const isPdf = file_type === 'application/pdf' || 
               fileName.toLowerCase().endsWith('.pdf') || 
               fileUrl.includes('.pdf');

  // Detecta se é um documento Word
  const isWord = isWordDocument(fileName, file_type);

  // URL final para exibição (PDF original ou convertido)
  const displayUrl = convertedPdfUrl || fileUrl;

  useEffect(() => {
    if (isOpen) {
      console.log('📄 Informações do arquivo:', {
        fileName,
        file_type,
        fileUrl,
        isPdf,
        isWord
      });

      // Reset states
      setLoading(true);
      setError(null);
      setUseIframe(false);
      setPageNumber(1);
      setIsConverting(false);
      setConvertedPdfUrl(null);
      setConversionError(null);

      if (isWord) {
        // Converter documento Word para PDF
        handleWordConversion();
      } else if (isPdf) {
        // PDF direto - detecta rapidamente
        console.log('🔍 PDF detectado, ativando iframe em 2s...');
        const timeout = setTimeout(() => {
          console.log('✅ Ativando iframe para PDF');
          setUseIframe(true);
          setLoading(false);
        }, 2000);
        setPdfLoadTimeout(timeout);
      } else {
        // Outros tipos de arquivo - tenta react-pdf primeiro
        console.log('📋 Tentando carregar com react-pdf...');
        const timeout = setTimeout(() => {
          if (loading) {
            console.log('⏰ Timeout do react-pdf, mudando para iframe');
            setUseIframe(true);
            setLoading(false);
          }
        }, 15000);
        setPdfLoadTimeout(timeout);
      }
    }

    return () => {
      if (pdfLoadTimeout) {
        clearTimeout(pdfLoadTimeout);
      }
      // Limpar URL do PDF convertido
      if (convertedPdfUrl) {
        cleanupPdfUrl(convertedPdfUrl);
      }
    };
  }, [isOpen, fileUrl, fileName, file_type, isPdf, isWord]);

  const handleWordConversion = async () => {
    setIsConverting(true);
    setConversionError(null);
    
    console.log('📝 Iniciando conversão de Word para PDF...');
    
    try {
      const result = await convertWordToPDF(fileUrl, fileName);
      
      if (result.success && result.pdfUrl) {
        console.log('✅ Conversão concluída com sucesso');
        setConvertedPdfUrl(result.pdfUrl);
        setUseIframe(true);
        setLoading(false);
      } else {
        console.error('❌ Falha na conversão:', result.error);
        setConversionError(result.error || 'Erro desconhecido na conversão');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro durante a conversão:', error);
      setConversionError('Erro inesperado durante a conversão do documento');
      setLoading(false);
    } finally {
      setIsConverting(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('📖 PDF carregado com sucesso:', numPages, 'páginas');
    setNumPages(numPages);
    setLoading(false);
    if (pdfLoadTimeout) {
      clearTimeout(pdfLoadTimeout);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ Erro ao carregar PDF com react-pdf:', error);
    setError('Erro ao carregar o documento');
    setUseIframe(true);
    setLoading(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayUrl;
    link.download = convertedPdfUrl ? fileName.replace(/\.(docx?|rtf)$/i, '.pdf') : fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-[9999]" />
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 z-[10000] bg-white">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {isWord && convertedPdfUrl ? (
                <>
                  <FileText className="w-5 h-5 inline mr-2" />
                  {fileName} (convertido para PDF)
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 inline mr-2" />
                  {fileName}
                </>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={loading || isConverting}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6">
          {(loading || isConverting) && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-muted-foreground">
                {isConverting ? 'Convertendo documento Word para PDF...' : 'Carregando documento...'}
              </p>
            </div>
          )}

          {conversionError && (
            <div className="flex items-center justify-center h-full">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro na conversão:</strong><br />
                  {conversionError}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!loading && !isConverting && !conversionError && (
            <>
              {useIframe ? (
                <div className="w-full h-full">
                  <iframe
                    src={displayUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title={fileName}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {error && (
                    <Alert className="mb-4 max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Document
                    file={displayUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Carregando PDF...
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                    />
                  </Document>

                  {numPages > 0 && (
                    <div className="flex items-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {pageNumber} de {numPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                        disabled={pageNumber >= numPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 