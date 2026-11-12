"use client";

import { useEffect, useState } from "react";

/**
 * Carrega o web component <model-viewer> só no navegador (ele usa APIs que não existem no build estático).
 * Retorna { ready, failed }.
 */
export function useModelViewer() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let vivo = true;
    if (typeof customElements !== "undefined" && customElements.get("model-viewer")) {
      setReady(true);
      return undefined;
    }
    import("@google/model-viewer")
      .then(() => vivo && setReady(true))
      .catch(() => vivo && setFailed(true));
    return () => {
      vivo = false;
    };
  }, []);

  return { ready, failed };
}
