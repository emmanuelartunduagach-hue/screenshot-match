import * as React from "react";

import { cn } from "@/lib/utils";

type Ilustracion = "reportes" | "filtro" | "rutas" | "chat" | "listo";

function Dibujo({ tipo }: { tipo: Ilustracion }) {
  return (
    <svg viewBox="0 0 160 120" className="h-28 w-auto" aria-hidden>
      <ellipse cx="80" cy="104" rx="56" ry="8" className="fill-primary/10" />
      <rect x="28" y="18" width="104" height="78" rx="16" className="fill-primary-soft" />
      <path d="M40 78 C 62 44, 92 92, 120 40" className="fill-none stroke-primary/30" strokeWidth="5" strokeDasharray="3 9" strokeLinecap="round" />
      {tipo === "reportes" && (
        <>
          <rect x="54" y="34" width="52" height="44" rx="8" className="fill-card stroke-primary/40" strokeWidth="2" />
          <path d="M64 48h32M64 58h22M64 68h26" className="stroke-primary/40" strokeWidth="4" strokeLinecap="round" />
          <circle cx="110" cy="34" r="12" className="fill-primary" />
          <path d="M110 28v12M104 34h12" className="stroke-primary-foreground" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {tipo === "filtro" && (
        <>
          <circle cx="76" cy="54" r="20" className="fill-card stroke-primary" strokeWidth="5" />
          <path d="M90 68l16 16" className="stroke-primary" strokeWidth="7" strokeLinecap="round" />
          <path d="M68 54h16" className="stroke-primary/40" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {tipo === "rutas" && (
        <>
          <circle cx="44" cy="78" r="9" className="fill-primary" />
          <path d="M116 22c-9 0-16 7-16 16 0 12 16 26 16 26s16-14 16-26c0-9-7-16-16-16z" className="fill-segura" />
          <circle cx="116" cy="38" r="6" className="fill-card" />
        </>
      )}
      {tipo === "chat" && (
        <>
          <rect x="46" y="32" width="56" height="34" rx="12" className="fill-card stroke-primary/40" strokeWidth="2" />
          <rect x="72" y="54" width="48" height="28" rx="12" className="fill-primary" />
          <circle cx="86" cy="68" r="3" className="fill-primary-foreground" />
          <circle cx="96" cy="68" r="3" className="fill-primary-foreground" />
          <circle cx="106" cy="68" r="3" className="fill-primary-foreground" />
        </>
      )}
      {tipo === "listo" && (
        <>
          <circle cx="80" cy="56" r="28" className="fill-segura" />
          <path d="M67 57l9 9 18-20" className="fill-none stroke-primary-foreground" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export interface EstadoVacioProps {
  ilustracion: Ilustracion;
  titulo: string;
  texto?: React.ReactNode;
  accion?: React.ReactNode;
  className?: string;
}

export function EstadoVacio({ ilustracion, titulo, texto, accion, className }: EstadoVacioProps) {
  return (
    <div className={cn("flex animate-aparecer flex-col items-center px-4 py-8 text-center", className)}>
      <Dibujo tipo={ilustracion} />
      <h3 className="mt-4 text-xl font-bold text-foreground">{titulo}</h3>
      {texto && <p className="mt-1 max-w-sm text-muted-foreground">{texto}</p>}
      {accion && <div className="mt-5 flex flex-wrap justify-center gap-3">{accion}</div>}
    </div>
  );
}
