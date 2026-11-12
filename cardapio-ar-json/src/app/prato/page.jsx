"use client";

import { useEffect } from "react";
import Link from "next/link";
import PratoView from "@/components/PratoView";
import TopBar from "@/components/TopBar";
import { getPrato, restaurante } from "@/lib/menu";
import { useSlugDaUrl } from "@/lib/useSlug";

export default function PratoPage() {
  const slug = useSlugDaUrl();
  const prato = slug ? getPrato(slug) : null;

  useEffect(() => {
    if (prato) document.title = `${prato.nome} · ${restaurante.nome}`;
  }, [prato]);

  if (slug === undefined) {
    return (
      <>
        <TopBar back="/" />
        <p className="p-6 text-marfim-suave" role="status">
          Carregando…
        </p>
      </>
    );
  }

  if (!prato) {
    return (
      <>
        <TopBar back="/" />
        <main className="mx-auto max-w-md px-6 py-16 text-center">
          <h1 className="text-3xl">Prato não encontrado</h1>
          <p className="mt-3 text-marfim-suave">Esse endereço não corresponde a nenhum prato do cardápio.</p>
          <Link href="/" className="btn-primario mt-6">
            Ver o cardápio
          </Link>
        </main>
      </>
    );
  }

  return <PratoView prato={prato} />;
}
