import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "5532984940952";
  const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os produtos da Lumina.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center animate-bounce"
      title="Fale Conosco"
    >
      <MessageCircle size={20} />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
        1
      </span>
    </a>
  );
}