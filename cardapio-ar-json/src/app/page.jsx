import MenuBrowser from "@/components/MenuBrowser";
import TableBadge from "@/components/TableBadge";
import TopBar from "@/components/TopBar";
import { IconClock, IconPin } from "@/components/Icons";
import { categorias, pratos, restaurante } from "@/lib/menu";

export default function Home() {
  return (
    <>
      <TopBar title={restaurante.nome} />
      {restaurante.demo && (
        <div className="border-b border-champagne/30 bg-cafe px-4 py-3 text-center text-apoio text-champagne">
          Cardápio de demonstração: restaurante, pratos, preços e medidas são fictícios.
        </div>
      )}

      <header className="animate__animated animate__fadeIn mx-auto max-w-5xl px-4 pb-8 pt-10">
        <TableBadge />
        <h1 className="mt-3 text-5xl leading-[1.05] md:text-6xl">{restaurante.nome}</h1>
        {restaurante.slogan && <p className="mt-3 text-xl text-champagne">{restaurante.slogan}</p>}
        {restaurante.descricao && <p className="mt-4 max-w-xl text-marfim-suave">{restaurante.descricao}</p>}
        <ul className="mt-6 space-y-2 text-apoio text-marfim-suave">
          {restaurante.horarios.map((h) => (
            <li key={h.dias} className="flex items-center gap-2">
              <IconClock width={16} height={16} className="text-champagne" />
              {h.dias}: {h.abre} às {h.fecha}
            </li>
          ))}
          {restaurante.endereco && (
            <li className="flex items-center gap-2">
              <IconPin width={16} height={16} className="text-champagne" />
              {restaurante.endereco}
            </li>
          )}
        </ul>
      </header>

      <MenuBrowser categorias={categorias} pratos={pratos} />
    </>
  );
}
