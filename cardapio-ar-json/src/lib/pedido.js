import { formatBRL } from "./menu";

/** Monta o texto do pedido (vai para o WhatsApp do restaurante ou para a área de transferência). */
export function montarTextoPedido({ restaurante, items, mesa, obs }) {
  const total = items.reduce((s, i) => s + i.preco * i.qtd, 0);
  const linhas = [`Pedido - ${restaurante.nome}`];
  if (mesa) linhas.push(`Mesa: ${mesa}`);
  linhas.push("");
  items.forEach((i) => linhas.push(`${i.qtd}x ${i.nome} - ${formatBRL(i.preco * i.qtd)}`));
  linhas.push("", `Total: ${formatBRL(total)}`);
  if (obs && obs.trim()) linhas.push("", `Obs.: ${obs.trim()}`);
  return linhas.join("\n");
}

/** Link do WhatsApp (https://wa.me/<numero>?text=...). Retorna null se o número não foi configurado. */
export function urlWhatsApp(numero, texto) {
  const n = String(numero || "").replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
