"use client";

import { useEffect, useState } from "react";

/**
 * Lê o parâmetro ?slug=... do endereço (ex.: /prato?slug=hamburguer-da-casa).
 * Retorna undefined enquanto lê, null se não houver slug, ou o texto do slug.
 * (Páginas fixas com query string funcionam em qualquer hospedagem estática, sem rotas dinâmicas.)
 */
export function useSlugDaUrl() {
  const [slug, setSlug] = useState(undefined);
  useEffect(() => {
    try {
      setSlug(new URLSearchParams(window.location.search).get("slug"));
    } catch {
      setSlug(null);
    }
  }, []);
  return slug;
}
