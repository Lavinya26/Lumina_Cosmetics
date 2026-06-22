import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, ShoppingBag, Menu, Star, Sparkles, Smile, Scissors, Wind, 
  Leaf, Home, LayoutGrid, Gift, User, X, Trash2, Mail, Phone, 
  Settings, LogOut, Package, ChevronRight, Edit3, ArrowLeft, MapPin, 
  Shield, HelpCircle, Bell, Moon, CreditCard, Globe, MessageCircle, Gem, Plus, CheckCircle2, Save, Camera, Lock, EyeOff, FileText, Truck, RefreshCw, LifeBuoy, LogIn, ArrowUp,
  CreditCard as CardIcon, Banknote, QrCode
} from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import PointsProgress from '../components/PointsProgress';
import ProductGrid from '../components/ProductGrid';
import WhatsAppButton from '../components/WhatsAppButton';

export default function StoreFront() {
  const location = useLocation();
  const [produtos, setProdutos] = useState([]);
  const [produtosOfertas, setProdutosOfertas] = useState([]);
  const [produtosMaisBaratos, setProdutosMaisBaratos] = useState([]);
  const [produtosRecentes, setProdutosRecentes] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('HOME');
  const [subAbaAtiva, setSubAbaAtiva] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [beneficioModal, setBeneficioModal] = useState({ isOpen: false, title: '', message: '' });
  const [menuAberto, setMenuAberto] = useState(false);
  const [niveisModal, setNiveisModal] = useState({ open: false, nivel: null });

  const [pedidosCliente, setPedidosCliente] = useState([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);
  const [trackingModal, setTrackingModal] = useState({ open: false, pedido: null });

  const [carrosselIndex, setCarrosselIndex] = useState(0);
  const [carrosselImages, setCarrosselImages] = useState([]);

  // Estado para busca mobile
  const [searchOpen, setSearchOpen] = useState(false);

  // Modal de detalhes
  const [produtoDetalhe, setProdutoDetalhe] = useState(null);
  const [detalheQuantidade, setDetalheQuantidade] = useState(1);
  const [cepFrete, setCepFrete] = useState('');
  const [freteCalculado, setFreteCalculado] = useState(null);

  const { 
    addToCart, 
    cartItems, 
    removeFromCart,
    clearCart,
    addPoints,
    totalPoints,
    getMemberLevel,
    pointsToNextLevel,
    nextLevelName,
    progressPercent,
    cartTotal,
    cliente,
    setCliente
  } = useCart();

  // Endereços
  const [enderecos, setEnderecos] = useState(() => {
    const saved = localStorage.getItem('lumina_enderecos');
    return saved ? JSON.parse(saved) : [
      { id: 1, titulo: 'Principal', endereco: 'Rua das Flores, 123 - Ap 42' }
    ];
  });
  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({ titulo: '', endereco: '' });

  useEffect(() => {
    localStorage.setItem('lumina_enderecos', JSON.stringify(enderecos));
  }, [enderecos]);

  const [doisFatoresAtivo, setDoisFatoresAtivo] = useState(() => {
    const saved = localStorage.getItem('lumina_2fa');
    return saved === 'true';
  });
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [termoBuscaAjuda, setTermoBuscaAjuda] = useState('');
  const [faqSelecionada, setFaqSelecionada] = useState(null);
  const faqs = [
    { pergunta: 'Status do meu pedido', resposta: 'Para acompanhar o status do seu pedido, acesse o menu "Meus Pedidos" no seu perfil. Lá você encontrará o código de rastreio enviado por e-mail. Em até 24h úteis o status é atualizado.' },
    { pergunta: 'Política de Devolução', resposta: 'Você tem até 7 dias corridos após o recebimento para solicitar a devolução. O produto deve estar na embalagem original, sem uso. Entre em contato pelo nosso e-mail suporte@lumina.com.br ou pelo WhatsApp.' },
    { pergunta: 'Prazos de Entrega', resposta: 'O prazo médio é de 3 a 7 dias úteis para Sudeste, 5 a 12 para as demais regiões. O frete grátis para membros Prata/Ouro é válido para compras acima de R$150.' },
    { pergunta: 'Como usar meus pontos', resposta: 'A cada R$1 gasto você ganha 1 ponto. Os pontos são automaticamente convertidos em descontos em compras futuras (10 pontos = R$0,50). Também troque por produtos exclusivos na área Lumina Club.' }
  ];

  const faqsFiltradas = faqs.filter(faq => 
    faq.pergunta.toLowerCase().includes(termoBuscaAjuda.toLowerCase())
  );

  const [notificacoes, setNotificacoes] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalcularFrete = () => {
    if (!cepFrete || cepFrete.length < 8) {
      Swal.fire('CEP inválido', 'Digite um CEP com 8 dígitos', 'warning');
      return;
    }
    const valor = (produtoDetalhe?.preco || 0) * 0.05;
    const prazo = Math.floor(Math.random() * 5) + 3;
    setFreteCalculado({
      valor: valor,
      prazo: prazo,
      valorFormatado: valor.toFixed(2)
    });
    Swal.fire('Frete calculado', `Valor: R$ ${valor.toFixed(2)} - Prazo: ${prazo} dias úteis`, 'success');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const aba = params.get('aba');
    if (aba === 'profile') {
      setAbaAtiva('PROFILE');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search]);

  useEffect(() => {
    localStorage.setItem('lumina_2fa', doisFatoresAtivo);
  }, [doisFatoresAtivo]);

  useEffect(() => {
    async function fetchProdutos() {
      let query = supabase.from('produtos').select('*');
      if (categoriaAtiva !== 'Todos') query = query.eq('categoria', categoriaAtiva);
      const { data } = await query;
      setProdutos(data || []);
    }
    fetchProdutos();
  }, [categoriaAtiva]);

  useEffect(() => {
    async function fetchProdutosOfertas() {
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .not('preco_antigo', 'is', null)
        .gt('preco_antigo', 0);
      setProdutosOfertas(data || []);
    }
    if (abaAtiva === 'OFFERS') {
      fetchProdutosOfertas();
    }
  }, [abaAtiva]);

  useEffect(() => {
    async function fetchProdutosMaisBaratos() {
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .order('preco', { ascending: true })
        .limit(12);
      setProdutosMaisBaratos(data || []);
    }
    fetchProdutosMaisBaratos();
  }, []);

  const nomesCarrossel = [
    'Gloss Labial Radiante',
    'Pó Translúcido Fixador',
    'Máscara de Cílios Volume Extreme',
    'Batom Matte Vermelho Intenso',
    'Base Líquida Matte',
    'Sérum Vitamina C',
    'Shampoo Reconstrutor'
  ];

  useEffect(() => {
    async function fetchProdutosCarrossel() {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .in('nome', nomesCarrossel);
        if (error) throw error;
        setProdutosRecentes(data || []);
        const imagens = (data || []).filter(p => p.imagem_url).map(p => p.imagem_url);
        setCarrosselImages(imagens);
      } catch (error) {
        console.error('Erro ao carregar produtos do carrossel:', error);
        setCarrosselImages([]);
      }
    }
    fetchProdutosCarrossel();
  }, []);

  useEffect(() => {
    if (carrosselImages.length <= 1) return;
    const interval = setInterval(() => {
      setCarrosselIndex((prev) => (prev + 1) % carrosselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carrosselImages]);

  async function carregarPedidosCliente() {
    if (!cliente || !cliente.email) return;
    setCarregandoPedidos(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_email', cliente.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPedidosCliente(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setPedidosCliente([]);
    } finally {
      setCarregandoPedidos(false);
    }
  }

  useEffect(() => {
    if (subAbaAtiva === 'PEDIDOS' && cliente) {
      carregarPedidosCliente();
    }
  }, [subAbaAtiva, cliente]);

  const voltarAnterior = () => setSubAbaAtiva(null);

  const handleLogoutAdmin = () => {
    localStorage.removeItem('lumina_user');
    Swal.fire('Desconectado', 'Você saiu da conta do administrador.', 'info');
    setAbaAtiva('HOME');
    setSubAbaAtiva(null);
    setMenuAberto(false);
  };

  const handleLogoutCliente = () => {
    localStorage.removeItem('cliente_logado');
    setCliente(null);
    Swal.fire('Até logo!', 'Você saiu da sua conta.', 'success');
    setAbaAtiva('HOME');
    setSubAbaAtiva(null);
    setMenuAberto(false);
  };

  const handleBeneficioClick = (tipo) => {
    if (tipo === 'frete') {
      setBeneficioModal({
        isOpen: true,
        title: '✨ Frete Grátis',
        message: `Como membro ${getMemberLevel()} do Lumina Club, você tem frete grátis em compras acima de R$ 150! Use o cupom LUMINAFREE no checkout.`
      });
    } else if (tipo === 'drops') {
      setBeneficioModal({
        isOpen: true,
        title: '🚀 Drops Exclusivos',
        message: 'Membros Lumina Club têm acesso antecipado a lançamentos e produtos exclusivos. Fique de olho no seu e-mail e na nossa loja! Em breve, novo drop de verão.'
      });
    }
  };

  const closeModal = () => setBeneficioModal({ isOpen: false, title: '', message: '' });

  const adicionarEndereco = () => {
    if (!novoEndereco.titulo.trim() || !novoEndereco.endereco.trim()) {
      Swal.fire('Campos vazios', 'Preencha título e endereço.', 'warning');
      return;
    }
    const novo = {
      id: Date.now(),
      titulo: novoEndereco.titulo.trim(),
      endereco: novoEndereco.endereco.trim()
    };
    setEnderecos([...enderecos, novo]);
    setNovoEndereco({ titulo: '', endereco: '' });
    setModalEnderecoAberto(false);
    Swal.fire('Endereço adicionado', 'Novo endereço salvo com sucesso!', 'success');
  };

  const removerEndereco = (id) => {
    if (enderecos.length === 1) {
      Swal.fire('Atenção', 'Você precisa manter pelo menos um endereço.', 'warning');
      return;
    }
    setEnderecos(enderecos.filter(e => e.id !== id));
    Swal.fire('Removido', 'Endereço removido com sucesso.', 'success');
  };

  const handleAlterarSenha = () => {
    if (!novaSenha) {
      Swal.fire('Senha vazia', 'Digite uma nova senha.', 'warning');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Swal.fire('Senhas diferentes', 'As senhas não coincidem.', 'error');
      return;
    }
    localStorage.setItem('lumina_senha', btoa(novaSenha));
    Swal.fire('Senha alterada', 'Sua senha foi atualizada com sucesso!', 'success');
    setModalSenhaAberto(false);
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleLimparHistorico = () => {
    Swal.fire({
      title: 'Limpar histórico?',
      text: 'Todas as buscas e dados de navegação serão apagados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D81B60',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sim, limpar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setBusca('');
        localStorage.removeItem('lumina_busca_recente');
        Swal.fire('Histórico limpo', 'Seu histórico de navegação foi apagado.', 'success');
      }
    });
  };

  const handleChatOnline = () => {
    Swal.fire('Chat Online', 'Em breve nosso chat estará disponível. Enquanto isso, fale conosco pelo WhatsApp!', 'info');
  };

  const handleEmail = () => {
    window.location.href = 'mailto:suporte@lumina.com.br?subject=Ajuda - Lumina Cosmetics';
  };

  const handleFinalizarPedido = async () => {
    if (cartItems.length === 0) {
      Swal.fire('Carrinho vazio', 'Adicione produtos antes de finalizar o pedido.', 'warning');
      return;
    }

    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          total_valor: cartTotal,
          itens_quantidade: cartItems.reduce((acc, item) => acc + item.quantity, 0),
          status: 'Processando',
          cliente_nome: cliente?.nome || 'Anônimo',
          cliente_email: cliente?.email || 'nao_informado@email.com',
          created_at: new Date().toISOString()
        })
        .select();

      if (pedidoError) throw pedidoError;

      const pedidoId = pedido[0].id;

      for (const item of cartItems) {
        const { error: itemError } = await supabase
          .from('pedido_itens')
          .insert({
            pedido_id: pedidoId,
            produto_id: item.id,
            nome: item.nome,
            quantidade: item.quantity,
            preco_unitario: item.preco
          });
        if (itemError) console.error('Erro ao inserir item:', itemError);
      }

      const pontosGanhos = Math.floor(cartTotal);
      await addPoints(pontosGanhos);

      const phoneNumber = '5511999999999';
      const itensTexto = cartItems.map(item => 
        `• ${item.nome} (${item.quantity}x) - R$ ${(item.preco * item.quantity).toFixed(2)}`
      ).join('%0A');
      const mensagem = `✨ *Novo Pedido - Lumina Cosmetics* ✨%0A%0A${itensTexto}%0A%0A💰 *Total: R$ ${cartTotal.toFixed(2)}*%0A%0A👤 Cliente: ${cliente?.nome || 'Anônimo'}%0A📧 ${cliente?.email || 'nao_informado@email.com'}`;
      window.open(`https://wa.me/${phoneNumber}?text=${mensagem}`, '_blank');

      clearCart();
      Swal.fire('Pedido realizado!', `Você ganhou ${pontosGanhos} pontos.`, 'success');
      setAbaAtiva('HOME');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      Swal.fire('Erro no pedido', 'Não foi possível processar o pedido. Tente novamente.', 'error');
    }
  };

  const navigateTo = (aba) => {
    setAbaAtiva(aba);
    setSubAbaAtiva(null);
    setMenuAberto(false);
  };

  const categoriaCores = {
    MAKE: 'bg-rose-100 text-rose-500 hover:bg-rose-200',
    SKINCARE: 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200',
    CABELO: 'bg-sky-100 text-sky-500 hover:bg-sky-200',
    PERFUME: 'bg-amber-100 text-amber-500 hover:bg-amber-200',
    BIO: 'bg-purple-100 text-purple-500 hover:bg-purple-200'
  };

  const niveisInfo = [
    {
      nivel: 'Bronze',
      pontos: '0 - 499',
      cor: 'bg-amber-600',
      corFundo: 'bg-amber-50',
      texto: 'Nível inicial. Ganhe 1 ponto por cada R$1 gasto.',
      beneficios: ['Frete grátis em compras acima de R$200', 'Acesso a ofertas mensais']
    },
    {
      nivel: 'Prata',
      pontos: '500 - 999',
      cor: 'bg-gray-400',
      corFundo: 'bg-gray-50',
      texto: 'Nível intermediário. Ganhe 1,5 pontos por R$1 gasto.',
      beneficios: ['Frete grátis em compras acima de R$150', 'Acesso antecipado a lançamentos', 'Brinde de aniversário']
    },
    {
      nivel: 'Ouro',
      pontos: '1000+',
      cor: 'bg-yellow-500',
      corFundo: 'bg-yellow-50',
      texto: 'Nível máximo. Ganhe 2 pontos por R$1 gasto.',
      beneficios: ['Frete grátis em todas as compras', 'Drops exclusivos semanais', 'Desconto especial de 10%', 'Atendimento prioritário']
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden pb-28 font-sans ${modoEscuro ? 'bg-slate-900' : 'bg-[#fef2f3]'}`}>
      
      {/* Sidebar Menu */}
      {menuAberto && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuAberto(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[#D81B60] font-bold text-xl">Menu</h2>
              <button onClick={() => setMenuAberto(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button onClick={() => navigateTo('HOME')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors text-left">
                <Home size={20} className="text-[#D81B60]" />
                <span className="text-sm font-medium text-gray-700">Início</span>
              </button>
              <button onClick={() => navigateTo('SHOP')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors text-left">
                <LayoutGrid size={20} className="text-[#D81B60]" />
                <span className="text-sm font-medium text-gray-700">Produtos</span>
              </button>
              <button onClick={() => navigateTo('OFFERS')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors text-left">
                <Gift size={20} className="text-[#D81B60]" />
                <span className="text-sm font-medium text-gray-700">Ofertas</span>
              </button>
              <button onClick={() => navigateTo('PROFILE')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors text-left">
                <User size={20} className="text-[#D81B60]" />
                <span className="text-sm font-medium text-gray-700">Meu Perfil</span>
              </button>
              <button onClick={() => { setMenuAberto(false); setAbaAtiva('CART'); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors text-left">
                <ShoppingBag size={20} className="text-[#D81B60]" />
                <span className="text-sm font-medium text-gray-700">Carrinho</span>
                {cartItems.length > 0 && (
                  <span className="ml-auto bg-[#D81B60] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <div className="border-t border-gray-100 my-4"></div>
              {cliente && (
                <button onClick={handleLogoutCliente} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left">
                  <LogOut size={20} className="text-red-500" />
                  <span className="text-sm font-medium text-red-500">Sair da Conta</span>
                </button>
              )}
              <button 
                onClick={() => { window.location.href = '/login'; }} 
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <Shield size={20} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Área do Admin</span>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Modais */}
      {beneficioModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#D81B60]">{beneficioModal.title}</h3>
              <button onClick={closeModal} className="text-gray-400"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-700 mb-6">{beneficioModal.message}</p>
            <button onClick={closeModal} className="w-full bg-[#795548] text-white py-3 rounded-2xl font-bold text-sm">Entendi</button>
          </div>
        </div>
      )}

      {modalEnderecoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#D81B60]">Novo Endereço</h3>
              <button onClick={() => setModalEnderecoAberto(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Título (ex: Casa, Trabalho)" 
                value={novoEndereco.titulo}
                onChange={(e) => setNovoEndereco({...novoEndereco, titulo: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              />
              <input 
                type="text" 
                placeholder="Endereço completo" 
                value={novoEndereco.endereco}
                onChange={(e) => setNovoEndereco({...novoEndereco, endereco: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              />
              <button onClick={adicionarEndereco} className="w-full bg-[#795548] text-white py-3 rounded-2xl font-bold">Salvar Endereço</button>
            </div>
          </div>
        </div>
      )}

      {modalSenhaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#D81B60]">Alterar Senha</h3>
              <button onClick={() => setModalSenhaAberto(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Nova senha" 
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              />
              <input 
                type="password" 
                placeholder="Confirmar nova senha" 
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 ring-pink-200"
              />
              <button onClick={handleAlterarSenha} className="w-full bg-[#795548] text-white py-3 rounded-2xl font-bold">Salvar Senha</button>
            </div>
          </div>
        </div>
      )}

      {faqSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#D81B60]">{faqSelecionada.pergunta}</h3>
              <button onClick={() => setFaqSelecionada(null)} className="text-gray-400"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-700 mb-6">{faqSelecionada.resposta}</p>
            <button onClick={() => setFaqSelecionada(null)} className="w-full bg-[#795548] text-white py-3 rounded-2xl font-bold text-sm">Fechar</button>
          </div>
        </div>
      )}

      {niveisModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#D81B60]">Programa Lumina Club</h3>
              <button onClick={() => setNiveisModal({ open: false, nivel: null })} className="text-gray-400"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Conheça os níveis e benefícios exclusivos.</p>
            <div className="space-y-4">
              {niveisInfo.map((nivel, idx) => (
                <div key={idx} className={`rounded-2xl p-4 border ${nivel.corFundo} border-gray-100`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${nivel.cor}`}></div>
                    <h4 className="font-bold text-gray-800">{nivel.nivel}</h4>
                    <span className="text-xs text-gray-400 ml-auto">{nivel.pontos} pontos</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{nivel.texto}</p>
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Benefícios:</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {nivel.beneficios.map((beneficio, i) => (
                        <li key={i}>{beneficio}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setNiveisModal({ open: false, nivel: null })}
              className="mt-6 w-full bg-[#795548] text-white py-2 rounded-xl font-bold text-sm hover:bg-[#5D4037] transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {produtoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl relative">
            <button 
              onClick={() => {
                setProdutoDetalhe(null);
                setDetalheQuantidade(1);
                setFreteCalculado(null);
                setCepFrete('');
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>

            <div className="flex flex-col md:flex-row p-6 gap-6">
              <div className="md:w-1/2">
                <div className="sticky top-6">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <img 
                      src={produtoDetalhe.imagem_url || '/images/placeholder.png'} 
                      alt={produtoDetalhe.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {produtoDetalhe.preco_antigo && produtoDetalhe.preco_antigo > produtoDetalhe.preco && (
                    <div className="mt-2 inline-block bg-[#D81B60] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {Math.round((1 - produtoDetalhe.preco / produtoDetalhe.preco_antigo) * 100)}% OFF
                    </div>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <p className="text-xs text-[#D81B60] font-bold uppercase tracking-wider">{produtoDetalhe.categoria}</p>
                <h2 className="text-2xl font-bold text-gray-800">{produtoDetalhe.nome}</h2>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-xs text-gray-500">(123 avaliações)</span>
                </div>
                <div className="flex items-center gap-3">
                  {produtoDetalhe.preco_antigo && produtoDetalhe.preco_antigo > produtoDetalhe.preco ? (
                    <>
                      <span className="text-2xl font-bold text-[#D81B60]">R$ {produtoDetalhe.preco.toFixed(2)}</span>
                      <span className="text-sm text-gray-400 line-through">R$ {produtoDetalhe.preco_antigo.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-[#D81B60]">R$ {produtoDetalhe.preco.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">em até 3x de R$ {(produtoDetalhe.preco / 3).toFixed(2)} sem juros</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                  <div className="flex border border-gray-200 rounded-lg">
                    <button onClick={() => setDetalheQuantidade(Math.max(1, detalheQuantidade - 1))} className="px-3 py-1 hover:bg-gray-50">-</button>
                    <span className="px-3 py-1 min-w-[40px] text-center">{detalheQuantidade}</span>
                    <button onClick={() => setDetalheQuantidade(detalheQuantidade + 1)} className="px-3 py-1 hover:bg-gray-50">+</button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    for (let i = 0; i < detalheQuantidade; i++) addToCart(produtoDetalhe);
                    setProdutoDetalhe(null);
                    setDetalheQuantidade(1);
                    setFreteCalculado(null);
                    setCepFrete('');
                    Swal.fire('Adicionado!', `${detalheQuantidade}x ${produtoDetalhe.nome} foi adicionado ao carrinho.`, 'success');
                  }}
                  className="w-full bg-[#795548] text-white py-3 rounded-2xl font-bold hover:bg-[#5D4037] transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} /> ADICIONAR AO CARRINHO
                </button>
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Calcular frete</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Digite seu CEP" 
                      value={cepFrete}
                      onChange={(e) => setCepFrete(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                    <button onClick={handleCalcularFrete} className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">OK</button>
                  </div>
                  {freteCalculado && (
                    <div className="mt-2 text-sm">
                      <p className="text-green-600">Frete: R$ {freteCalculado.valorFormatado}</p>
                      <p className="text-gray-500">Prazo: {freteCalculado.prazo} dias úteis</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Consultar frete e prazo de entrega</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Descrição do produto</h4>
                  <p className="text-sm text-gray-600">
                    {produtoDetalhe.descricao || "Produto de alta qualidade desenvolvido para realçar sua beleza. Fórmula exclusiva com ingredientes selecionados que proporcionam resultados incríveis. Ideal para uso diário, com textura leve e absorção rápida."}
                  </p>
                </div>
                <p className="text-xs text-gray-400">Código: {produtoDetalhe.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER FIXO */}
      <header className={`fixed top-0 left-0 right-0 z-40 py-4 px-6 flex justify-between items-center shadow-md backdrop-blur-md ${modoEscuro ? 'bg-slate-900/90' : 'bg-white/90'}`}>
        <button onClick={() => setMenuAberto(true)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Menu size={24} className="text-gray-500" />
        </button>
        <h1 className={`text-sm font-bold tracking-[0.3em] uppercase ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Lumina Cosmetics</h1>
        <div className="flex items-center gap-3">
          {/* BUSCA DESKTOP - sempre visível */}
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Buscar produto..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`w-48 px-3 py-1.5 rounded-full border text-xs focus:outline-none focus:ring-2 focus:ring-[#D81B60] ${modoEscuro ? 'bg-slate-800 border-slate-700 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-700'}`}
            />
          </div>

          {/* BUSCA MOBILE - ícone expansível */}
          <div className="md:hidden flex items-center">
            {searchOpen ? (
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Buscar produto..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onBlur={() => setSearchOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                  autoFocus
                  className="w-40 px-3 py-1.5 rounded-full border text-xs focus:outline-none focus:ring-2 focus:ring-[#D81B60] bg-white border-gray-200 text-gray-700"
                />
                <button 
                  onClick={() => setSearchOpen(false)} 
                  className="ml-1 p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search size={22} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* CARRINHO */}
          <button 
            onClick={() => setAbaAtiva('CART')}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingBag size={22} className="text-gray-500 hover:text-[#D81B60] transition-colors" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D81B60] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        
        {/* HOME */}
        {abaAtiva === 'HOME' && (
          <div className="animate-in fade-in duration-500">
            <section className="relative w-full h-[300px] rounded-[40px] overflow-hidden mt-6 shadow-lg">
              <img 
                src="/imagens/banner-verao.png" 
                className="absolute inset-0 w-full h-full object-cover object-center"
                alt="banner"
                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=880&auto=format"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center pl-10 space-y-4">
                <span className="bg-[#D81B60] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase w-fit shadow-md">Limited Edition</span>
                <h2 className="text-3xl leading-tight text-white drop-shadow-lg">Ofertas de Verão - Até 40% OFF</h2>
                <button onClick={() => setAbaAtiva('SHOP')} className="bg-[#D81B60] hover:bg-[#c2185b] text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase transition-all shadow-md w-fit">Comprar Agora</button>
              </div>
            </section>

            <section className="mt-12 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              <CategoryCircle icon={Sparkles} label="MAKE" active={categoriaAtiva === 'Maquiagem'} onClick={() => {setCategoriaAtiva('Maquiagem'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.MAKE} />
              <CategoryCircle icon={Smile} label="SKINCARE" active={categoriaAtiva === 'Skincare'} onClick={() => {setCategoriaAtiva('Skincare'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.SKINCARE} />
              <CategoryCircle icon={Scissors} label="CABELO" active={categoriaAtiva === 'Cabelo'} onClick={() => {setCategoriaAtiva('Cabelo'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.CABELO} />
              <CategoryCircle icon={Wind} label="PERFUME" active={categoriaAtiva === 'Fragrâncias'} onClick={() => {setCategoriaAtiva('Fragrâncias'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.PERFUME} />
              <CategoryCircle icon={Leaf} label="BIO" active={categoriaAtiva === 'Bio'} onClick={() => {setCategoriaAtiva('Bio'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.BIO} />
            </section>

            <section className="mt-8">
              <PointsProgress currentPoints={Math.max(0, totalPoints)} maxPoints={500} />
            </section>

            <section className="mt-12 mb-10">
              <div className="flex justify-between items-center mb-8 px-2">
                <h3 className={`text-xl font-bold ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Destaques da Semana</h3>
                <button onClick={() => setAbaAtiva('SHOP')} className="text-[10px] font-bold text-[#D81B60] uppercase tracking-wider hover:underline">Ver Todos →</button>
              </div>
              {busca ? (
                <ProductGrid categoria={categoriaAtiva} busca={busca} onImageClick={(prod) => setProdutoDetalhe(prod)} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {produtos.slice(0, 4).map((p) => (
                    <ProductCard 
                      key={p.id} 
                      produto={p} 
                      onAdd={() => addToCart(p)} 
                      modoEscuro={modoEscuro}
                      onImageClick={(prod) => setProdutoDetalhe(prod)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* SHOP */}
        {abaAtiva === 'SHOP' && (
          <div className="py-10">
            <button onClick={() => setAbaAtiva('HOME')} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase tracking-widest hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <h2 className={`text-2xl font-bold mb-6 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Todos os Produtos</h2>
            <section className="mt-6 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              <CategoryCircle icon={LayoutGrid} label="TODOS" active={categoriaAtiva === 'Todos'} onClick={() => {setCategoriaAtiva('Todos'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.MAKE} />
              <CategoryCircle icon={Sparkles} label="MAKE" active={categoriaAtiva === 'Maquiagem'} onClick={() => {setCategoriaAtiva('Maquiagem'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.MAKE} />
              <CategoryCircle icon={Smile} label="SKINCARE" active={categoriaAtiva === 'Skincare'} onClick={() => {setCategoriaAtiva('Skincare'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.SKINCARE} />
              <CategoryCircle icon={Scissors} label="CABELO" active={categoriaAtiva === 'Cabelo'} onClick={() => {setCategoriaAtiva('Cabelo'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.CABELO} />
              <CategoryCircle icon={Wind} label="PERFUME" active={categoriaAtiva === 'Fragrâncias'} onClick={() => {setCategoriaAtiva('Fragrâncias'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.PERFUME} />
              <CategoryCircle icon={Leaf} label="BIO" active={categoriaAtiva === 'Bio'} onClick={() => {setCategoriaAtiva('Bio'); setBusca('');}} modoEscuro={modoEscuro} colorClass={categoriaCores.BIO} />
            </section>
            <ProductGrid categoria={categoriaAtiva} busca={busca} onImageClick={(prod) => setProdutoDetalhe(prod)} />
          </div>
        )}

        {/* OFFERS */}
        {abaAtiva === 'OFFERS' && (
          <div className="py-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#D81B60] mb-2">Ofertas Imperdíveis</h2>
              <p className="text-sm text-gray-500">Produtos selecionados com preços especiais</p>
            </div>

            {carrosselImages.length > 0 ? (
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 shadow-lg">
                {carrosselImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === carrosselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <img src={img} alt={`Produto ${idx + 1}`} className="w-full h-full object-cover object-center" />
                  </div>
                ))}
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                  {carrosselImages.map((_, idx) => (
                    <button key={idx} onClick={() => setCarrosselIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === carrosselIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-100 rounded-2xl mb-10">
                <p className="text-gray-500">Nenhum produto disponível no carrossel.</p>
              </div>
            )}

            {produtosMaisBaratos.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl">
                <p className="text-gray-400">Carregando ofertas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produtosMaisBaratos.map((produto) => (
                  <ProductCard key={produto.id} produto={produto} onAdd={() => addToCart(produto)} modoEscuro={modoEscuro} onImageClick={(prod) => setProdutoDetalhe(prod)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CART */}
        {abaAtiva === 'CART' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={() => setAbaAtiva('HOME')} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase tracking-widest hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <h2 className={`text-2xl font-bold mb-6 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Seu Carrinho</h2>
            {cartItems.length === 0 ? (
              <p className={`text-center ${modoEscuro ? 'text-gray-400' : 'text-gray-400'}`}>Seu carrinho está vazio.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className={`flex gap-4 items-center p-4 rounded-2xl shadow-md hover:shadow-lg transition-all ${modoEscuro ? 'bg-slate-800' : 'bg-white'}`}>
                      <img src={item.imagem_url} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${modoEscuro ? 'text-white' : 'text-gray-700'}`}>{item.nome}</h4>
                        <p className="text-xs text-[#D81B60]">R$ {item.preco.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-rose-300 hover:text-rose-500 transition"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                <div className={`border-t pt-4 mt-4 ${modoEscuro ? 'border-slate-700' : 'border-gray-100'}`}>
                  <div className="flex justify-between mb-4">
                    <span className={modoEscuro ? 'text-gray-300' : 'text-gray-600'}>Total</span>
                    <span className="font-bold text-[#D81B60]">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={handleFinalizarPedido} className="w-full bg-gradient-to-r from-[#795548] to-[#5D4037] text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all transform hover:scale-[1.02]">
                    Finalizar Pedido
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PROFILE */}
        {abaAtiva === 'PROFILE' && !subAbaAtiva && (
          <div className="py-10 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-100 rounded-full flex items-center justify-center text-[#D81B60] border-4 border-white shadow-lg overflow-hidden">
                  <User size={48} />
                </div>
                <button onClick={() => setSubAbaAtiva('EDIT_PROFILE')} className="absolute bottom-0 right-0 bg-[#D81B60] p-2 rounded-full text-white border-2 border-white shadow-sm hover:bg-[#c2185b] transition"><Edit3 size={12} /></button>
              </div>
              <h2 className={`text-xl font-bold mt-4 uppercase ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>
                {cliente?.nome || 'VISITANTE'}
              </h2>
              <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${modoEscuro ? 'text-gray-300' : 'text-gray-500'}`}>
                Lumina {getMemberLevel()} Member
              </p>
            </div>
            <div className="space-y-3">
              <ProfileItem icon={ShoppingBag} title="Meus Pedidos" desc="Rastreio e histórico" onClick={() => setSubAbaAtiva('PEDIDOS')} modoEscuro={modoEscuro} />
              <ProfileItem icon={Star} title="Lumina Club" desc="Seus pontos e mimos" onClick={() => setSubAbaAtiva('CLUB')} modoEscuro={modoEscuro} />
              <ProfileItem icon={Settings} title="Configurações" desc="Preferências e conta" onClick={() => setAbaAtiva('SETTINGS')} modoEscuro={modoEscuro} />
            </div>
            {cliente && (
              <button onClick={handleLogoutCliente} className="mt-6 w-full flex items-center justify-center gap-2 p-3 text-red-500 font-bold text-[10px] uppercase bg-red-50 rounded-2xl hover:bg-red-100 transition">
                <LogOut size={14} /> Sair da Conta
              </button>
            )}
            {!cliente && (
              <button onClick={() => window.location.href = '/cliente-login'} className="mt-6 w-full flex items-center justify-center gap-2 p-3 bg-[#D81B60] text-white font-bold text-[10px] uppercase rounded-2xl hover:bg-[#c2185b] transition shadow-md">
                <LogIn size={14} /> Entrar / Cadastrar
              </button>
            )}
          </div>
        )}

        {/* MEUS PEDIDOS */}
        {subAbaAtiva === 'PEDIDOS' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase tracking-widest hover:underline">
              <ArrowLeft size={14}/> Voltar
            </button>
            <h2 className={`text-2xl font-bold mb-6 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Meus Pedidos</h2>
            
            {!cliente ? (
              <div className="text-center py-10 bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-400">Faça login para ver seus pedidos.</p>
                <button onClick={() => window.location.href = '/cliente-login'} className="mt-4 bg-[#D81B60] text-white px-4 py-2 rounded-xl text-sm">Entrar</button>
              </div>
            ) : carregandoPedidos ? (
              <div className="text-center py-10">Carregando pedidos...</div>
            ) : pedidosCliente.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-400">Você ainda não realizou nenhum pedido.</p>
                <button onClick={() => setAbaAtiva('SHOP')} className="mt-4 bg-[#795548] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#5D4037] transition">Começar a comprar</button>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosCliente.map(pedido => (
                  <div key={pedido.id} className={`p-5 rounded-2xl shadow-md border transition-all hover:shadow-lg ${pedido.status === 'Entregue' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          pedido.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                          pedido.status === 'Enviado' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{pedido.status || 'Processando'}</span>
                        <p className="text-[10px] text-gray-400 mt-2 font-mono">Pedido #{pedido.id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800">R$ {pedido.total_valor?.toFixed(2) || '0,00'}</p>
                        <p className="text-[9px] text-gray-400">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTrackingModal({ open: true, pedido })}
                      className="w-full py-2.5 rounded-xl bg-gray-100 text-[10px] font-bold uppercase text-gray-600 hover:bg-gray-200 transition"
                    >
                      {pedido.status === 'Entregue' ? 'VER DETALHES DA ENTREGA' : 'RASTREAR PEDIDO'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {trackingModal.open && trackingModal.pedido && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl text-[#D81B60]">Rastreamento do Pedido</h3>
                    <button onClick={() => setTrackingModal({ open: false, pedido: null })} className="text-gray-400"><X size={20}/></button>
                  </div>
                  <div className="space-y-3">
                    <div className="border-b pb-2">
                      <p className="text-xs text-gray-400">Código de rastreio</p>
                      <p className="text-sm font-mono font-bold">{trackingModal.pedido.id.slice(0, 8)}-BR</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-xs text-gray-400">Status atual</p>
                      <p className="text-sm font-bold text-[#D81B60]">{trackingModal.pedido.status || 'Processando'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Histórico</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {trackingModal.pedido.status === 'Entregue' ? (
                          <>
                            <li>✅ Entregue em {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                            <li>📦 Saiu para entrega - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                            <li>🚚 Em trânsito - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                            <li>📦 Pedido confirmado - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                          </>
                        ) : trackingModal.pedido.status === 'Enviado' ? (
                          <>
                            <li>📦 Em trânsito - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                            <li>✅ Pedido confirmado - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                          </>
                        ) : (
                          <>
                            <li>⏳ Processando pagamento - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                            <li>✅ Pedido confirmado - {new Date(trackingModal.pedido.created_at).toLocaleDateString('pt-BR')}</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTrackingModal({ open: false, pedido: null })}
                    className="mt-6 w-full bg-[#795548] text-white py-2 rounded-xl font-bold text-sm hover:bg-[#5D4037] transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LUMINA CLUB */}
        {subAbaAtiva === 'CLUB' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[10px] mb-6 flex items-center gap-2 uppercase tracking-widest"><ArrowLeft size={14}/> Voltar</button>
            
            <div 
              onClick={() => setNiveisModal({ open: true, nivel: null })}
              className={`p-8 rounded-[40px] text-white mb-8 shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform ${
                getMemberLevel() === 'Bronze' ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                getMemberLevel() === 'Prata' ? 'bg-gradient-to-br from-gray-500 to-gray-700' :
                'bg-gradient-to-br from-yellow-500 to-yellow-700'
              }`}
            >
              <Gem className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Lumina Club</p>
              <h2 className="text-3xl mb-6 italic">Status {getMemberLevel()}</h2>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-white h-full" style={{ width: `${progressPercent()}%` }}></div>
              </div>
              <p className="text-[9px] opacity-70">
                {pointsToNextLevel() === 0 ? "Parabéns! Você atingiu o nível máximo!" : `Faltam ${pointsToNextLevel()} pontos para o nível ${nextLevelName()}`}
              </p>
              <div className="mt-3 text-[8px] text-white/60 flex justify-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded-full">Clique para saber mais</span>
              </div>
            </div>

            <div className="space-y-3">
              <BeneficioItem icon={Package} title="Frete Grátis" desc="Em todos os pedidos" onClick={() => handleBeneficioClick('frete')} modoEscuro={modoEscuro} />
              <BeneficioItem icon={Sparkles} title="Drops Exclusivos" desc="Acesso antecipado" onClick={() => handleBeneficioClick('drops')} modoEscuro={modoEscuro} />
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {abaAtiva === 'SETTINGS' && !subAbaAtiva && (
          <div className="py-10 max-w-md mx-auto">
            <button 
              onClick={() => setAbaAtiva('PROFILE')} 
              className={`flex items-center gap-2 font-bold text-[10px] mb-8 uppercase tracking-widest transition 
                ${modoEscuro ? 'text-pink-300 hover:text-pink-200' : 'text-[#D81B60] hover:underline'}`}
            >
              <ArrowLeft size={16} /> Voltar ao Perfil
            </button>
            
            <h2 className={`text-2xl font-bold mb-6 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>
              Configurações
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className={`text-[10px] font-bold uppercase tracking-widest ml-4 ${modoEscuro ? 'text-gray-300' : 'text-gray-400'}`}>
                  Conta
                </h3>
                <div className={`rounded-[30px] overflow-hidden shadow-sm ${modoEscuro ? 'bg-slate-800 border-slate-700' : 'border border-gray-100 bg-white'}`}>
                  <SettingLink icon={User} title="Editar Perfil" onClick={() => setSubAbaAtiva('EDIT_PROFILE')} modoEscuro={modoEscuro} />
                  <SettingLink icon={CreditCard} title="Pagamentos" onClick={() => setSubAbaAtiva('PAYMENTS')} modoEscuro={modoEscuro} />
                  <SettingLink icon={MapPin} title="Endereços" onClick={() => setSubAbaAtiva('ADDRESSES')} modoEscuro={modoEscuro} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={`text-[10px] font-bold uppercase tracking-widest ml-4 ${modoEscuro ? 'text-gray-300' : 'text-gray-400'}`}>
                  Suporte e App
                </h3>
                <div className={`rounded-[30px] overflow-hidden shadow-sm ${modoEscuro ? 'bg-slate-800 border-slate-700' : 'border border-gray-100 bg-white'}`}>
                  <SettingToggle icon={Bell} title="Notificações" active={notificacoes} onToggle={() => setNotificacoes(!notificacoes)} modoEscuro={modoEscuro} />
                  <SettingToggle icon={Moon} title="Modo Escuro" active={modoEscuro} onToggle={() => setModoEscuro(!modoEscuro)} modoEscuro={modoEscuro} />
                  <SettingLink icon={Shield} title="Privacidade e Segurança" onClick={() => setSubAbaAtiva('PRIVACY')} modoEscuro={modoEscuro} />
                  <SettingLink icon={HelpCircle} title="Central de Ajuda" onClick={() => setSubAbaAtiva('HELP')} modoEscuro={modoEscuro} />
                </div>
              </div>

              <button 
                onClick={handleLogoutAdmin} 
                className="w-full flex items-center justify-center gap-2 p-5 font-bold text-[10px] uppercase rounded-[25px] border transition
                  bg-red-50/20 text-red-400 border-red-50 hover:bg-red-50"
              >
                <LogOut size={16} /> Sair (Admin)
              </button>
            </div>
          </div>
        )}

        {/* EDIT PROFILE */}
        {subAbaAtiva === 'EDIT_PROFILE' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase tracking-widest hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <div className="space-y-5">
              <InputGroup label="Nome Completo" placeholder={cliente?.nome || 'Maria Silva'} modoEscuro={modoEscuro} />
              <InputGroup label="E-mail" placeholder={cliente?.email || 'maria.silva@email.com'} modoEscuro={modoEscuro} />
              <InputGroup label="WhatsApp" placeholder={cliente?.whatsapp || '(11) 98765-4321'} modoEscuro={modoEscuro} />
              <button className="w-full bg-gradient-to-r from-[#D81B60] to-[#c2185b] text-white p-5 rounded-[25px] font-bold text-[10px] uppercase shadow-lg flex items-center justify-center gap-2 mt-4 hover:shadow-xl transition">
                <Save size={16} /> Salvar Dados
              </button>
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {subAbaAtiva === 'PAYMENTS' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <h2 className={`text-2xl font-bold mb-6 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Pagamentos</h2>
            <div className={`p-6 rounded-[30px] flex items-center justify-between shadow-sm ${modoEscuro ? 'bg-slate-800 border-pink-800 border' : 'bg-white border-2 border-pink-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-7 bg-slate-900 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                <p className={`text-xs font-bold ${modoEscuro ? 'text-white' : 'text-gray-800'}`}>**** 4589</p>
              </div>
              <CheckCircle2 size={18} className="text-green-500" />
            </div>
          </div>
        )}

        {/* ADDRESSES */}
        {subAbaAtiva === 'ADDRESSES' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <h2 className={`text-2xl font-bold mb-6 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Endereços</h2>
            <div className="space-y-3">
              {enderecos.map((end) => (
                <div key={end.id} className={`p-5 rounded-[30px] shadow-sm flex items-center justify-between ${modoEscuro ? 'bg-slate-800' : 'bg-white border border-gray-100'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-[#D81B60]" />
                      <span className="text-xs font-bold text-[#D81B60] uppercase">{end.titulo}</span>
                    </div>
                    <p className={`text-sm ${modoEscuro ? 'text-gray-300' : 'text-gray-700'}`}>{end.endereco}</p>
                  </div>
                  <button onClick={() => removerEndereco(end.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setModalEnderecoAberto(true)} className="w-full mt-6 bg-[#5D4037] text-white p-5 rounded-[25px] font-bold text-[10px] uppercase flex items-center justify-center gap-2 shadow-md hover:bg-[#795548] transition-colors">
              <Plus size={14}/> Novo Endereço
            </button>
          </div>
        )}

        {/* PRIVACY */}
        {subAbaAtiva === 'PRIVACY' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase tracking-widest hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <h2 className={`text-2xl font-bold mb-8 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Privacidade</h2>
            <div className={`rounded-[35px] overflow-hidden shadow-sm ${modoEscuro ? 'bg-slate-800' : 'bg-white border border-gray-100'}`}>
              <PrivacyItem icon={Lock} title="Senha da Conta" desc="Atualizada há 3 meses" onClick={() => setModalSenhaAberto(true)} modoEscuro={modoEscuro} />
              <PrivacyToggle icon={Shield} title="Autenticação em 2 Etapas" desc="Ativada" active={doisFatoresAtivo} onToggle={() => setDoisFatoresAtivo(!doisFatoresAtivo)} modoEscuro={modoEscuro} />
              <PrivacyItem icon={EyeOff} title="Limpar Histórico de Navegação" desc="Apagar buscas e dados" onClick={handleLimparHistorico} modoEscuro={modoEscuro} />
            </div>
          </div>
        )}

        {/* HELP */}
        {subAbaAtiva === 'HELP' && (
          <div className="py-10 max-w-md mx-auto">
            <button onClick={voltarAnterior} className="text-[#D81B60] font-bold text-[12px] mb-6 flex items-center gap-2 uppercase tracking-widest hover:underline"><ArrowLeft size={14}/> Voltar</button>
            <h2 className={`text-2xl font-bold mb-2 px-2 ${modoEscuro ? 'text-white' : 'text-[#5D4037]'}`}>Como podemos ajudar?</h2>
            <p className={`text-xs mb-8 px-2 ${modoEscuro ? 'text-gray-300' : 'text-gray-400'}`}>Encontre soluções rápidas ou fale conosco.</p>

            <div className="relative mb-8 px-2">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                placeholder="Busque por 'Trocas', 'Frete'..." 
                value={termoBuscaAjuda}
                onChange={(e) => setTermoBuscaAjuda(e.target.value)}
                className={`w-full p-5 pl-14 rounded-[25px] text-xs shadow-sm focus:ring-1 focus:ring-pink-100 outline-none ${modoEscuro ? 'bg-slate-800 border-slate-700 text-white placeholder:text-gray-400' : 'bg-white border border-gray-100'}`} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={handleChatOnline} className={`p-6 rounded-[35px] text-center hover:scale-105 transition-transform ${modoEscuro ? 'bg-slate-800' : 'bg-[#FDF2F5]'}`}>
                <MessageCircle className="mx-auto mb-3 text-[#D81B60]" />
                <p className="text-[10px] font-bold uppercase">Chat Online</p>
                <p className="text-[8px] text-pink-400 mt-1">Disponível agora</p>
              </button>
              <button onClick={handleEmail} className={`p-6 rounded-[35px] text-center hover:scale-105 transition-transform ${modoEscuro ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Mail className="mx-auto mb-3 text-slate-400" />
                <p className="text-[10px] font-bold uppercase">E-mail</p>
                <p className="text-[8px] text-gray-400 mt-1">Resp. em 24h</p>
              </button>
            </div>

            <h3 className={`text-[10px] font-bold uppercase tracking-widest ml-4 mb-4 ${modoEscuro ? 'text-gray-300' : 'text-gray-400'}`}>Dúvidas Frequentes</h3>
            <div className="space-y-3">
              {faqsFiltradas.length > 0 ? (
                faqsFiltradas.map((faq, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setFaqSelecionada(faq)}
                    className={`w-full p-5 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-pink-100 transition-colors text-left ${modoEscuro ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-white border border-gray-50'}`}
                  >
                    <span className={`text-xs font-medium ${modoEscuro ? 'text-gray-200' : 'text-slate-700'}`}>{faq.pergunta}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#D81B60]" />
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-400 text-xs">Nenhuma pergunta encontrada para "{termoBuscaAjuda}"</p>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-20 border-t border-pink-100 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[#D81B60] font-bold text-2xl mb-2">Lumina</h3>
              <p className={`text-sm italic mb-4 leading-relaxed ${modoEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                A beleza que nasce da sua verdade.<br />
                Elegância que se revela em cada gesto.
              </p>
              <div className="mt-4">
                <p className={`text-sm font-semibold ${modoEscuro ? 'text-gray-200' : 'text-gray-700'}`}>Sobre Nós</p>
                <p className={`text-sm mt-1 leading-relaxed ${modoEscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                  Na Lumina Cosmetics, acreditamos que cuidar de si é um ato de amor próprio. 
                  Unimos ingredientes nobres, inovação sustentável e design exclusivo para criar 
                  cosméticos que despertam sua melhor versão. Cada produto é pensado para oferecer 
                  resultados reais com toque de sofisticação, porque sua pele e sua alma merecem 
                  um ritual tão especial quanto você.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#D81B60] font-bold text-lg mb-3">Contato</h4>
                <ul className={`space-y-2 text-sm ${modoEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center gap-2"><Phone size={16} /> (32) 98494-0952</li>
                  <li className="flex items-center gap-2"><Mail size={16} /> contato@luminacosmetics.com.br</li>
                  <li className="flex items-center gap-2"><MapPin size={16} /> Muriaé - MG</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#D81B60] font-bold text-lg mb-3">Horário</h4>
                <ul className={`space-y-1 text-sm ${modoEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Segunda a Sexta: 9h às 18h</li>
                  <li>Sábado: 9h às 14h</li>
                  <li>Domingo: Fechado</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-pink-100 pt-8">
            <div>
              <h4 className="text-[#D81B60] font-bold text-lg mb-3">Redes Sociais</h4>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/luminacosmetics" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#D81B60] transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.332.014 7.052.072 5.197.158 3.766.5 2.516 1.75 1.266 3 0.924 4.431 0.838 6.288 0.78 7.568 0.766 7.977 0.766 11.23s0.014 3.662.072 4.942c.086 1.857.428 3.288 1.678 4.538s2.681 1.592 4.538 1.678c1.28.058 1.689.072 4.942.072s3.662-.014 4.942-.072c1.857-.086 3.288-.428 4.538-1.678s1.592-2.681 1.678-4.538c.058-1.28.072-1.689.072-4.942s-.014-3.662-.072-4.942c-.086-1.857-.428-3.288-1.678-4.538s-2.681-1.592-4.538-1.678C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@luminacosmetics" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#D81B60] transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v3.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.76-.08 1.4-.54 2.79-1.35 3.99-1.31 1.92-3.58 3.17-5.91 3.21-1.43.02-2.86-.35-4.08-.99-1.62-.86-2.87-2.41-3.42-4.22-.44-1.44-.59-2.97-.34-4.46.25-1.51.84-2.93 1.72-4.13 1.08-1.49 2.58-2.66 4.31-3.34 1.46-.57 3.01-.85 4.57-.82.03 1.5.04 3.01.02 4.51-.95-.18-1.92-.15-2.86.09-.72.18-1.38.56-1.91 1.06-.54.5-.92 1.15-1.09 1.86-.19.77-.14 1.58.14 2.31.25.68.68 1.28 1.21 1.73.53.44 1.16.74 1.83.86.67.12 1.35.05 2-.18.58-.2 1.08-.58 1.46-1.05.38-.47.63-1.03.73-1.62.1-.58.07-1.16.04-1.74.04-3.31.02-6.62.02-9.93z"/></svg>
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-2">@luminacosmetics</p>
            </div>

            <div>
              <h4 className="text-[#D81B60] font-bold text-lg mb-3">Formas de Pagamento</h4>
              <div className="flex flex-wrap gap-6 items-center">
                <div className={`flex items-center gap-2 ${modoEscuro ? 'text-gray-300' : 'text-gray-700'}`}><QrCode size={24} /> Pix</div>
                <div className={`flex items-center gap-2 ${modoEscuro ? 'text-gray-300' : 'text-gray-700'}`}><CardIcon size={24} /> Cartão de Crédito</div>
                <div className={`flex items-center gap-2 ${modoEscuro ? 'text-gray-300' : 'text-gray-700'}`}><Banknote size={24} /> Boleto Bancário</div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Pix com 10% de desconto | Até 12x sem juros no cartão
              </p>
            </div>
          </div>

          <div className="flex justify-center my-8">
            <button
              onClick={scrollToTop}
              className="bg-[#D81B60] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#c2185b] transition shadow-md flex items-center gap-2"
            >
              <ArrowUp size={16} /> voltar ao topo
            </button>
          </div>

          <div className="border-t border-pink-100 pt-6 text-center text-xs text-gray-400 space-y-2">
            <p>© 2026 Lumina Cosmetics | Todos os direitos reservados</p>
            <p>CNPJ: 17.947.581/0001-76 | Centro, 1000 - Muriaé/MG - CEP: 36.880-000</p>
          </div>
        </footer>
      </main>

      {/* BOTTOM NAVBAR */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t p-4 flex justify-around items-center z-40 ${modoEscuro ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100 shadow-md'}`}>
        <TabButton icon={Home} label="HOME" active={abaAtiva === 'HOME'} onClick={() => {setAbaAtiva('HOME'); setSubAbaAtiva(null); setBusca('');}} modoEscuro={modoEscuro} />
        <TabButton icon={LayoutGrid} label="SHOP" active={abaAtiva === 'SHOP'} onClick={() => {setAbaAtiva('SHOP'); setSubAbaAtiva(null);}} modoEscuro={modoEscuro} />
        <TabButton icon={Gift} label="OFFERS" active={abaAtiva === 'OFFERS'} onClick={() => {setAbaAtiva('OFFERS'); setSubAbaAtiva(null);}} modoEscuro={modoEscuro} />
        <div className="border-2 border-dashed border-pink-100 rounded-2xl px-2">
          <TabButton icon={User} label="PROFILE" active={abaAtiva === 'PROFILE' || abaAtiva === 'SETTINGS'} onClick={() => {setAbaAtiva('PROFILE'); setSubAbaAtiva(null);}} modoEscuro={modoEscuro} />
        </div>
      </nav>

      <WhatsAppButton />
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========
function CategoryCircle({ icon: Icon, label, active, onClick, modoEscuro, colorClass }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-3 min-w-[75px]">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#5D4037] text-white shadow-lg' : colorClass || (modoEscuro ? 'bg-slate-800 border-slate-700 text-[#D81B60]' : 'bg-white border border-gray-100 text-[#D81B60]')}`}>
        <Icon size={20} />
      </div>
      <span className={`text-[9px] font-bold ${active ? 'text-[#D81B60]' : modoEscuro ? 'text-gray-400' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}

function ProductCard({ produto, onAdd, modoEscuro, onImageClick }) {
  const hasDiscount = produto.preco_antigo && produto.preco_antigo > produto.preco;
  const [animating, setAnimating] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAnimating(true);
    onAdd();
    setAdded(true);
    setTimeout(() => {
      setAnimating(false);
      setTimeout(() => setAdded(false), 1500);
    }, 300);
  };

  return (
    <div className={`flex flex-col group rounded-3xl p-4 shadow-sm transition-all ${modoEscuro ? 'bg-white border-gray-200' : 'bg-white border border-gray-50 hover:shadow-md'}`}>
      <div 
        className="aspect-[4/5] rounded-[35px] overflow-hidden bg-gray-50 mb-3 shadow-sm relative cursor-pointer"
        onClick={() => onImageClick && onImageClick(produto)}
      >
        <img 
          src={produto.imagem_url || '/images/placeholder.png'} 
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          onError={(e) => e.target.src = '/images/placeholder.png'}
        />
      </div>
      <h3 className={`font-bold text-[11px] px-1 line-clamp-1 ${modoEscuro ? 'text-gray-800' : 'text-slate-800'}`}>{produto.nome}</h3>
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="flex items-center gap-1 flex-wrap">
          {hasDiscount && <span className="text-[9px] text-gray-400 line-through">R$ {produto.preco_antigo.toFixed(2)}</span>}
          <span className="text-xs font-bold text-[#D81B60]">R$ {produto.preco.toFixed(2)}</span>
        </div>
        <button 
          onClick={handleAdd}
          disabled={animating}
          className={`text-[8px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            added 
              ? 'bg-green-500 border-green-500 text-white' 
              : animating 
                ? 'scale-95 bg-[#D81B60] text-white border-[#D81B60]' 
                : modoEscuro 
                  ? 'bg-gray-100 border-gray-200 text-gray-700' 
                  : 'bg-white border-gray-100 shadow-sm'
          }`}
        >
          {added ? '✓ ADICIONADO!' : 'ADICIONAR'}
        </button>
      </div>
    </div>
  );
}

function ProfileItem({ icon: Icon, title, desc, onClick, modoEscuro }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-6 rounded-[35px] shadow-sm active:scale-95 transition-all ${modoEscuro ? 'bg-slate-800 border-slate-700' : 'bg-white border border-gray-100'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${modoEscuro ? 'bg-slate-700' : 'bg-pink-50'} text-[#D81B60]`}><Icon size={20}/></div>
        <div className="text-left">
          <p className={`text-xs font-bold ${modoEscuro ? 'text-white' : 'text-slate-800'}`}>{title}</p>
          <p className={`text-[9px] ${modoEscuro ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</p>
        </div>
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </button>
  );
}

function BeneficioItem({ icon: Icon, title, desc, onClick, modoEscuro }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-[30px] shadow-sm hover:shadow-md transition-all text-left ${modoEscuro ? 'bg-slate-800 border-slate-700' : 'bg-white border border-gray-100'}`}>
      <div className={`p-3 rounded-2xl ${modoEscuro ? 'bg-slate-700' : 'bg-pink-50'} text-[#D81B60]`}><Icon size={20} /></div>
      <div>
        <p className={`text-xs font-bold ${modoEscuro ? 'text-white' : 'text-slate-800'}`}>{title}</p>
        <p className={`text-[10px] ${modoEscuro ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</p>
      </div>
    </button>
  );
}

function SettingLink({ icon: Icon, title, onClick, modoEscuro }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-between p-5 transition-colors border-b last:border-0 
        ${modoEscuro ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-50 hover:bg-pink-50/10'}`}
    >
      <div className="flex items-center gap-4 text-left">
        <div className={`p-2 rounded-xl ${modoEscuro ? 'bg-slate-700 text-pink-400' : 'bg-pink-50 text-[#D81B60]'}`}>
          <Icon size={20} />
        </div>
        <p className={`text-sm font-bold ${modoEscuro ? 'text-white' : 'text-gray-800'}`}>{title}</p>
      </div>
      <ChevronRight size={16} className={`${modoEscuro ? 'text-gray-500' : 'text-gray-300'}`} />
    </button>
  );
}

function SettingToggle({ icon: Icon, title, active, onToggle, modoEscuro }) {
  return (
    <div className={`w-full flex items-center justify-between p-5 border-b last:border-0 
      ${modoEscuro ? 'border-slate-700' : 'border-gray-50'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${modoEscuro ? 'bg-slate-700 text-pink-400' : 'bg-pink-50 text-[#D81B60]'}`}>
          <Icon size={20} />
        </div>
        <p className={`text-sm font-bold ${modoEscuro ? 'text-white' : 'text-gray-800'}`}>{title}</p>
      </div>
      <div 
        onClick={onToggle} 
        className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${active ? 'bg-[#D81B60]' : 'bg-gray-400'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick, modoEscuro }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-[#D81B60]' : modoEscuro ? 'text-gray-400' : 'text-gray-300'}`}>
      <Icon size={20} fill={active ? 'currentColor' : 'none'} />
      <span className="text-[8px] font-bold uppercase">{label}</span>
    </button>
  );
}

function PrivacyItem({ icon: Icon, title, desc, onClick, modoEscuro }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-5 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${modoEscuro ? 'border-gray-100 hover:bg-gray-800' : 'border-gray-50'}`}>
      <div className="flex items-center gap-4 text-left">
        <div className={`p-2 rounded-xl ${modoEscuro ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-400'}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className={`text-xs font-bold ${modoEscuro ? 'text-white' : 'text-slate-800'}`}>{title}</p>
          <p className={`text-[9px] ${modoEscuro ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</p>
        </div>
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </button>
  );
}

function PrivacyToggle({ icon: Icon, title, desc, active, onToggle, modoEscuro }) {
  return (
    <div className={`w-full flex items-center justify-between p-5 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${modoEscuro ? 'border-gray-100 hover:bg-gray-800' : 'border-gray-50'}`}>
      <div className="flex items-center gap-4 text-left">
        <div className={`p-2 rounded-xl ${modoEscuro ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-400'}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className={`text-xs font-bold ${modoEscuro ? 'text-white' : 'text-slate-800'}`}>{title}</p>
          <p className={`text-[9px] ${modoEscuro ? 'text-gray-400' : 'text-gray-400'}`}>{desc}</p>
        </div>
      </div>
      <div onClick={onToggle} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${active ? 'bg-[#D81B60]' : 'bg-gray-400'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}

function InputGroup({ label, placeholder, modoEscuro }) {
  return (
    <div className="space-y-1.5 px-2">
      <label className={`text-[10px] font-bold uppercase tracking-widest ml-2 ${modoEscuro ? 'text-gray-300' : 'text-gray-400'}`}>{label}</label>
      <input 
        placeholder={placeholder} 
        className={`w-full p-4 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-pink-200 transition-all ${modoEscuro ? 'bg-slate-800 border border-slate-700 text-white placeholder:text-gray-500' : 'bg-white border border-gray-100'}`} 
      />
    </div>
  );
}