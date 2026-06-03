import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Trash2, X, ShoppingCart, MessageCircle } from 'lucide-react';

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, cartTotal, addPoints, totalPoints, clearCart } = useCart();

  const handleCheckout = async () => {
    const phoneNumber = "5511999999999";
    
    try {
      const { error } = await supabase.from('pedidos').insert([
        { 
          total_valor: cartTotal, 
          itens_quantidade: cartItems.reduce((acc, item) => acc + item.quantity, 0),
          cliente_nome: "Cliente",
          cliente_email: "cliente@email.com",
          status: "Processando"
        }
      ]);
      if (error) throw error;

      const pontosGanhos = Math.floor(cartTotal);
      addPoints(pontosGanhos);
      alert(`✨ Você ganhou ${pontosGanhos} pontos! Total agora: ${totalPoints + pontosGanhos} pontos.`);
      clearCart();
    } catch (err) {
      console.error("Erro ao registrar pedido:", err);
    }

    const itensTexto = cartItems
      .map(item => `• ${item.nome} (${item.quantity}x)`)
      .join('\n');

    const mensagem = encodeURIComponent(
      `✨ *Novo Pedido - Lumina Cosmetics* ✨\n\n${itensTexto}\n\n💰 *Total: R$ ${cartTotal.toFixed(2)}*`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${mensagem}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-8 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl text-[#5D4037] flex items-center gap-3">
            <ShoppingCart className="text-[#D81B60]" /> Seu Carrinho
          </h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl">
              <img src={item.imagem_url} className="w-12 h-12 object-cover rounded-lg" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-700">{item.nome}</h4>
                <p className="text-xs text-[#D81B60]">R$ {item.preco.toFixed(2)}</p>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-rose-300"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between mb-6">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold text-[#D81B60]">R$ {cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} className="w-full bg-[#795548] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <MessageCircle size={20} /> FINALIZAR PEDIDO
          </button>
        </div>
      </div>
    </div>
  );
}