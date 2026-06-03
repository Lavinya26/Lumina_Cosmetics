import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2 } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [produto, setProduto] = useState({
    nome: '',
    preco: '',
    preco_antigo: '',
    categoria: 'Skincare',
    estoque: '',
    imagem_url: '',
    descricao: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToInsert = {
        nome: produto.nome,
        preco: parseFloat(produto.preco),
        categoria: produto.categoria,
        estoque: parseInt(produto.estoque),
        imagem_url: produto.imagem_url,
        descricao: produto.descricao || null
      };
      
      if (produto.preco_antigo && parseFloat(produto.preco_antigo) > 0) {
        dataToInsert.preco_antigo = parseFloat(produto.preco_antigo);
      }

      const { error } = await supabase
        .from('produtos')
        .insert([dataToInsert]);

      if (error) throw error;

      alert("Produto cadastrado com sucesso! ✨");
      setProduto({ nome: '', preco: '', preco_antigo: '', categoria: 'Skincare', estoque: '', imagem_url: '', descricao: '' });
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-[#5D4037]">Novo Produto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Nome do Produto" required
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
            value={produto.nome}
            onChange={(e) => setProduto({...produto, nome: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" placeholder="Preço (R$)" required
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              value={produto.preco}
              onChange={(e) => setProduto({...produto, preco: e.target.value})}
            />
            <input 
              type="number" placeholder="Preço Antigo (opcional)"
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              value={produto.preco_antigo}
              onChange={(e) => setProduto({...produto, preco_antigo: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" placeholder="Estoque inicial" required
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              value={produto.estoque}
              onChange={(e) => setProduto({...produto, estoque: e.target.value})}
            />
            <select 
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              value={produto.categoria}
              onChange={(e) => setProduto({...produto, categoria: e.target.value})}
            >
              <option value="Skincare">Skincare</option>
              <option value="Maquiagem">Maquiagem</option>
              <option value="Fragrâncias">Fragrâncias</option>
              <option value="Cabelo">Cabelo</option>
              <option value="Bio">Bio</option>
            </select>
          </div>

          <input 
            type="text" placeholder="URL da Imagem"
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
            value={produto.imagem_url}
            onChange={(e) => setProduto({...produto, imagem_url: e.target.value})}
          />

          <textarea 
            placeholder="Descrição do produto (ex: Hidratante corporal para peles secas, com 24h de maciez...)"
            rows="4"
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200 resize-none"
            value={produto.descricao}
            onChange={(e) => setProduto({...produto, descricao: e.target.value})}
          />

          <button 
            disabled={loading}
            className="w-full bg-[#795548] text-white py-4 rounded-2xl font-bold hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'CADASTRAR PRODUTO'}
          </button>
        </form>
      </div>
    </div>
  );
}