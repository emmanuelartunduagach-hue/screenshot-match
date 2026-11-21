import { useEffect, useState } from "react";

/** Hora actual que se refresca cada `cadaMs` (para textos tipo "hace 20 min"). */
export function useAhora(cadaMs = 30000): number {
  const [ahora, setAhora] = useState(0);
  useEffect(() => {
    setAhora(Date.now());
    const t = window.setInterval(() => setAhora(Date.now()), cadaMs);
    return () => window.clearInterval(t);
  }, [cadaMs]);
  return ahora;
}
