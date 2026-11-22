import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, Clock, Users, type LucideIcon } from "lucide-react";
import * as React from "react";

import { TIPOS, type EstadoReporte } from "@/lib/novedades";
import type { TipoNovedad } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export const etiquetaVariantes = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold leading-tight [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      tono: {
        hurto: "bg-hurto-soft text-hurto-fg",
        iluminacion: "bg-iluminacion-soft text-iluminacion-fg",
        obra: "bg-obra-soft text-obra-fg",
        segura: "bg-segura-soft text-segura-fg",
        neutro: "bg-muted text-muted-foreground",
        marca: "bg-primary text-primary-foreground",
        info: "bg-primary-soft text-primary",
      },
    },
    defaultVariants: { tono: "neutro" },
  },
);

export interface EtiquetaProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof etiquetaVariantes> {
  icono?: LucideIcon;
}

export function Etiqueta({ className, tono, icono: Icono, children, ...props }: EtiquetaProps) {
  return (
    <span className={cn(etiquetaVariantes({ tono }), className)} {...props}>
      {Icono && <Icono aria-hidden />}
      {children}
    </span>
  );
}

export function EtiquetaTipo({ tipo, className }: { tipo: TipoNovedad; className?: string }) {
  const meta = TIPOS[tipo];
  return (
    <Etiqueta tono={tipo} icono={meta.icono} className={className}>
      {meta.etiqueta}
    </Etiqueta>
  );
}

const ESTADOS: Record<EstadoReporte, { tono: "info" | "segura" | "neutro"; icono: LucideIcon }> = {
  Publicado: { tono: "info", icono: Clock },
  "Confirmado por vecinos": { tono: "segura", icono: Users },
  Resuelto: { tono: "neutro", icono: CheckCircle2 },
};

export function EtiquetaEstado({ estado }: { estado: EstadoReporte }) {
  const e = ESTADOS[estado];
  return (
    <Etiqueta tono={e.tono} icono={e.icono}>
      {estado}
    </Etiqueta>
  );
}

/** Icono de tipo dentro de un círculo de color (no depende solo del color: lleva icono). */
export function IconoTipo({ tipo, className }: { tipo: TipoNovedad; className?: string }) {
  const meta = TIPOS[tipo];
  const Icono = meta.icono;
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl",
        etiquetaVariantes({ tono: tipo }),
        "p-0 [&_svg]:size-5",
        className,
      )}
      aria-hidden
    >
      <Icono className="size-5" />
    </span>
  );
}
