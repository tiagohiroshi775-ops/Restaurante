"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatBRL, formatCm } from "@/lib/menu";
import { useModelViewer } from "@/lib/useModelViewer";
import { IconAlert, IconCamera, IconClose } from "./Icons";

/**
 * AR com câmera própria, só com APIs padrão do navegador:
 *   1. navigator.mediaDevices.getUserMedia -> <video> em tela cheia (câmera traseira) no fundo;
 *   2. <model-viewer> transparente por cima, com a câmera 3D travada numa distância calculada;
 *   3. escala real: o tamanho em pixels de 1 cm é calibrado pelo usuário com um cartão de crédito (8,56 x 5,40 cm)
 *      apoiado na mesa. A distância da câmera 3D é calculada para que o modelo (em metros) apareça nesse tamanho.
 *
 * Limitações honestas: não reconhece a mesa nem "gruda" o prato nela.
 * O prato fica no centro da tela; gire com o dedo e mova o celular para posicioná-lo.
 */

const FOV_DEG = 30; // campo de visão vertical fixo da câmera 3D
const CARTAO = { w: 8.56, h: 5.4 }; // cm (ISO/IEC 7810 ID-1)
const MODELO_ATTRS = {
  "camera-controls": "",
  "disable-zoom": "",
  "disable-pan": "",
  "interaction-prompt": "none",
  "touch-action": "none",
  "environment-image": "neutral",
  "shadow-intensity": "0.8",
  exposure: "1.1",
  "field-of-view": `${FOV_DEG}deg`,
  "min-field-of-view": `${FOV_DEG}deg`,
  "max-field-of-view": `${FOV_DEG}deg`,
};

export default function CameraAr({ prato }) {
  const modelo = prato.modelo;
  const { ready, failed } = useModelViewer();
  const { add } = useCart();

  const caixaRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mvRef = useRef(null);
  const angulos = useRef({ theta: "0deg", phi: "70deg" });
  const timerAdd = useRef(null);

  const [cam, setCam] = useState("idle"); // idle | starting | on | off | denied | unsupported | error
  const [seguro, setSeguro] = useState(true);
  const [alturaCaixa, setAlturaCaixa] = useState(0);
  const [pxPorCm, setPxPorCm] = useState(10);
  const [mostrarCartao, setMostrarCartao] = useState(true);
  const [mostrarRegua, setMostrarRegua] = useState(false);
  const [painelAberto, setPainelAberto] = useState(true);
  const [estadoModelo, setEstadoModelo] = useState("loading");
  const [adicionado, setAdicionado] = useState(false);

  const mostrarModelo = !!modelo && ready && (cam === "on" || cam === "off");

  /* ---------- câmera ---------- */
  useEffect(() => {
    setSeguro(typeof window === "undefined" ? true : window.isSecureContext !== false);
  }, []);

  const pararCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const ligarCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCam("unsupported");
      return;
    }
    setCam("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCam("on");
    } catch (e) {
      const nome = e && e.name;
      setCam(nome === "NotAllowedError" || nome === "SecurityError" ? "denied" : "error");
    }
  }, []);

  // Liga o stream ao <video> depois que ele aparece na tela
  useEffect(() => {
    if (cam === "on" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const p = videoRef.current.play();
      if (p && p.catch) p.catch(() => {});
    }
  }, [cam]);

  // Desliga a câmera ao sair da tela
  useEffect(
    () => () => {
      pararCamera();
      clearTimeout(timerAdd.current);
    },
    [pararCamera],
  );

  /* ---------- tamanho da tela -> distância da câmera 3D ---------- */
  useEffect(() => {
    const el = caixaRef.current;
    if (!el) return undefined;
    const medir = () => setAlturaCaixa(el.clientHeight);
    medir();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", medir);
      return () => window.removeEventListener("resize", medir);
    }
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // pixels por metro no plano do modelo = altura / (2 * d * tan(fov/2))  ->  d = altura / (2 * tan(fov/2) * pxPorMetro)
  const distancia = alturaCaixa > 0 ? alturaCaixa / (2 * Math.tan((FOV_DEG * Math.PI) / 360) * pxPorCm * 100) : 1.5;

  useEffect(() => {
    const el = mvRef.current;
    if (!el || !mostrarModelo) return;
    const d = `${distancia.toFixed(3)}m`;
    el.setAttribute("min-camera-orbit", `auto auto ${d}`);
    el.setAttribute("max-camera-orbit", `auto auto ${d}`);
    el.cameraOrbit = `${angulos.current.theta} ${angulos.current.phi} ${d}`;
    if (typeof el.jumpCameraToGoal === "function") el.jumpCameraToGoal();
  }, [distancia, mostrarModelo]);

  /* ---------- eventos do <model-viewer> ---------- */
  useEffect(() => {
    const el = mvRef.current;
    if (!el || !mostrarModelo) return undefined;
    const aoCarregar = () => setEstadoModelo("ok");
    const aoErro = () => setEstadoModelo("erro");
    const aoMoverCamera = (e) => {
      // guarda os ângulos que o usuário escolheu girando o prato (a distância é sempre a calculada)
      if (e.detail && e.detail.source === "user-interaction" && typeof el.getCameraOrbit === "function") {
        const o = el.getCameraOrbit();
        angulos.current = { theta: `${o.theta}rad`, phi: `${o.phi}rad` };
      }
    };
    el.addEventListener("load", aoCarregar);
    el.addEventListener("error", aoErro);
    el.addEventListener("camera-change", aoMoverCamera);
    if (el.loaded) aoCarregar();
    return () => {
      el.removeEventListener("load", aoCarregar);
      el.removeEventListener("error", aoErro);
      el.removeEventListener("camera-change", aoMoverCamera);
    };
  }, [mostrarModelo]);

  function adicionar() {
    add(prato, 1);
    setAdicionado(true);
    clearTimeout(timerAdd.current);
    timerAdd.current = setTimeout(() => setAdicionado(false), 1600);
  }

  /* ---------- prato sem modelo 3D ---------- */
  if (!modelo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <IconAlert width={32} height={32} className="text-champagne" />
        <h1 className="text-2xl">Este prato ainda não tem modelo 3D</h1>
        <p className="text-marfim-suave">A visualização pela câmera aparece nos pratos com o selo “AR 3D”.</p>
        <Link href={`/prato?slug=${prato.slug}`} className="btn-secundario">
          Voltar ao prato
        </Link>
      </div>
    );
  }

  const d = modelo.dimensoesCm;
  const larguraRef = mostrarCartao ? CARTAO.w * pxPorCm : 0;
  const mensagemCamera = {
    denied: "A câmera foi bloqueada. Libere a permissão da câmera nas configurações do site e tente de novo.",
    unsupported: "Este navegador não permite usar a câmera. Abra no Chrome (Android) ou no Safari (iPhone).",
    error: "Não foi possível abrir a câmera. Feche outros apps que a estejam usando e tente de novo.",
  }[cam];

  return (
    <div ref={caixaRef} className="fixed inset-0 overflow-hidden bg-carvao">
      {/* 1. câmera ao vivo (ou fundo escuro no modo sem câmera) */}
      {cam === "on" ? (
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted autoPlay />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-cafe via-carvao to-grafite" />
      )}

      {/* 2. modelo 3D transparente por cima da câmera */}
      {mostrarModelo && estadoModelo !== "erro" && (
        <model-viewer
          ref={mvRef}
          src={modelo.glb}
          alt={`Modelo 3D de ${prato.nome}`}
          {...MODELO_ATTRS}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" }}
        />
      )}

      {/* referências de tamanho (para calibrar e para comparar com a mão) */}
      {mostrarModelo && mostrarCartao && (
        <div
          className="pointer-events-none absolute left-1/2 top-[24%] flex -translate-x-1/2 items-center justify-center border-2 border-dashed border-champagne-forte bg-champagne/10 text-[11px] text-champagne-forte"
          style={{ width: larguraRef, height: CARTAO.h * pxPorCm, borderRadius: 0.3 * pxPorCm }}
        >
          cartão
        </div>
      )}
      {mostrarModelo && mostrarRegua && (
        <div className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 text-center text-[12px] text-champagne-forte">
          <div
            style={{
              width: 10 * pxPorCm,
              height: 14,
              borderBottom: "2px solid #E8D4AE",
              backgroundImage: `repeating-linear-gradient(to right, #E8D4AE 0, #E8D4AE 1px, transparent 1px, transparent ${pxPorCm}px)`,
            }}
          />
          régua · 10 cm
        </div>
      )}

      {/* 3. barra do topo */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-start gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link
          href={`/prato?slug=${prato.slug}`}
          aria-label="Fechar e voltar ao prato"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-carvao/70 backdrop-blur"
          onClick={pararCamera}
        >
          <IconClose />
        </Link>
        {mostrarModelo && estadoModelo === "ok" && (
          <p className="animate__animated animate__fadeInDown rounded-card bg-carvao/70 px-4 py-2.5 text-apoio backdrop-blur">
            Arraste o prato para girar. Para o tamanho real, apoie um cartão de crédito na mesa e ajuste o controle abaixo.
          </p>
        )}
      </div>

      {mostrarModelo && estadoModelo === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" role="status">
          <span className="rounded-full bg-carvao/80 px-4 py-2 text-marfim-suave">Carregando modelo 3D…</span>
        </div>
      )}
      {(failed || estadoModelo === "erro") && (
        <div className="absolute inset-x-6 top-1/3 z-10 card p-5 text-center" role="alert">
          <IconAlert className="mx-auto text-brasa" width={28} height={28} />
          <p className="mt-2">Não foi possível carregar o modelo 3D.</p>
        </div>
      )}

      {/* 4. tela inicial: pedir a câmera (precisa de um toque do usuário) */}
      {(cam === "idle" || cam === "starting" || mensagemCamera) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-carvao/90 px-6">
          <div className="animate__animated animate__fadeInUp card w-full max-w-sm space-y-4 p-6 text-center">
            <IconCamera width={32} height={32} className="mx-auto text-champagne" />
            <h1 className="text-2xl">Ver {prato.nome} pela câmera</h1>
            <p className="text-apoio text-marfim-suave">
              A câmera do celular fica ao fundo e o prato 3D aparece por cima, para você comparar o tamanho com a mesa ou com a sua mão.
            </p>
            {!seguro && (
              <p className="rounded-card border border-brasa/50 p-3 text-apoio" role="alert">
                Esta página não está em HTTPS, então o navegador pode bloquear a câmera. Abra o endereço publicado (https://).
              </p>
            )}
            {mensagemCamera && (
              <p className="rounded-card border border-brasa/50 p-3 text-apoio" role="alert">
                {mensagemCamera}
              </p>
            )}
            <button className="btn-primario w-full" onClick={ligarCamera} disabled={cam === "starting"}>
              {cam === "starting" ? "Abrindo a câmera…" : "Ativar câmera"}
            </button>
            <button className="btn-secundario w-full" onClick={() => setCam("off")}>
              Ver sem câmera
            </button>
            <Link href={`/prato?slug=${prato.slug}`} className="block text-apoio text-marfim-suave underline">
              Voltar ao prato
            </Link>
          </div>
        </div>
      )}

      {/* 5. painel de informações e controles */}
      {mostrarModelo && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="animate__animated animate__fadeInUp animate__faster rounded-card border border-linha bg-carvao/90 backdrop-blur">
            <button
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setPainelAberto((v) => !v)}
              aria-expanded={painelAberto}
            >
              <span className="min-w-0">
                <span className="block truncate font-display text-lg">{prato.nome}</span>
                <span className="text-apoio text-marfim-suave">
                  {formatBRL(prato.preco)} · {prato.porcao.descricao}
                </span>
              </span>
              <span className="shrink-0 text-apoio text-champagne">{painelAberto ? "Ocultar" : "Detalhes"}</span>
            </button>

            {painelAberto && (
              <div className="max-h-[45dvh] space-y-4 overflow-y-auto border-t border-linha px-4 py-4">
                <dl className="grid grid-cols-2 gap-3 text-apoio">
                  <div className="col-span-2">
                    <dt className="text-marfim-suave">Tamanho real do prato</dt>
                    <dd className="text-base">
                      {formatCm(d.largura)} × {formatCm(d.profundidade)} × {formatCm(d.altura)} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-marfim-suave">Porção</dt>
                    <dd className="text-base">{prato.porcao.descricao}</dd>
                  </div>
                  <div>
                    <dt className="text-marfim-suave">Peso aproximado</dt>
                    <dd className="text-base">{prato.porcao.pesoG} g</dd>
                  </div>
                </dl>

                <div>
                  <label htmlFor="calibrar" className="mb-1 flex justify-between text-apoio">
                    <span>Ajustar tamanho na tela</span>
                    <span className="text-marfim-suave">{pxPorCm.toFixed(1).replace(".", ",")} px por cm</span>
                  </label>
                  <input
                    id="calibrar"
                    type="range"
                    min="4"
                    max="30"
                    step="0.1"
                    value={pxPorCm}
                    onChange={(e) => setPxPorCm(Number(e.target.value))}
                    className="h-8 w-full accent-champagne"
                  />
                  <p className="text-apoio text-marfim-suave">
                    Apoie um cartão de crédito na mesa e mova o controle até o retângulo tracejado ficar do tamanho do cartão na câmera. O prato passa a aparecer em tamanho real nessa distância.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMostrarCartao((v) => !v)}
                    aria-pressed={mostrarCartao}
                    className={`min-h-[44px] rounded-full border px-4 text-apoio ${mostrarCartao ? "border-champagne bg-champagne text-carvao" : "border-linha text-marfim-suave"}`}
                  >
                    Referência: cartão
                  </button>
                  <button
                    onClick={() => setMostrarRegua((v) => !v)}
                    aria-pressed={mostrarRegua}
                    className={`min-h-[44px] rounded-full border px-4 text-apoio ${mostrarRegua ? "border-champagne bg-champagne text-carvao" : "border-linha text-marfim-suave"}`}
                  >
                    Referência: régua 10 cm
                  </button>
                </div>

                {modelo.ilustrativo && (
                  <p className="text-apoio text-marfim-suave">{modelo.nota || "Modelo de demonstração com formas simples. Não representa o prato real."}</p>
                )}
              </div>
            )}

            <div className="border-t border-linha p-3">
              <button className="btn-primario w-full" onClick={adicionar} disabled={!prato.disponivel}>
                {!prato.disponivel ? "Indisponível no momento" : adicionado ? "Adicionado ✓" : `Adicionar ao pedido · ${formatBRL(prato.preco)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
