import Link from "next/link";
import { formatBRL } from "@/lib/menu";
import DishPhoto from "./DishPhoto";
import { IconCube } from "./Icons";

function Selos({ prato }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {!prato.disponivel && <span className="rounded-full border border-brasa/60 px-2 py-0.5 text-apoio text-brasa">Indisponível</span>}
      {prato.modelo && (
        <span className="inline-flex items-center gap-1 rounded-full border border-champagne/50 px-2 py-0.5 text-apoio text-champagne">
          <IconCube width={14} height={14} /> AR 3D
        </span>
      )}
    </span>
  );
}

/** variante "tile": cartão vertical (carrossel). "row": linha com foto à esquerda (lista). */
export default function DishCard({ prato, variante = "row" }) {
  if (variante === "tile") {
    return (
      <Link
        href={`/prato?slug=${prato.slug}`}
        className="card block w-[260px] shrink-0 snap-start overflow-hidden transition duration-200 hover:border-champagne/50 active:scale-[0.98]"
      >
        <DishPhoto prato={prato} className="h-40 w-full" />
        <div className="space-y-2 p-4">
          <h3 className="text-lg leading-snug">{prato.nome}</h3>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-champagne">{formatBRL(prato.preco)}</span>
            <Selos prato={prato} />
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={`/prato?slug=${prato.slug}`}
      className="card flex gap-4 overflow-hidden p-3 transition duration-200 hover:border-champagne/50 active:scale-[0.99]"
    >
      <DishPhoto prato={prato} className="h-28 w-28 shrink-0 rounded-[10px]" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-lg leading-snug">{prato.nome}</h3>
        {prato.descricao && <p className="mt-1 line-clamp-2 text-apoio text-marfim-suave">{prato.descricao}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="font-medium text-champagne">{formatBRL(prato.preco)}</span>
          <Selos prato={prato} />
        </div>
      </div>
    </Link>
  );
}
