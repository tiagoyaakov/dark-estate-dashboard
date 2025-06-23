import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancelar",
  showCancel = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />;
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />;
      case 'error':
        return <X className="h-12 w-12 text-red-400 mx-auto mb-4" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-600/20 border-green-500/30',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600/20 border-yellow-500/30',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'error':
        return {
          bg: 'bg-red-600/20 border-red-500/30',
          button: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          bg: 'bg-gray-600/20 border-gray-500/30',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="text-center">
            {getIcon()}
            <DialogTitle className="text-xl font-bold text-white mb-2">
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-base">
              {message}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex gap-3 mt-6">
          {showCancel && (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 ${colors.button}`}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 