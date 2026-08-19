import { WHATSAPP_NUMBER } from "../data/constants";

export function wppUrl(mensagem) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export default function WhatsAppButton({
  mensagem,
  className,
  style,
  children,
  ...rest
}) {
  return (
    <a
      href={wppUrl(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ textDecoration: "none", ...style }}
      {...rest}
    >
      {children}
    </a>
  );
}
