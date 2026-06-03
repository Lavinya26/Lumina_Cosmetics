import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Plus, LayoutDashboard, Package, ShoppingBag, Users, BarChart3, 
  Settings, LogOut, AlertTriangle, Eye, X, Search, Calendar
} from 'lucide-react';
import SalesChart from '../components/SalesChart';
import AddProductModal from '../components/AddProductModal';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [buscaCliente, setBuscaCliente] = useState('');
  
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [itensDoPedido, setItensDoPedido] = useState([]);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, [abaAtiva]);

  async function carregarDados() {
    setCarregando(true);
    try {
      if (abaAtiva === 'dashboard' || abaAtiva === 'pedidos' || abaAtiva === 'clientes') {
        const { data: pedidosData } = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false });
        setPedidos(pedidosData || []);
      }
      if (abaAtiva === 'dashboard' || abaAtiva === 'clientes') {
        const { data: clientesData } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: false });
        setClientes(clientesData || []);
      }
      if (abaAtiva === 'dashboard' || abaAtiva === 'inventario') {
        const { data: estoqueData } = await supabase
          .from('produtos')
          .select('id, nome, estoque')
          .lte('estoque', 5)
          .order('estoque', { ascending: true });
        setProdutosBaixoEstoque(estoqueData || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function abrirDetalhes(pedido) {
    setPedidoSelecionado(pedido);
    setModalDetalhesAberto(true);
    setCarregandoDetalhes(true);
    try {
      const { data, error } = await supabase
        .from('pedido_itens')
        .select('*')
        .eq('pedido_id', pedido.id);
      if (error) throw error;
      setItensDoPedido(data || []);
    } catch (error) {
      console.error("Erro ao carregar itens do pedido:", error);
      setItensDoPedido([]);
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  async function atualizarStatus(pedidoId, novoStatus) {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', pedidoId);
      if (error) throw error;
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
      if (pedidoSelecionado && pedidoSelecionado.id === pedidoId) {
        setPedidoSelecionado({ ...pedidoSelecionado, status: novoStatus });
      }
      alert(`Status atualizado para ${novoStatus}`);
    } catch (error) {
      alert("Erro ao atualizar status: " + error.message);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/login');
  };

  const navegarInventario = () => {
    navigate('/inventory');
  };

  const atualizarRefresh = () => {
    carregarDados();
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.email?.toLowerCase().includes(buscaCliente.toLowerCase())
  );

  const getTotalGastoCliente = (email) => {
    return pedidos
      .filter(p => p.cliente_email === email)
      .reduce((acc, p) => acc + (p.total_valor || 0), 0);
  };

  const getQuantidadePedidos = (email) => {
    return pedidos.filter(p => p.cliente_email === email).length;
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBFB]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 p-8 hidden lg:block">
        <h2 className="text-[#D81B60] font-bold text-2xl mb-12 tracking-tighter">LUMINA</h2>
        <nav className="space-y-6">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={abaAtiva === 'dashboard'} onClick={() => setAbaAtiva('dashboard')} />
          <NavItem icon={Package} label="Inventário" active={abaAtiva === 'inventario'} onClick={navegarInventario} />
          <NavItem icon={ShoppingBag} label="Pedidos" active={abaAtiva === 'pedidos'} onClick={() => setAbaAtiva('pedidos')} />
          <NavItem icon={Users} label="Clientes" active={abaAtiva === 'clientes'} onClick={() => setAbaAtiva('clientes')} />
          <NavItem icon={BarChart3} label="Analytics" active={abaAtiva === 'analytics'} onClick={() => setAbaAtiva('analytics')} />
          <div className="border-t border-gray-100 pt-6">
            <NavItem icon={Settings} label="Configurações" active={abaAtiva === 'configuracoes'} onClick={() => setAbaAtiva('configuracoes')} />
            <button onClick={handleLogout} className="flex items-center gap-3.5 text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg w-full mt-4">
              <LogOut size={20} />
              <span className="text-sm tracking-wide">Sair</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-3xl text-[#5D4037]">
              {abaAtiva === 'dashboard' && 'Visão Geral'}
              {abaAtiva === 'pedidos' && 'Pedidos'}
              {abaAtiva === 'clientes' && 'Clientes'}
              {abaAtiva === 'analytics' && 'Analytics'}
              {abaAtiva === 'configuracoes' && 'Configurações'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {abaAtiva === 'dashboard' && 'Bem-vindo ao painel da Lumina Cosmetics.'}
              {abaAtiva === 'pedidos' && 'Gerencie todos os pedidos realizados.'}
              {abaAtiva === 'clientes' && 'Visualize e gerencie seus clientes.'}
              {abaAtiva === 'analytics' && 'Métricas e análises detalhadas.'}
              {abaAtiva === 'configuracoes' && 'Preferências da loja.'}
            </p>
          </div>
          {abaAtiva === 'dashboard' && (
            <button onClick={() => setModalProdutoAberto(true)} className="bg-[#795548] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#5D4037] transition-all shadow-md">
              <Plus size={18} /> NOVO PRODUTO
            </button>
          )}
        </div>

        {/* DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Vendas do Mês" value={pedidos.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length} trend="+12.5% vs mês passado" isUp={true} icon={ShoppingBag} color="pink" />
              <StatCard title="Total Clientes" value={clientes.length} trend="+8.2% vs mês passado" isUp={true} icon={Users} color="brown" />
              <StatCard title="Faturamento Total" value={`R$ ${pedidos.reduce((acc, p) => acc + (p.total_valor || 0), 0).toFixed(2)}`} trend="-2.4% vs meta" isUp={false} icon={BarChart3} color="pink" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2"><SalesChart /></div>
              <div className="lg:col-span-1"><StockAlerts produtos={produtosBaixoEstoque} onRefresh={atualizarRefresh} /></div>
            </div>
            <RecentTransactions pedidos={pedidos.slice(0, 5)} onVerDetalhes={abrirDetalhes} />
          </>
        )}

        {/* PEDIDOS */}
        {abaAtiva === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">ID</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Cliente</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Data</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {carregando ? (
                    <tr><td colSpan="6" className="p-8 text-center">Carregando pedidos...</td></tr>
                  ) : pedidos.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>
                  ) : (
                    pedidos.map(pedido => (
                      <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-xs font-mono">{pedido.id.slice(0, 8)}</td>
                        <td className="p-4 text-sm">{pedido.cliente_nome || 'Anônimo'}</td>
                        <td className="p-4 text-sm">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            pedido.status === 'Entregue' ? 'bg-green-50 text-green-600' :
                            pedido.status === 'Processando' ? 'bg-orange-50 text-orange-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>{pedido.status || 'Processando'}</span>
                        </td>
                        <td className="p-4 text-right font-bold">R$ {pedido.total_valor?.toFixed(2) || '0,00'}</td>
                        <td className="p-4">
                          <button onClick={() => abrirDetalhes(pedido)} className="text-[#D81B60] hover:underline text-xs flex items-center gap-1">
                            <Eye size={14} /> Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-sm w-64 focus:ring-1 focus:ring-pink-200 outline-none"
                />
              </div>
              <div className="text-xs text-gray-400">{clientesFiltrados.length} cliente(s) encontrado(s)</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-3">
                <Users size={20} className="text-[#D81B60]" />
                <div><p className="text-[10px] text-gray-400 uppercase">Total Clientes</p><p className="text-xl font-bold">{clientes.length}</p></div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-3">
                <AlertTriangle size={20} className="text-yellow-500" />
                <div><p className="text-[10px] text-gray-400 uppercase">Média de Pontos</p><p className="text-xl font-bold">{(clientes.reduce((acc, c) => acc + (c.pontos || 0), 0) / (clientes.length || 1)).toFixed(0)}</p></div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-3">
                <Calendar size={20} className="text-green-500" />
                <div><p className="text-[10px] text-gray-400 uppercase">Último cadastro</p><p className="text-sm font-bold">{clientes[0] ? new Date(clientes[0].created_at).toLocaleDateString('pt-BR') : '-'}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Nome</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">E-mail</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">WhatsApp</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Pontos</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Nível</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Pedidos</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Total Gasto</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Desde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {carregando ? (
                      <tr><td colSpan="8" className="p-8 text-center">Carregando clientes...</td></tr>
                    ) : clientesFiltrados.length === 0 ? (
                      <tr><td colSpan="8" className="p-8 text-center text-gray-400">Nenhum cliente encontrado.</td></tr>
                    ) : (
                      clientesFiltrados.map(cliente => (
                        <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 text-sm font-medium text-gray-800">{cliente.nome}</td>
                          <td className="p-4 text-sm text-gray-600">{cliente.email}</td>
                          <td className="p-4 text-sm text-gray-500">{cliente.whatsapp || '—'}</td>
                          <td className="p-4 text-center text-sm font-bold text-[#D81B60]">{cliente.pontos || 0}</td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                              cliente.nivel === 'Ouro' ? 'bg-yellow-100 text-yellow-700' :
                              cliente.nivel === 'Prata' ? 'bg-gray-100 text-gray-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>{cliente.nivel || 'Bronze'}</span>
                          </td>
                          <td className="p-4 text-center text-sm">{getQuantidadePedidos(cliente.email)}</td>
                          <td className="p-4 text-right font-bold">R$ {getTotalGastoCliente(cliente.email).toFixed(2)}</td>
                          <td className="p-4 text-center text-xs text-gray-400">{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {abaAtiva === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
              <h3 className="text-[#5D4037] mb-4">Vendas por período</h3>
              <SalesChart />
            </div>
          </div>
        )}

        {/* CONFIGURAÇÕES */}
        {abaAtiva === 'configuracoes' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 max-w-2xl">
            <h3 className="text-[#5D4037] text-xl mb-6">Configurações da Loja</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div><p className="font-bold text-gray-800">Alterar credenciais do admin</p><p className="text-xs text-gray-400">Usuário e senha para acesso ao painel</p></div>
                <button className="bg-[#795548] text-white px-4 py-2 rounded-lg text-xs font-bold">Alterar</button>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div><p className="font-bold text-gray-800">WhatsApp número</p><p className="text-xs text-gray-400">Número para receber pedidos</p></div>
                <button className="bg-[#795548] text-white px-4 py-2 rounded-lg text-xs font-bold">Configurar</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DETALHES PEDIDO */}
      {modalDetalhesAberto && pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h3 className="text-xl text-[#D81B60]">Detalhes do Pedido</h3>
              <button onClick={() => setModalDetalhesAberto(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Pedido ID:</span> <span className="font-mono">{pedidoSelecionado.id}</span></div>
                <div><span className="text-gray-400">Data:</span> {new Date(pedidoSelecionado.created_at).toLocaleString('pt-BR')}</div>
                <div><span className="text-gray-400">Cliente:</span> {pedidoSelecionado.cliente_nome || 'Anônimo'}</div>
                <div><span className="text-gray-400">E-mail:</span> {pedidoSelecionado.cliente_email || 'não informado'}</div>
                <div><span className="text-gray-400">Status:</span>
                  <select value={pedidoSelecionado.status || 'Processando'} onChange={(e) => atualizarStatus(pedidoSelecionado.id, e.target.value)} className="ml-2 border border-gray-200 rounded-lg px-2 py-1 text-xs">
                    <option value="Processando">Processando</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div><span className="text-gray-400">Total:</span> <span className="font-bold text-[#D81B60]">R$ {pedidoSelecionado.total_valor?.toFixed(2) || '0,00'}</span></div>
              </div>
              <div>
                <h4 className="text-[#5D4037] mb-3">Itens do Pedido</h4>
                {carregandoDetalhes ? <p className="text-gray-400 text-sm">Carregando itens...</p> : itensDoPedido.length === 0 ? <p className="text-gray-400 text-sm">Nenhum item encontrado.</p> : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr><th className="text-left py-2">Produto</th><th className="text-center py-2">Qtd</th><th className="text-right py-2">Preço Unit.</th><th className="text-right py-2">Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {itensDoPedido.map(item => (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="py-2">{item.nome}</td>
                          <td className="text-center py-2">{item.quantidade}</td>
                          <td className="text-right py-2">R$ {item.preco_unitario.toFixed(2)}</td>
                          <td className="text-right py-2">R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-gray-200">
                      <tr><td colSpan="3" className="text-right font-bold py-2">Total:</td><td className="text-right font-bold text-[#D81B60]">R$ {pedidoSelecionado.total_valor?.toFixed(2) || '0,00'}</td></tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddProductModal isOpen={modalProdutoAberto} onClose={() => setModalProdutoAberto(false)} onRefresh={() => { carregarDados(); }} />
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`${active ? 'text-[#D81B60] font-bold' : 'text-gray-400 hover:text-[#8D6E63]'} flex items-center gap-3.5 cursor-pointer transition-colors p-2 rounded-lg`}>
      <Icon size={20} />
      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );
}

function StatCard({ title, value, trend, isUp, icon: Icon, color }) {
  const bgColor = color === 'pink' ? 'bg-pink-50' : 'bg-orange-50';
  const textColor = color === 'pink' ? 'text-[#D81B60]' : 'text-[#8D6E63]';
  return (
    <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow flex items-start gap-5">
      <div className={`p-4 rounded-xl ${bgColor} ${textColor}`}><Icon size={24} /></div>
      <div>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">{title}</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{value}</h2>
        <p className={`text-[11px] font-bold flex items-center gap-1.5 ${isUp ? 'text-emerald-500' : 'text-rose-400'}`}>{isUp ? '↗' : '↘'} {trend}</p>
      </div>
    </div>
  );
}

function StockAlerts({ produtos, onRefresh }) {
  const [atualizando, setAtualizando] = useState(null);

  async function handleReabastecer(id, nome, estoqueAtual) {
    const novoEstoque = prompt(`Produto: ${nome}\nEstoque atual: ${estoqueAtual}\nDigite a nova quantidade:`, estoqueAtual);
    if (novoEstoque !== null && !isNaN(parseInt(novoEstoque))) {
      setAtualizando(id);
      try {
        const { error } = await supabase
          .from('produtos')
          .update({ estoque: parseInt(novoEstoque) })
          .eq('id', id);
        if (error) throw error;
        alert(`✅ Estoque de "${nome}" atualizado para ${parseInt(novoEstoque)} unidades.`);
        if (onRefresh) onRefresh();
      } catch (error) {
        alert("Erro ao atualizar estoque: " + error.message);
      } finally {
        setAtualizando(null);
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 h-full">
      <div className="flex items-center gap-2 mb-4"><AlertTriangle size={20} className="text-[#D81B60]" /><h3 className="text-lg text-[#5D4037]">Alertas de Estoque</h3></div>
      {produtos.length === 0 ? (
        <p className="text-gray-400 text-sm">✓ Todos os produtos com estoque ok</p>
      ) : (
        <div className="space-y-4">
          {produtos.map(produto => (
            <div key={produto.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-800 flex items-center gap-2"><Package size={14} className="text-[#D81B60]" />{produto.nome}</p>
                  <p className="text-[10px] text-gray-400 mt-1">ID: {produto.id.slice(0, 8)}</p>
                </div>
                <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full">{produto.estoque} unidade{produto.estoque !== 1 ? 's' : ''}</span>
              </div>
              <button onClick={() => handleReabastecer(produto.id, produto.nome, produto.estoque)} disabled={atualizando === produto.id} className="mt-2 text-[9px] font-bold text-[#D81B60] uppercase hover:underline disabled:opacity-50">
                {atualizando === produto.id ? 'Atualizando...' : 'REABASTECER AGORA'}
              </button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => window.location.href = '/inventory'} className="mt-6 w-full text-center text-[10px] font-bold text-gray-400 uppercase hover:text-[#8D6E63] transition-colors">VER TODOS OS ALERTAS</button>
    </div>
  );
}

function RecentTransactions({ pedidos, onVerDetalhes }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mt-6">
      <div className="flex justify-between items-center mb-6"><h3 className="text-lg text-[#5D4037]">Transações Recentes</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="text-[10px] text-gray-300 uppercase tracking-widest border-b border-gray-50"><th className="pb-3 font-medium">Pedido ID</th><th className="pb-3 font-medium">Cliente</th><th className="pb-3 font-medium">Data</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium text-right">Total</th><th className="pb-3 font-medium">Ações</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {pedidos.length === 0 ? <tr><td colSpan="6" className="py-8 text-center text-gray-400">Nenhuma transação recente.</td></tr> : (
              pedidos.map(pedido => (
                <tr key={pedido.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-xs font-bold text-gray-700">{pedido.id.slice(0, 8)}</td>
                  <td className="py-4 text-xs text-gray-600">{pedido.cliente_nome || 'Anônimo'}</td>
                  <td className="py-4 text-[11px] text-gray-400">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="py-4"><span className={`text-[9px] font-bold px-2 py-1 rounded-full ${pedido.status === 'Entregue' ? 'bg-emerald-50 text-emerald-600' : pedido.status === 'Processando' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{pedido.status || 'Processando'}</span></td>
                  <td className="py-4 text-xs font-bold text-right text-gray-700">R$ {pedido.total_valor?.toFixed(2) || '0,00'}</td>
                  <td className="py-4"><button onClick={() => onVerDetalhes(pedido)} className="text-[#D81B60] hover:underline text-xs flex items-center gap-1"><Eye size={14} /> Detalhes</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}