import React from 'react';
import { usePOS } from '../../hooks/usePOS';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = usePOS();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-[#10B981] text-white',
    error: 'bg-[#EF4444] text-white',
    info: 'bg-[#3B2A1F] text-[#F7F5F2]'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-white" />,
    error: <AlertCircle className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-[#D4A373]" />
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-200 animate-slide-down border border-white/10 text-sm font-medium backdrop-blur-md">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
