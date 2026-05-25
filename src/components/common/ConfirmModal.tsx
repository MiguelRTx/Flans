import React, { useEffect } from 'react';
import { Button } from './Button';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const config = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      iconBg: 'bg-red-50 border-red-100',
      btnStyles: '!bg-gradient-to-r !from-red-500 !to-rose-600 hover:!from-red-600 hover:!to-rose-700 !shadow-red-200/50',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      btnStyles: '!bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-amber-600 hover:!to-orange-700 !shadow-amber-200/50',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100',
      btnStyles: '!bg-gradient-to-r !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !shadow-blue-200/50',
    },
  };

  const currentConfig = config[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={() => {
          if (!isLoading) onClose();
        }} 
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
    
        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl border flex-shrink-0 ${currentConfig.iconBg}`}>
            {currentConfig.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-6 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="!w-full sm:!w-auto !border-gray-200 !text-gray-500 hover:!bg-gray-50"
          >
            {cancelLabel}
          </Button>
          
          <Button
            onClick={async () => {
              await onConfirm();
            }}
            isLoading={isLoading}
            className={`!w-full sm:!w-auto !shadow-md ${currentConfig.btnStyles}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};