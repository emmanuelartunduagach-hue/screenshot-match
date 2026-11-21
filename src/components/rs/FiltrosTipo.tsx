import { Layers } from "lucide-react";

import { ORDEN_TIPOS, TIPOS } from "@/lib/novedades";
import type { FiltroMapa, TipoNovedad } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const TONO_ACTIVO: Record<TipoNovedad, string> = {
  hurto: "border-hurto bg-hurto-soft text-hurto-fg",
  iluminacion: "border-iluminacion bg-iluminacion-soft text-iluminacion-fg",
  obra: "border-obra bg-obra-soft text-obra-fg",
  segura: "border-segura bg-segura-soft text-segura-fg",
};

const PUNTO: Record<TipoNovedad, string> = {
  hurto: "bg-hurto",
  iluminacion: "bg-iluminacion",
  obra: "bg-obra",
  segura: "bg-segura",
};

export function FiltrosTipo({
  filtro,
  conteos,
  onCambiar,
  className,
}: {
  filtro: FiltroMapa;
  conteos: Record<TipoNovedad, number>;
  onCambiar: (f: FiltroMapa) => void;
  className?: string;
}) {
  const total = ORDEN_TIPOS.reduce((s, t) => s + conteos[t], 0);
  const base =
    "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-2 px-3.5 font-semibold transition-colors";
  return (
    <div role="group" aria-label="Filtrar por tipo" className={cn("sin-barra flex gap-2 overflow-x-auto", className)}>
      <button
        type="button"
        aria-pressed={filtro === "todos"}
        onClick={() => onCambiar("todos")}
        className={cn(base, filtro === "todos" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40")}
      >
        <Layers className="size-4" aria-hidden /> Todas
        <span className="rounded-full bg-current/10 px-1.5 tabular-nums">{total}</span>
      </button>
      {ORDEN_TIPOS.map((t) => {
        const meta = TIPOS[t];
        const Icono = meta.icono;
        const activo = filtro === t;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambiar(activo ? "todos" : t)}
            className={cn(base, activo ? TONO_ACTIVO[t] : "border-border bg-card text-foreground hover:border-primary/40")}
          >
            <span className={cn("grid size-6 place-items-center rounded-full", PUNTO[t], t === "hurto" || t === "segura" ? "text-primary-foreground" : "text-primary-strong")}>
              <Icono className="size-3.5" aria-hidden />
            </span>
            {meta.etiqueta}
            <span className="tabular-nums text-muted-foreground">
              {conteos[t]}
              <span className="sr-only"> novedades</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
