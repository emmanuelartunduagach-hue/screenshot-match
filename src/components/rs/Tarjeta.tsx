import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

export const tarjetaVariantes = cva("rounded-2xl bg-card text-card-foreground", {
  variants: {
    variante: {
      normal: "border border-border shadow-suave",
      interactiva:
        "border border-border shadow-suave transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevada",
      resaltada: "border-2 border-primary shadow-elevada",
      suave: "bg-primary-soft",
      marca: "bg-marca text-primary-foreground shadow-elevada",
    },
    relleno: { none: "", md: "p-4 sm:p-5", lg: "p-5 sm:p-6" },
  },
  defaultVariants: { variante: "normal", relleno: "md" },
});

export interface TarjetaProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tarjetaVariantes> {}

export const Tarjeta = React.forwardRef<HTMLDivElement, TarjetaProps>(
  ({ className, variante, relleno, ...props }, ref) => (
    <div ref={ref} className={cn(tarjetaVariantes({ variante, relleno }), className)} {...props} />
  ),
);
Tarjeta.displayName = "Tarjeta";
