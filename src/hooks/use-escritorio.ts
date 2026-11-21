import { useEffect, useState } from "react";

/** true en pantallas ≥ 1024 px (barra lateral y paneles laterales). */
export function useEsEscritorio(): boolean {
  const [es, setEs] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const cambiar = () => setEs(mql.matches);
    cambiar();
    mql.addEventListener("change", cambiar);
    return () => mql.removeEventListener("change", cambiar);
  }, []);
  return es;
}
