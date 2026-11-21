import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Boton } from "./Boton";
import { MenuOpciones } from "./MenuOpciones";

export type DestinoVolver = "/inicio" | "/bienvenida" | "/mapa" | "/ruta" | "/mis-reportes";

export interface EncabezadoProps {
  titulo: string;
  subtitulo?: React.ReactNode;
  /** A dónde vuelve si no hay historial */
  volverA?: DestinoVolver;
  /** Reemplaza la acción de volver (p. ej. para confirmar antes de salir) */
  onVolver?: () => void;
  acciones?: React.ReactNode;
  className?: string;
}

export function useVolver(fallback: DestinoVolver = "/inicio") {
  const router = useRouter();
  const puede = useCanGoBack();
  return React.useCallback(() => {
    if (puede) router.history.back();
    else void router.navigate({ to: fallback });
  }, [puede, router, fallback]);
}

export function EncabezadoPantalla({ titulo, subtitulo, volverA = "/inicio", onVolver, acciones, className }: EncabezadoProps) {
  const volver = useVolver(volverA);
  return (
    <header className={cn("flex items-center gap-2 px-4 pb-3 pt-4 sm:px-6", className)}>
      <Boton variante="fantasma" tamano="icono" aria-label="Volver" onClick={onVolver ?? volver} className="-ml-2 shrink-0">
        <ArrowLeft />
      </Boton>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold text-foreground">{titulo}</h1>
        {subtitulo && <p className="truncate text-muted-foreground">{subtitulo}</p>}
      </div>
      {acciones}
      <MenuOpciones className="lg:hidden" />
    </header>
  );
}
