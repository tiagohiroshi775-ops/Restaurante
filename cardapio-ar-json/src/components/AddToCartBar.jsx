"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_QTD, useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/menu";
import { IconMinus, IconPlus } from "./Icons";

export default function AddToCartBar({ prato }) {
  const { add } = useCart();
  const [qtd, setQtd] = useState(1);
  const [ok, setOk] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function adicionar() {
    add(prato, qtd);
    setQtd(1);
    setOk(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOk(false), 1600);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-carvao/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
        {prato.disponivel ? (
          <>
            <div className="flex items-center rounded-botao border border-linha" role="group" aria-label="Quantidade">
              <button
                className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
                onClick={() => setQtd((q) => Math.max(1, q - 1))}
                disabled={qtd <= 1}
                aria-label="Diminuir quantidade"
              >
                <IconMinus width={18} height={18} />
              </button>
              <span className="w-8 text-center" aria-live="polite">
                {qtd}
              </span>
              <button
                className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
                onClick={() => setQtd((q) => Math.min(MAX_QTD, q + 1))}
                disabled={qtd >= MAX_QTD}
                aria-label="Aumentar quantidade"
              >
                <IconPlus width={18} height={18} />
              </button>
            </div>
            <button className="btn-primario flex-1" onClick={adicionar}>
              {ok ? "Adicionado ✓" : `Adicionar · ${formatBRL(prato.preco * qtd)}`}
            </button>
          </>
        ) : (
          <button className="btn-secundario flex-1" disabled>
            Indisponível no momento
          </button>
        )}
      </div>
    </div>
  );
}
