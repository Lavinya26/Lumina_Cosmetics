import React from 'react';
import { Sparkles, Smile, Scissors, Wind, Leaf } from 'lucide-react';

export default function CategoryBar() {
  const categorias = [
    { id: 'make', label: 'MAKE', icon: Sparkles },
    { id: 'skincare', label: 'SKINCARE', icon: Smile },
    { id: 'cabelo', label: 'CABELO', icon: Scissors },
    { id: 'perfumaria', label: 'PERFUMARIA', icon: Wind },
    { id: 'bio', label: 'BIO', icon: Leaf },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {categorias.map((cat) => (
        <div key={cat.id} className="flex flex-col items-center gap-3 min-w-[80px] group cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-[#FDF2F0] flex items-center justify-center text-[#D81B60] group-hover:bg-[#D81B60] group-hover:text-white transition-all shadow-sm">
            <cat.icon size={24} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 tracking-widest">{cat.label}</span>
        </div>
      ))}
    </div>
  );
}