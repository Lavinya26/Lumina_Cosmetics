import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, User, Mail, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';

export default function ClienteLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const navigate = useNavigate();
  const { setCliente } = useCart(); // 👈 pega a função do contexto

  const handleVoltar = () => {
    navigate('/?aba=profile');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', email)
        .eq('senha', senha);

      if (error) throw error;

      if (data && data.length > 0) {
        const clienteLogado = data[0];
        // Salva no localStorage
        localStorage.setItem('cliente_logado', JSON.stringify(clienteLogado));
        // Atualiza o contexto do carrinho IMEDIATAMENTE
        setCliente(clienteLogado);
        
        Swal.fire({
          icon: 'success',
          title: 'Bem-vindo(a)!',
          text: `Olá ${clienteLogado.nome}, você está logado.`,
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/');
      } else {
        Swal.fire('Erro', 'E-mail ou senha incorretos', 'error');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      Swal.fire('Erro', 'Não foi possível fazer login. Tente novamente.', 'error');
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();

    // Verifica se o e-mail já existe antes de tentar inserir
    const { data: existingUser, error: checkError } = await supabase
      .from('clientes')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      Swal.fire({
        icon: 'warning',
        title: 'E-mail já cadastrado',
        text: 'Este e-mail já possui uma conta. Faça login diretamente.',
        confirmButtonText: 'Ir para login',
        showCancelButton: true,
        cancelButtonText: 'Tentar outro e-mail'
      }).then((result) => {
        if (result.isConfirmed) {
          setIsCadastro(false);
          setEmail('');
          setSenha('');
        }
      });
      return;
    }

    if (checkError && checkError.code !== 'PGRST116') {
      Swal.fire('Erro', 'Não foi possível verificar o e-mail. Tente novamente.', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ nome, email, senha, whatsapp, pontos: 0, nivel: 'Bronze' }])
        .select();

      if (error) {
        if (error.code === '23505') {
          Swal.fire('E-mail duplicado', 'Este e-mail já está cadastrado. Faça login.', 'warning');
        } else {
          Swal.fire('Erro ao cadastrar', error.message, 'error');
        }
      } else if (data && data.length > 0) {
        const novoCliente = data[0];
        // Salva no localStorage
        localStorage.setItem('cliente_logado', JSON.stringify(novoCliente));
        // Atualiza o contexto do carrinho IMEDIATAMENTE
        setCliente(novoCliente);
        
        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado!',
          text: 'Você já está logado.',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/');
      } else {
        Swal.fire('Erro', 'Não foi possível cadastrar. Tente novamente.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Não foi possível cadastrar. Tente novamente.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-50 relative">
        <button
          onClick={handleVoltar}
          className="absolute top-6 left-6 flex items-center gap-1 text-[#D81B60] font-bold text-[12px] uppercase tracking-widest hover:underline transition"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <h1 className="text-3xl text-[#D81B60] text-center mb-2 pt-6">LUMINA</h1>
        <p className="text-center text-gray-400 text-sm mb-8 uppercase tracking-widest">
          {isCadastro ? 'Criar Conta' : 'Acesso do Cliente'}
        </p>

        <form onSubmit={isCadastro ? handleCadastro : handleLogin} className="space-y-5">
          {isCadastro && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="Nome completo"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input
                  type="password"
                  placeholder="Senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="WhatsApp (opcional)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
                />
              </div>
            </>
          )}
          {!isCadastro && (
            <>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input
                  type="password"
                  placeholder="Senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#795548] to-[#5D4037] text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all transform hover:scale-[1.02]"
          >
            {isCadastro ? 'CADASTRAR' : 'ENTRAR'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {isCadastro ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsCadastro(!isCadastro);
              setNome('');
              setEmail('');
              setSenha('');
              setWhatsapp('');
            }}
            className="text-[#D81B60] font-bold hover:underline"
          >
            {isCadastro ? 'Faça login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}