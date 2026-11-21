import { cn } from "@/lib/utils";

export function LogoMarca({ className, claro = false }: { className?: string; claro?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden>
      <path
        d="M24 3 6 10v12c0 11.5 7.6 19.6 18 23 10.4-3.4 18-11.5 18-23V10L24 3z"
        className={claro ? "fill-primary-foreground" : "fill-primary"}
      />
      <path
        d="M15 31c4-9 14-4 18-14"
        className={cn("fill-none", claro ? "stroke-primary" : "stroke-primary-foreground")}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="0.1 6.2"
      />
      <circle cx="15" cy="31" r="3.4" className={claro ? "fill-primary" : "fill-primary-foreground"} />
      <circle cx="33" cy="17" r="4.2" className="fill-segura" />
    </svg>
  );
}

export function Logo({ className, claro = false }: { className?: string; claro?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMarca claro={claro} />
      <span className={cn("font-display text-2xl font-extrabold tracking-tight", claro ? "text-primary-foreground" : "text-primary")}>
        Ruta<span className={claro ? "text-segura-soft" : "text-segura-fg"}>Segura</span>
      </span>
    </span>
  );
}
