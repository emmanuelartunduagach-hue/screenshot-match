import { AlertCircle, ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const claseControl =
  "w-full rounded-xl border-2 border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25";

interface CampoBase {
  id: string;
  etiqueta: string;
  error?: string | undefined;
  ayuda?: React.ReactNode;
  contador?: React.ReactNode;
}

export function MensajeError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 font-medium text-hurto-fg" role="alert">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

function Envoltura({ id, etiqueta, error, ayuda, contador, children }: CampoBase & { children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-semibold text-foreground">
          {etiqueta}
        </label>
        {contador}
      </div>
      {children}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="text-muted-foreground">
          {ayuda}
        </p>
      )}
      {error && <MensajeError id={`${id}-error`}>{error}</MensajeError>}
    </div>
  );
}

function describedBy(id: string, error?: string, ayuda?: React.ReactNode) {
  return error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined;
}

export function CampoTexto({
  id,
  etiqueta,
  error,
  ayuda,
  contador,
  className,
  ...props
}: CampoBase & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} contador={contador}>
      <input
        id={id}
        className={cn(claseControl, "h-12", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, ayuda)}
        {...props}
      />
    </Envoltura>
  );
}

export function CampoArea({
  id,
  etiqueta,
  error,
  ayuda,
  contador,
  className,
  ...props
}: CampoBase & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} contador={contador}>
      <textarea
        id={id}
        className={cn(claseControl, "min-h-28 resize-none py-3 leading-relaxed", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, ayuda)}
        {...props}
      />
    </Envoltura>
  );
}

export function CampoSelect({
  id,
  etiqueta,
  error,
  ayuda,
  className,
  children,
  ...props
}: CampoBase & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id">) {
  return (
    <Envoltura id={id} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <div className="relative">
        <select
          id={id}
          className={cn(claseControl, "h-12 cursor-pointer appearance-none pr-11", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, ayuda)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </div>
    </Envoltura>
  );
}
