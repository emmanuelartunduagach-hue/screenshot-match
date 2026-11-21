import { Link } from "@tanstack/react-router";
import { ClipboardList, Home, Map, MessageCircle, Plus, Route as RouteIcon, type LucideIcon } from "lucide-react";

import { useEstado } from "@/lib/store";
import { cn } from "@/lib/utils";

import { botonVariantes } from "./Boton";
import { Logo } from "./Logo";
import { MenuOpciones } from "./MenuOpciones";

type Destino = "/inicio" | "/mapa" | "/ruta" | "/mis-reportes" | "/asistente";

const ITEMS: { to: Destino; etiqueta: string; icono: LucideIcon }[] = [
  { to: "/inicio", etiqueta: "Inicio", icono: Home },
  { to: "/mapa", etiqueta: "Mapa", icono: Map },
  { to: "/ruta", etiqueta: "Ruta", icono: RouteIcon },
  { to: "/mis-reportes", etiqueta: "Reportes", icono: ClipboardList },
  { to: "/asistente", etiqueta: "Asistente", icono: MessageCircle },
];

export function NavegacionInferior() {
  return (
    <nav aria-label="Navegación principal" className="pb-seguro border-t border-border bg-card lg:hidden">
      <ul className="mx-auto flex max-w-xl">
        {ITEMS.map(({ to, etiqueta, icono: Icono }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group relative flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 pt-1.5 font-semibold tracking-tight text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              <span className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" aria-hidden />
              <span className="grid h-8 w-12 place-items-center rounded-full transition-colors group-data-[status=active]:bg-primary-soft">
                <Icono className="size-[22px]" aria-hidden />
              </span>
              <span className="leading-tight">{etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function BarraLateral() {
  const { sesion } = useEstado();
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="px-6 pb-4 pt-6">
        <Link to="/inicio" aria-label="RutaSegura, ir al inicio" className="rounded-lg">
          <Logo />
        </Link>
      </div>
      <nav aria-label="Navegación principal" className="flex-1 px-3">
        <ul className="space-y-1">
          {ITEMS.map(({ to, etiqueta, icono: Icono }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex h-12 items-center gap-3 rounded-xl px-4 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
              >
                <Icono className="size-5" aria-hidden />
                {etiqueta === "Reportes" ? "Mis reportes" : etiqueta}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/reportar" className={cn(botonVariantes({ variante: "primario", bloque: true }), "mt-6")}>
          <Plus aria-hidden /> Reportar novedad
        </Link>
      </nav>
      <div className="m-3 flex items-center gap-3 rounded-2xl bg-muted p-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground" aria-hidden>
          {(sesion?.nombre ?? "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{sesion?.nombre ?? "Sin sesión"}</p>
          <p className="truncate text-muted-foreground">{sesion?.invitado ? "Invitado" : "Neiva, Huila"}</p>
        </div>
        <MenuOpciones />
      </div>
    </aside>
  );
}
