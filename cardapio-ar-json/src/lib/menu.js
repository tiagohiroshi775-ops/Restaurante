// Toda a informação do cardápio vem de UM arquivo: src/data/cardapio.json
import dados from "@/data/cardapio.json";

export const restaurante = dados.restaurante;
export const categorias = dados.categorias;
export const pratos = dados.pratos;

export const getPrato = (slug) => pratos.find((p) => p.slug === slug) ?? null;

export const formatBRL = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatCm = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
