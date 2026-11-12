"use client";

import { useEffect } from "react";
import Link from "next/link";
import CameraAr from "@/components/CameraAr";
import { getPrato, restaurante } from "@/lib/menu";
import { useSlugDaUrl } from "@/lib/useSlug";

export default function ArPage() {
  const slug = useSlugDaUrl();
  const prato = slug ? getPrato(slug) : null;

  useEffect(() => {
    if (prato) document.title = `${prato.nome} na câmera · ${restaurante.nome}`;
  }, [prato]);

  if (slug === undefined) {
    return (
      <p className="p-6 text-marfim-suave" role="status">
        Carregando…
      </p>
    );
  }

  if (!prato) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl">Prato não encontrado</h1>
        <Link href="/" className="btn-primario mt-6">
          Ver o cardápio
        </Link>
      </main>
    );
  }

  return <CameraAr prato={prato} />;
}
