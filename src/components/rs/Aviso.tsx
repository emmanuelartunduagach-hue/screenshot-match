import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const avisoVariantes = cva("flex gap-3 rounded-2xl border p-4 text-base", {
  variants: {
    tono: {
      info: "border-primary/15 bg-primary-soft text-primary",
      exito: "border-segura/30 bg-segura-soft text-segura-fg",
      advertencia: "border-iluminacion/50 bg-iluminacion-soft text-iluminacion-fg",
      error: "border-hurto/30 bg-hurto-soft text-hurto-fg",
    },
  },
  defaultVariants: { tono: "info" },
});

const ICONOS: Record<NonNullable<VariantProps<typeof avisoVariantes>["tono"]>, LucideIcon> = {
  info: Info,
  exito: CheckCircle2,
  advertencia: AlertTriangle,
  error: XCircle,
};

export interface AvisoProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof avisoVariantes> {
  titulo?: React.ReactNode;
  icono?: LucideIcon;
}

export function Aviso({ className, tono = "info", titulo, icono, children, ...props }: AvisoProps) {
  const Icono = icono ?? ICONOS[tono ?? "info"];
  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className={cn(avisoVariantes({ tono }), className)}
      {...props}
    >
      <Icono className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        {titulo && <p className="font-bold">{titulo}</p>}
        {children && <div className="leading-snug">{children}</div>}
      </div>
    </div>
  );
}
