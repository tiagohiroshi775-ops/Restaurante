/* eslint-disable @next/next/no-img-element */
import { IconCube } from "./Icons";

/** Foto do prato. Sem foto, mostra um espaço reservado (nunca uma imagem fingindo ser o prato). */
export default function DishPhoto({ prato, className = "", mostrarLegenda = false }) {
  if (!prato.foto) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-cafe text-champagne-suave ${className}`} role="img" aria-label={`Foto de ${prato.nome} ainda não cadastrada`}>
        <IconCube width={28} height={28} />
        <span className="px-2 text-center text-apoio">Foto em breve</span>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-cafe ${className}`}>
      <img
        src={prato.foto}
        alt={prato.fotoIlustrativa ? `Foto ilustrativa de ${prato.nome}` : `Foto de ${prato.nome}`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {mostrarLegenda && prato.fotoIlustrativa && (
        <span className="absolute bottom-2 left-2 rounded-md bg-carvao/85 px-2 py-1 text-apoio text-marfim">Foto ilustrativa</span>
      )}
    </div>
  );
}
