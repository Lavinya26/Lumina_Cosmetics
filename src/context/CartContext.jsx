import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('lumina_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Carrega cliente do localStorage
  const [cliente, setCliente] = useState(() => {
    const saved = localStorage.getItem('cliente_logado');
    return saved ? JSON.parse(saved) : null;
  });
  const [totalPoints, setTotalPoints] = useState(() => {
    if (cliente) return cliente.pontos || 0;
    const savedPoints = localStorage.getItem('lumina_points');
    return savedPoints ? parseInt(savedPoints) : 0;
  });

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (cliente) {
      localStorage.setItem('cliente_logado', JSON.stringify(cliente));
      localStorage.setItem('lumina_points', cliente.pontos || 0);
    }
  }, [cliente]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.preco * item.quantity, 0);

  const addPoints = async (points) => {
    const novosPontos = totalPoints + points;
    setTotalPoints(novosPontos);

    if (cliente) {
      await supabase
        .from('clientes')
        .update({ pontos: novosPontos })
        .eq('id', cliente.id);

      const clienteAtualizado = { ...cliente, pontos: novosPontos };
      localStorage.setItem('cliente_logado', JSON.stringify(clienteAtualizado));
      setCliente(clienteAtualizado);
    } else {
      localStorage.setItem('lumina_points', novosPontos);
    }
  };

  const getMemberLevel = () => {
    if (totalPoints >= 1000) return 'Ouro';
    if (totalPoints >= 500) return 'Prata';
    return 'Bronze';
  };

  const pointsToNextLevel = () => {
    if (totalPoints >= 1000) return 0;
    if (totalPoints >= 500) return 1000 - totalPoints;
    return 500 - totalPoints;
  };

  const nextLevelName = () => {
    if (totalPoints >= 1000) return 'Ouro (máximo)';
    if (totalPoints >= 500) return 'Ouro';
    return 'Prata';
  };

  const progressPercent = () => {
    if (totalPoints >= 1000) return 100;
    if (totalPoints >= 500) return ((totalPoints - 500) / 500) * 100;
    return (totalPoints / 500) * 100;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      totalPoints,
      addPoints,
      getMemberLevel,
      pointsToNextLevel,
      nextLevelName,
      progressPercent,
      cliente,
      setCliente
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);