import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Package } from 'lucide-react';

export default function StockAlerts() {
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarAlertas() {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, estoque')
          .lte('estoque', 5)
          .order('estoque', { ascending: true });

        if (error) throw error;
        setProdutosBaixoEstoque(data || []);
      } catch (error) {
        console.error("Erro ao carregar alertas de estoque:", error);
        setProdutosBaixoEstoque([]);
      } finally {
        setCarregando(false);
      }
    }
    carregarAlertas();
  }, []);

  if (carregando) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 h-full flex items-center justify-center">
        Carregando alertas...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 h-full">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-[#D81B60]" />
        <h3 className="font-serif text-lg text-[#5D4037]">Alertas de Estoque</h3>
      </div>
      {produtosBaixoEstoque.length === 0 ? (
        <p className="text-gray-400 text-sm">✓ Todos os produtos com estoque ok</p>
      ) : (
        <div className="space-y-4">
          {produtosBaixoEstoque.map(produto => (
            <div key={produto.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <Package size={14} className="text-[#D81B60]" />
                    {produto.nome}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">ID: {produto.id.slice(0, 8)}</p>
                </div>
                <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full">
                  {produto.estoque} unidade{produto.estoque !== 1 ? 's' : ''}
                </span>
              </div>
              <button className="mt-2 text-[9px] font-bold text-[#D81B60] uppercase hover:underline">
                REABASTECER AGORA
              </button>
            </div>
          ))}
        </div>
      )}
      <button className="mt-6 w-full text-center text-[10px] font-bold text-gray-400 uppercase hover:text-[#8D6E63] transition-colors">
        VER TODOS OS ALERTAS
      </button>
    </div>
  );
}