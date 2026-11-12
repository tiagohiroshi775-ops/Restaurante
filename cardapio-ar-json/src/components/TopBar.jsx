"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { IconBack, IconBag } from "./Icons";

export default function TopBar({ back, title }) {
  const { count, ready } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-carvao/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {back ? (
          <Link href={back} className="flex min-h-[48px] items-center gap-2 text-marfim-suave transition-colors hover:text-marfim">
            <IconBack />
            <span>Cardápio</span>
          </Link>
        ) : (
          <span className="font-display text-lg">{title}</span>
        )}
        <Link
          href="/carrinho"
          aria-label={ready ? `Abrir pedido, ${count} ${count === 1 ? "item" : "itens"}` : "Abrir pedido"}
          className="relative flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-grafite"
        >
          <IconBag width={22} height={22} />
          {ready && count > 0 && (
            <span
              key={count}
              className="animate__animated animate__bounceIn absolute right-0 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne px-1 text-[12px] font-semibold text-carvao"
            >
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
