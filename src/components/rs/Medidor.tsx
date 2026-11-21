import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

import { nivelSeguridad } from "@/lib/seguridad";
import { cn } from "@/lib/utils";

const NIVELES = {
  alta: { texto: "Seguridad alta", icono: ShieldCheck, barra: "bg-segura", fg: "text-segura-fg" },
  media: { texto: "Seguridad media", icono: Shield, barra: "bg-iluminacion", fg: "text-iluminacion-fg" },
  baja: { texto: "Seguridad baja", icono: ShieldAlert, barra: "bg-hurto", fg: "text-hurto-fg" },
} as const;

export function MedidorSeguridad({ puntaje, className }: { puntaje: number; className?: string }) {
  const n = NIVELES[nivelSeguridad(puntaje)];
  const Icono = n.icono;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1.5 font-semibold", n.fg)}>
          <Icono className="size-5" aria-hidden /> {n.texto}
        </span>
        <span className="font-display text-lg font-bold tabular-nums">
          {puntaje}
          <span className="text-muted-foreground">/100</span>
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={puntaje}
        aria-label={`Puntaje de seguridad: ${puntaje} de 100, ${n.texto.toLowerCase()}`}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500", n.barra)} style={{ width: `${puntaje}%` }} />
      </div>
    </div>
  );
}
