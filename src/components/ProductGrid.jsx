import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Loader2, SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGrid({ categoria, busca, onImageClick }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      try {
        let query = supabase.from('produtos').select('*');

        if (categoria !== 'Todos') {
          query = query.eq('categoria', categoria);
        }

        if (busca) {
          query = query.ilike('nome', `%${busca}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProdutos(data || []);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error.message);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProdutos();
    }, 300);

    return () => clearTimeout(timer);
  }, [categoria, busca]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full">
        <Loader2 className="animate-spin text-[#D81B60] mb-2" size={32} />
        <p className="text-gray-400 text-sm italic">Procurando na Lumina...</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <AnimatePresence mode='popLayout'>
        {produtos.length > 0 ? (
          produtos.map((produto, index) => (
            <motion.div 
              key={produto.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 group hover:shadow-md transition-all"
            >
              <div 
                className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-gray-50 cursor-pointer"
                onClick={() => onImageClick && onImageClick(produto)}
              >
                <img 
                  src={produto.imagem_url || 'https://via.placeholder.com/400'} 
                  alt={produto.nome}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400'}
                />
              </div>

              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-[#5D4037] line-clamp-1">{produto.nome}</h3>
                <div className="flex items-center text-amber-400 gap-0.5 text-[10px]">
                  <Star size={10} fill="currentColor" />
                  <span className="text-gray-400">4.9</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-widest">{produto.categoria}</p>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {produto.preco_antigo && produto.preco_antigo > produto.preco ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">R$ {produto.preco_antigo.toFixed(2)}</span>
                      <span className="font-bold text-[#D81B60]">R$ {produto.preco.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-bold text-[#D81B60]">R$ {produto.preco.toFixed(2)}</span>
                  )}
                </div>
                <button 
                  onClick={() => addToCart(produto)}
                  className="bg-[#8D6E63] text-white p-2 rounded-xl hover:bg-[#5D4037] transition-colors shadow-sm active:scale-90"
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="col-span-full text-center py-20"
          >
            <div className="flex justify-center mb-4 text-gray-200">
              <SearchX size={48} />
            </div>
            <p className="text-gray-400 italic">Nenhum sérum ou cosmético encontrado com esse nome.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}