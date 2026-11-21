import { CheckCheck, UserRound } from "lucide-react";

import { tiempoRelativo } from "@/lib/novedades";
import type { Reporte } from "@/lib/tipos";
import { cn } from "@/lib/utils";

import { EtiquetaTipo, IconoTipo } from "./Etiqueta";

export function ItemNovedad({
  reporte,
  ahora,
  onClick,
  activo = false,
  className,
}: {
  reporte: Reporte;
  ahora: number;
  onClick?: () => void;
  activo?: boolean;
  className?: string;
}) {
  const contenido = (
    <>
      <IconoTipo tipo={reporte.tipo} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <EtiquetaTipo tipo={reporte.tipo} />
          <span className="text-muted-foreground">{tiempoRelativo(reporte.creadoEn, ahora)}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 font-medium text-foreground">{reporte.descripcion}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-muted-foreground">
          <span>{reporte.barrio}</span>
          <span className="inline-flex items-center gap-1">
            <UserRound className="size-4" aria-hidden />
            {reporte.autor ?? "Anónimo"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCheck className="size-4" aria-hidden />
            {reporte.confirmaciones}
            <span className="sr-only">confirmaciones</span>
          </span>
        </p>
      </div>
    </>
  );
  const base = "flex w-full gap-3 rounded-2xl p-3 transition-colors";
  if (!onClick) return <div className={cn(base, className)}>{contenido}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activo || undefined}
      className={cn(base, "hover:bg-muted", activo && "bg-primary-soft hover:bg-primary-soft", className)}
    >
      {contenido}
    </button>
  );
}
