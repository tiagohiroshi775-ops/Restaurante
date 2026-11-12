"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/**
 * QR Code por mesa: o endereço termina em ?mesa=5 (ex.: https://seusite.com/?mesa=5).
 * O número é guardado no aparelho e vai junto no pedido.
 */
export default function TableBadge() {
  const { mesa, setMesa, ready } = useCart();

  useEffect(() => {
    if (!ready) return;
    try {
      const m = new URLSearchParams(window.location.search).get("mesa");
      if (m && m.trim()) setMesa(m.trim());
    } catch {
      /* sem URLSearchParams: ignora */
    }
  }, [ready, setMesa]);

  if (!mesa) return null;
  return (
    <span className="animate__animated animate__fadeIn inline-flex items-center gap-2 rounded-full border border-linha px-3 py-1 text-apoio text-marfim-suave">
      Mesa <strong className="font-medium text-marfim">{mesa}</strong>
    </span>
  );
}
