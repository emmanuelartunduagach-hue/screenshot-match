import { Outlet, createFileRoute, useHydrated, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AvisoComunidad } from "@/components/rs/Avisos";
import { BarraLateral, NavegacionInferior } from "@/components/rs/Navegacion";
import { obtenerEstado } from "@/lib/store";

export const Route = createFileRoute("/_shell")({
  component: Shell,
});

function Shell() {
  const hidratado = useHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    if (hidratado && !obtenerEstado().sesion) void navigate({ to: "/bienvenida", replace: true });
  }, [hidratado, navigate]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>
      <BarraLateral />
      <div className="flex min-w-0 flex-1 flex-col">
        <AvisoComunidad />
        <main id="contenido" className="relative min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <NavegacionInferior />
      </div>
    </div>
  );
}
