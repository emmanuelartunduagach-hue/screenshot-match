import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const botonVariantes = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55 active:scale-[0.98] [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variante: {
        primario: "bg-primary text-primary-foreground shadow-suave hover:bg-primary-strong hover:shadow-elevada",
        secundario: "bg-primary-soft text-primary hover:bg-secondary",
        contorno: "border-2 border-primary/25 bg-card text-primary hover:border-primary hover:bg-primary-soft",
        fantasma: "text-primary hover:bg-primary-soft",
        peligro: "bg-destructive text-destructive-foreground hover:bg-hurto-fg",
        claro: "bg-card text-primary shadow-suave hover:bg-primary-soft",
        "claro-contorno": "border-2 border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/10",
      },
      tamano: {
        md: "h-12 px-5 text-base",
        lg: "h-14 px-6 text-base",
        sm: "h-11 px-4 text-base",
        icono: "h-11 w-11 p-0",
      },
      bloque: { true: "w-full", false: "" },
    },
    defaultVariants: { variante: "primario", tamano: "md", bloque: false },
  },
);

export interface BotonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof botonVariantes> {
  asChild?: boolean;
  cargando?: boolean;
}

export const Boton = React.forwardRef<HTMLButtonElement, BotonProps>(
  ({ className, variante, tamano, bloque, asChild = false, cargando = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(botonVariantes({ variante, tamano, bloque }), className)}
        disabled={asChild ? undefined : disabled || cargando}
        aria-busy={cargando || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {cargando && <Loader2 className="animate-spin" aria-hidden />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Boton.displayName = "Boton";
