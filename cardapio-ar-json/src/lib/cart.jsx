"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "cardapio-carrinho-v1";
const MESA_KEY = "cardapio-mesa-v1";
export const MAX_QTD = 20;

const CartCtx = createContext(null);

// O localStorage pode estar bloqueado (aba anônima etc.): tudo dentro de try/catch.
function ler(chave, padrao) {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}
function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: o carrinho continua funcionando enquanto a página estiver aberta */
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [mesa, setMesaState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(ler(CART_KEY, []));
    setMesaState(ler(MESA_KEY, ""));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) gravar(CART_KEY, items);
  }, [items, ready]);

  const setMesa = useCallback((valor) => {
    const v = String(valor).slice(0, 20);
    setMesaState(v);
    gravar(MESA_KEY, v);
  }, []);

  const add = useCallback((prato, qtd = 1) => {
    setItems((atual) => {
      const i = atual.findIndex((x) => x.id === prato.id);
      if (i >= 0) {
        const copia = [...atual];
        copia[i] = { ...copia[i], qtd: Math.min(MAX_QTD, copia[i].qtd + qtd) };
        return copia;
      }
      return [...atual, { id: prato.id, slug: prato.slug, nome: prato.nome, preco: prato.preco, qtd: Math.min(MAX_QTD, qtd) }];
    });
  }, []);

  const setQtd = useCallback((id, qtd) => {
    setItems((atual) =>
      qtd <= 0 ? atual.filter((x) => x.id !== id) : atual.map((x) => (x.id === id ? { ...x, qtd: Math.min(MAX_QTD, qtd) } : x)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((s, x) => s + x.qtd, 0);
    const total = Math.round(items.reduce((s, x) => s + x.preco * x.qtd, 0) * 100) / 100;
    return { items, count, total, mesa, setMesa, add, setQtd, clear, ready };
  }, [items, mesa, setMesa, add, setQtd, clear, ready]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
