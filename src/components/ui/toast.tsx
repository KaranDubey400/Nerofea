import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, description, variant = 'default', onDismiss }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${getVariantStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 