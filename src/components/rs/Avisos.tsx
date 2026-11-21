import { Info, Phone } from "lucide-react";

import { cn } from "@/lib/utils";

export function AvisoComunidad({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 bg-primary px-4 py-2 text-primary-foreground sm:px-6", className)}>
      <Info className="size-5 shrink-0" aria-hidden />
      <p className="leading-snug">
        Información aportada por la comunidad. En una emergencia llama al{" "}
        <a href="tel:123" className="inline-flex items-center gap-1 rounded font-bold underline underline-offset-2">
          <Phone className="size-4" aria-hidden />
          123
        </a>
        .
      </p>
    </div>
  );
}

export function PieDemo({ className }: { className?: string }) {
  return (
    <p className={cn("px-4 py-4 text-center text-muted-foreground", className)}>Datos de ejemplo para demostración</p>
  );
}
