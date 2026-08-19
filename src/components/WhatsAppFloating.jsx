import { useEffect, useState } from "react";
import Icon from "./Icon";
import WhatsAppButton from "./WhatsAppButton";

export default function WhatsAppFloating() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisivel(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <WhatsAppButton
      mensagem="Olá! Gostaria de solicitar um orçamento para o meu tênis."
      aria-label="Falar no WhatsApp"
      style={{
        position: "fixed",
        right: "max(20px, env(safe-area-inset-right))",
        bottom: "max(20px, env(safe-area-inset-bottom))",
        zIndex: 150,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "var(--gold)",
        color: "var(--text-inverse)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px var(--gold-border)",
        opacity: visivel ? 1 : 0,
        transform: visivel ? "scale(1)" : "scale(0.8)",
        pointerEvents: visivel ? "auto" : "none",
        transition: "opacity .25s ease, transform .25s ease",
      }}
    >
      <Icon name="message-circle" size={26} />
    </WhatsAppButton>
  );
}
