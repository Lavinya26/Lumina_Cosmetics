import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../config/admin';

export default function AdminLogin() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      alert("Credenciais incorretas!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBFB] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-50 relative">
        {/* Botão Voltar para a Loja */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1  font-bold text-[12px] uppercase tracking-widest hover:underline transition"
        >
          <ArrowLeft size={16} /> Voltar para a loja
        </Link>

        <h1 className="text-3xl  text-center mb-2 pt-6">LUMINA</h1>
        <p className="text-center text-gray-400 text-sm mb-8 uppercase tracking-widest font-bold">Admin Access</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <input 
              type="text" placeholder="Usuário" required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <input 
              type="password" placeholder="Senha" required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-100"
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <button className="w-full bg-[#795548] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#5D4037] transition-all">
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
}