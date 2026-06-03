import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trash2, ChevronLeft, Package, Plus, RefreshCw, Search, 
  Filter, AlertTriangle, TrendingUp, DollarSign, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [ordem, setOrdem] = useState('nome_asc');
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { carregarProdutos(); }, []);

  useEffect(() => {
    filtrarEOrdenar();
  }, [busca, categoriaFiltro, ordem, produtos]);

  async function carregarProdutos() {
    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setProdutos(data || []);
      const cats = [...new Set(data?.map(p => p.categoria).filter(Boolean))];
      setCategorias(['Todos', ...cats]);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function filtrarEOrdenar() {
    let filtrados = [...produtos];
    if (busca) filtrados = filtrados.filter(p => p.nome?.toLowerCase().includes(busca.toLowerCase()));
    if (categoriaFiltro !== 'Todos') filtrados = filtrados.filter(p => p.categoria === categoriaFiltro);
    switch (ordem) {
      case 'nome_asc': filtrados.sort((a,b) => (a.nome||'').localeCompare(b.nome||'')); break;
      case 'nome_desc': filtrados.sort((a,b) => (b.nome||'').localeCompare(a.nome||'')); break;
      case 'preco_asc': filtrados.sort((a,b) => (a.preco||0) - (b.preco||0)); break;
      case 'preco_desc': filtrados.sort((a,b) => (b.preco||0) - (a.preco||0)); break;
      case 'estoque_asc': filtrados.sort((a,b) => (a.estoque||0) - (b.estoque||0)); break;
      case 'estoque_desc': filtrados.sort((a,b) => (b.estoque||0) - (a.estoque||0)); break;
      default: break;
    }
    setProdutosFiltrados(filtrados);
  }

  async function deleteProduto(id) {
    if (confirm("Remover produto?")) {
      await supabase.from('produtos').delete().eq('id', id);
      carregarProdutos();
    }
  }

  async function reabastecer(id, estoqueAtual) {
    const novo = prompt(`Novo estoque (atual: ${estoqueAtual})`, estoqueAtual);
    if (novo && !isNaN(parseInt(novo))) {
      await supabase.from('produtos').update({ estoque: parseInt(novo) }).eq('id', id);
      carregarProdutos();
    }
  }

  const total = produtosFiltrados.length;
  const valorEstoque = produtosFiltrados.reduce((a,p) => a + (p.preco||0)*(p.estoque||0), 0);
  const baixoEstoque = produtosFiltrados.filter(p => p.estoque <= 5).length;
  const estoqueMedio = total ? (produtosFiltrados.reduce((a,p) => a + (p.estoque||0),0)/total).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBFB] p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft size={20} /></button>
            <h1 className="text-2xl text-[#5D4037]">Inventário Lumina</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {}} className="bg-[#8D6E63] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Download size={14} /> Exportar CSV</button>
            <button onClick={() => navigate('/admin')} className="bg-[#D81B60] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Plus size={14} /> Novo Produto</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl flex items-center gap-3"><Package size={20} className="text-pink-500"/><div><p className="text-[10px] text-gray-400 uppercase">Total Itens</p><p className="text-xl font-bold">{total}</p></div></div>
          <div className="bg-white p-4 rounded-2xl flex items-center gap-3"><DollarSign size={20} className="text-green-500"/><div><p className="text-[10px] text-gray-400 uppercase">Valor Estoque</p><p className="text-xl font-bold">R$ {valorEstoque.toFixed(2)}</p></div></div>
          <div className="bg-white p-4 rounded-2xl flex items-center gap-3"><AlertTriangle size={20} className="text-orange-500"/><div><p className="text-[10px] text-gray-400 uppercase">Estoque Baixo</p><p className="text-xl font-bold">{baixoEstoque}</p></div></div>
          <div className="bg-white p-4 rounded-2xl flex items-center gap-3"><TrendingUp size={20} className="text-blue-500"/><div><p className="text-[10px] text-gray-400 uppercase">Estoque Médio</p><p className="text-xl font-bold">{estoqueMedio}</p></div></div>
        </div>

        <div className="bg-white p-4 rounded-2xl mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-sm" />
              </div>
              <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="border border-gray-100 rounded-xl px-3 py-2 text-sm bg-white">
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={ordem} onChange={e => setOrdem(e.target.value)} className="border border-gray-100 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="preco_asc">Preço (menor → maior)</option>
                <option value="preco_desc">Preço (maior → menor)</option>
                <option value="estoque_asc">Estoque (menor → maior)</option>
                <option value="estoque_desc">Estoque (maior → menor)</option>
              </select>
            </div>
            <button onClick={() => { setBusca(''); setCategoriaFiltro('Todos'); }} className="text-xs text-gray-400">Limpar filtros</button>
          </div>
        </div>

        {carregando && <div className="text-center py-20">Carregando...</div>}
        {erro && <div className="text-center py-20 text-red-500">Erro: {erro} <button onClick={carregarProdutos} className="ml-2 text-[#D81B60]">Tentar novamente</button></div>}
        {!carregando && !erro && produtosFiltrados.length === 0 && <div className="text-center py-20 bg-white rounded-2xl">Nenhum produto encontrado.</div>}
        {!carregando && !erro && produtosFiltrados.length > 0 && (
          <div className="grid gap-3">
            <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase px-4 py-2 border-b">
              <div className="col-span-4">Produto</div><div className="col-span-2">Categoria</div><div className="col-span-2 text-right">Preço</div><div className="col-span-2 text-center">Estoque</div><div className="col-span-2 text-right">Ações</div>
            </div>
            {produtosFiltrados.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-[25px] border border-gray-50 shadow-sm hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="flex items-center gap-3 col-span-4"><img src={p.imagem_url} className="w-12 h-12 rounded-xl object-cover" /><div><h3 className="text-sm font-bold">{p.nome}</h3><p className="text-[9px] text-gray-400">{p.id.slice(0,8)}</p></div></div>
                  <div className="col-span-2"><span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{p.categoria}</span></div>
                  <div className="col-span-2 text-right md:text-left">R$ {p.preco}</div>
                  <div className="col-span-2 text-center"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.estoque <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.estoque} un.</span></div>
                  <div className="col-span-2 flex justify-end gap-3">
                    <button onClick={() => reabastecer(p.id, p.estoque)} className="text-blue-500"><RefreshCw size={16} /></button>
                    <button onClick={() => deleteProduto(p.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}