import React from 'react';
import { Star } from 'lucide-react';

export default function PointsProgress({ currentPoints = 0, maxPoints = 500 }) {
  const safePoints = Math.max(0, currentPoints);
  const percentage = Math.min(100, (safePoints / maxPoints) * 100);
  const faltam = maxPoints - safePoints;
  const textoFaltam = faltam <= 0 ? "✨ Você atingiu a meta! Parabéns!" : `Faltam apenas ${faltam} pontos para o seu próximo resgate!`;

  let nivelAtual = "Bronze";
  let proximoNivel = "Prata";
  if (safePoints >= 1000) {
    nivelAtual = "Ouro";
    proximoNivel = "Ouro (máximo)";
  } else if (safePoints >= 500) {
    nivelAtual = "Prata";
    proximoNivel = "Ouro";
  }

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl text-[#5D4037] flex items-center gap-2">
            <div className="p-1 border border-gray-200 rounded-full"><Star size={14} className="text-[#5D4037]" /></div>
            Seus Pontos de Beleza
          </h3>
          <p className="text-sm text-gray-400 mt-1">{textoFaltam}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[10px] font-bold text-gray-300 uppercase">Nível {nivelAtual}</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase">Nível {proximoNivel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#D81B60]">{safePoints} pts</span>
            <span className="text-sm text-gray-300">/ {maxPoints} pts</span>
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5">
        <div className="h-full rounded-full bg-gradient-to-r from-[#F8BBD0] to-[#D81B60] transition-all duration-1000 shadow-sm" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}