import AddToCartBar from "@/components/AddToCartBar";
import Link from "next/link";
import DishPhoto from "@/components/DishPhoto";
import { IconCamera } from "@/components/Icons";
import TopBar from "@/components/TopBar";
import { formatBRL, formatCm, restaurante } from "@/lib/menu";

export default function PratoView({ prato }) {
  const dim = prato.dimensoesCm;

  return (
    <>
      <TopBar back="/" />
      <main className="mx-auto max-w-5xl px-4 pb-36 pt-6 lg:grid lg:grid-cols-2 lg:gap-10">
        <div className="space-y-6">
          <DishPhoto prato={prato} mostrarLegenda className="animate__animated animate__fadeIn aspect-[4/3] w-full rounded-card" />

          <section aria-labelledby="ar-titulo" className="space-y-3">
            <h2 id="ar-titulo" className="text-2xl">
              Veja o prato pela câmera
            </h2>
            {prato.modelo ? (
              <div className="card space-y-4 p-5">
                <p className="text-marfim-suave">Use a câmera do celular para ver o prato no seu ambiente e comparar o tamanho com a mesa ou com a sua mão.</p>
                <Link href={`/ar?slug=${prato.slug}`} className="btn-primario w-full">
                  <IconCamera /> Ver pela câmera
                </Link>
                <p className="text-apoio text-marfim-suave">
                  Tamanho real:{" "}
                  <strong className="font-medium text-marfim">
                    {formatCm(prato.modelo.dimensoesCm.largura)} × {formatCm(prato.modelo.dimensoesCm.profundidade)} × {formatCm(prato.modelo.dimensoesCm.altura)} cm
                  </strong>
                </p>
                {prato.modelo.ilustrativo && <p className="text-apoio text-marfim-suave">{prato.modelo.nota || "Modelo de demonstração. Não representa o prato real do restaurante."}</p>}
              </div>
            ) : (
              <div className="card p-5">
                <p>A visualização pela câmera ainda não está disponível para este prato.</p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 space-y-8 lg:mt-0">
          <header>
            <h1 className="text-4xl leading-tight">{prato.nome}</h1>
            <p className="mt-2 text-2xl text-champagne">{formatBRL(prato.preco)}</p>
            {!prato.disponivel && <p className="mt-2 text-brasa">Indisponível no momento</p>}
            {prato.descricao && <p className="mt-4 text-marfim-suave">{prato.descricao}</p>}
          </header>

          <dl className="card grid grid-cols-2 gap-4 p-4 text-apoio">
            {prato.porcao.pesoG && (
              <div>
                <dt className="text-marfim-suave">Peso aproximado</dt>
                <dd className="mt-0.5 text-base">{prato.porcao.pesoG} g</dd>
              </div>
            )}
            {prato.porcao.descricao && (
              <div>
                <dt className="text-marfim-suave">Porção</dt>
                <dd className="mt-0.5 text-base">{prato.porcao.descricao}</dd>
              </div>
            )}
            {dim && (
              <div className="col-span-2">
                <dt className="text-marfim-suave">Dimensões aproximadas{prato.dimensoesEstimadas ? " (estimativa)" : ""}</dt>
                <dd className="mt-0.5 text-base">
                  {formatCm(dim.largura)} × {formatCm(dim.profundidade)} × {formatCm(dim.altura)} cm
                </dd>
              </div>
            )}
          </dl>

          {prato.ingredientes.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl">Ingredientes</h2>
              <ul className="flex flex-wrap gap-2">
                {prato.ingredientes.map((i) => (
                  <li key={i} className="rounded-full border border-linha px-3 py-1.5 text-apoio">
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {prato.acompanhamentos.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl">Acompanhamentos</h2>
              <ul className="list-inside list-disc space-y-1 text-marfim-suave">
                {prato.acompanhamentos.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-card border border-champagne/40 bg-cafe p-4">
            <h2 className="mb-2 text-xl">Alergênicos</h2>
            {prato.alergenicos.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {prato.alergenicos.map((a) => (
                  <li key={a} className="rounded-full bg-champagne/15 px-3 py-1.5 text-apoio text-champagne-forte">
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-apoio text-marfim-suave">Nenhum alergênico informado para este prato.</p>
            )}
            <p className="mt-3 text-apoio text-marfim-suave">Em caso de alergia ou restrição alimentar, avise a equipe antes de pedir.</p>
          </section>

          {restaurante.demo && <p className="text-apoio text-marfim-suave">Dados de demonstração: preço, peso e medidas são fictícios.</p>}
        </div>
      </main>
      <AddToCartBar prato={prato} />
    </>
  );
}
