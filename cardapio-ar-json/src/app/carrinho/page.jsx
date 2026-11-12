"use client";

import { useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { IconMinus, IconPlus } from "@/components/Icons";
import { MAX_QTD, useCart } from "@/lib/cart";
import { formatBRL, restaurante } from "@/lib/menu";
import { montarTextoPedido, urlWhatsApp } from "@/lib/pedido";

export default function CarrinhoPage() {
  const { items, total, mesa, setMesa, setQtd, clear, ready } = useCart();
  const [obs, setObs] = useState("");
  const [copiado, setCopiado] = useState(false);

  const texto = montarTextoPedido({ restaurante, items, mesa, obs });
  const linkZap = urlWhatsApp(restaurante.whatsapp, texto);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o pedido abaixo:", texto);
    }
  }

  return (
    <>
      <TopBar back="/" />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
        <h1 className="animate__animated animate__fadeIn text-4xl">Seu pedido</h1>

        {!ready ? (
          <p className="mt-6 text-marfim-suave" role="status">
            Carregando…
          </p>
        ) : items.length === 0 ? (
          <div className="card animate__animated animate__fadeIn mt-6 p-6 text-center">
            <p>Seu pedido está vazio.</p>
            <Link href="/" className="btn-primario mt-4">
              Ver o cardápio
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="card animate__animated animate__fadeInUp animate__faster flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/prato?slug=${i.slug}`} className="block truncate font-display text-lg">
                      {i.nome}
                    </Link>
                    <span className="text-apoio text-marfim-suave">{formatBRL(i.preco)} cada</span>
                  </div>
                  <div className="flex items-center rounded-botao border border-linha" role="group" aria-label={`Quantidade de ${i.nome}`}>
                    <button className="flex h-12 w-12 items-center justify-center" onClick={() => setQtd(i.id, i.qtd - 1)} aria-label="Diminuir quantidade">
                      <IconMinus width={18} height={18} />
                    </button>
                    <span className="w-7 text-center">{i.qtd}</span>
                    <button
                      className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
                      onClick={() => setQtd(i.id, i.qtd + 1)}
                      disabled={i.qtd >= MAX_QTD}
                      aria-label="Aumentar quantidade"
                    >
                      <IconPlus width={18} height={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <label htmlFor="mesa" className="block text-apoio text-marfim-suave">
                Número da mesa
              </label>
              <input id="mesa" className="campo" value={mesa} onChange={(e) => setMesa(e.target.value)} placeholder="Ex.: 5" inputMode="numeric" maxLength={20} />
              <label htmlFor="obs" className="block text-apoio text-marfim-suave">
                Observações (opcional)
              </label>
              <textarea id="obs" className="campo py-3" rows={3} maxLength={300} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: sem cebola" />
            </div>

            <div className="flex items-baseline justify-between border-t border-linha pt-4">
              <span className="text-marfim-suave">Total</span>
              <span className="text-3xl text-champagne">{formatBRL(total)}</span>
            </div>

            <div className="space-y-3">
              {linkZap ? (
                <a href={linkZap} target="_blank" rel="noopener noreferrer" className="btn-primario w-full">
                  Enviar pedido pelo WhatsApp
                </a>
              ) : (
                <p className="rounded-card border border-champagne/40 bg-cafe p-4 text-apoio text-marfim-suave">
                  O WhatsApp do restaurante ainda não foi configurado (campo <code>whatsapp</code> em <code>src/data/cardapio.json</code>). Por enquanto, copie o pedido e
                  mostre ao garçom.
                </p>
              )}
              <button className="btn-secundario w-full" onClick={copiar}>
                {copiado ? "Pedido copiado ✓" : "Copiar pedido"}
              </button>
              <button className="w-full py-3 text-apoio text-marfim-suave underline" onClick={clear}>
                Esvaziar pedido
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
