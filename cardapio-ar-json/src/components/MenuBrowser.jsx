"use client";

import { useMemo, useState } from "react";
import DishCard from "./DishCard";
import { IconClose, IconSearch } from "./Icons";

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Prateleira({ titulo, pratos }) {
  return (
    <section aria-label={titulo}>
      <h2 className="mb-4 text-2xl">{titulo}</h2>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {pratos.map((p) => (
          <DishCard key={p.id} prato={p} variante="tile" />
        ))}
      </div>
    </section>
  );
}

export default function MenuBrowser({ categorias, pratos }) {
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState(null);

  const consulta = norm(busca.trim());
  const filtrados = useMemo(
    () =>
      pratos.filter((p) => {
        if (cat && p.categoria !== cat) return false;
        if (!consulta) return true;
        return norm([p.nome, p.descricao ?? "", ...p.ingredientes].join(" ")).includes(consulta);
      }),
    [pratos, cat, consulta],
  );

  const navegando = !consulta && !cat;
  const destaques = pratos.filter((p) => p.destaque);
  const populares = pratos.filter((p) => p.popular);

  return (
    <div>
      <div className="sticky top-14 z-30 border-b border-linha bg-carvao/95 backdrop-blur">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-3">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-marfim-suave" width={18} height={18} />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar prato ou ingrediente"
              aria-label="Buscar no cardápio"
              className="campo pl-11"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-marfim-suave hover:text-marfim"
              >
                <IconClose width={18} height={18} />
              </button>
            )}
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Categorias">
            {[{ id: null, nome: "Tudo" }, ...categorias].map((c) => {
              const ativa = cat === c.id;
              return (
                <button
                  key={c.id ?? "tudo"}
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => setCat(c.id)}
                  className={`min-h-[44px] shrink-0 rounded-full border px-4 transition-colors duration-200 ${
                    ativa ? "border-champagne bg-champagne text-carvao" : "border-linha text-marfim-suave hover:border-champagne/60 hover:text-marfim"
                  }`}
                >
                  {c.nome}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        {navegando && destaques.length > 0 && <Prateleira titulo="Destaques da casa" pratos={destaques} />}
        {navegando && populares.length > 0 && <Prateleira titulo="Mais pedidos" pratos={populares} />}

        {filtrados.length === 0 ? (
          <p className="animate__animated animate__fadeIn card p-6 text-center text-marfim-suave" role="status">
            Nenhum prato encontrado. Tente outro nome ou ingrediente.
          </p>
        ) : (
          categorias
            .filter((c) => !cat || c.id === cat)
            .map((c) => {
              const doGrupo = filtrados.filter((p) => p.categoria === c.id);
              if (doGrupo.length === 0) return null;
              return (
                <section key={c.id} aria-labelledby={`cat-${c.id}`} className="animate__animated animate__fadeIn">
                  <h2 id={`cat-${c.id}`} className="mb-4 text-2xl">
                    {c.nome}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {doGrupo.map((p) => (
                      <DishCard key={p.id} prato={p} />
                    ))}
                  </div>
                </section>
              );
            })
        )}
      </div>
    </div>
  );
}
