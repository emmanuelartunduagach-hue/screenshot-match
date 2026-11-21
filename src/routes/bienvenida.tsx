import { Link, createFileRoute } from "@tanstack/react-router";
import { MapPinned, Megaphone, Route as RouteIcon } from "lucide-react";

import { PieDemo } from "@/components/rs/Avisos";
import { botonVariantes } from "@/components/rs/Boton";
import { Logo } from "@/components/rs/Logo";
import { metaPantalla } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bienvenida")({
  head: () => metaPantalla("Bienvenida", "Conoce tu zona y elige rutas más seguras en Neiva con reportes de la comunidad."),
  component: Bienvenida,
});

const BENEFICIOS = [
  { icono: MapPinned, texto: "Mira qué pasa en tu barrio hoy" },
  { icono: RouteIcon, texto: "Compara rutas y elige la más segura" },
  { icono: Megaphone, texto: "Avisa a tus vecinos en segundos" },
];

function Bienvenida() {
  return (
    <div className="patron-mapa flex min-h-dvh flex-col text-primary-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 animate-subir">
          <Logo claro />
          <h1 className="mt-10 max-w-xl text-4xl font-extrabold leading-[1.08] sm:text-5xl">
            Conoce tu zona y elige rutas más seguras en Neiva
          </h1>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/85">
            Reportes de vecinos en tiempo real sobre hurtos, iluminación y obras, para que llegues tranquilo.
          </p>
          <ul className="mt-8 space-y-3">
            {BENEFICIOS.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/12">
                  <Icono className="size-5" aria-hidden />
                </span>
                <span className="font-medium">{texto}</span>
              </li>
            ))}
          </ul>
        </div>

        <TarjetaInicio />
      </main>
      <PieDemo className="text-primary-foreground/80" />
    </div>
  );
}

function TarjetaInicio() {
  return (
    <div className="w-full animate-subir rounded-3xl bg-card p-6 text-card-foreground shadow-elevada [animation-delay:120ms] lg:max-w-sm">
      <svg viewBox="0 0 300 140" className="mb-5 w-full" aria-hidden>
        <rect width="300" height="140" rx="18" className="fill-primary-soft" />
        <path d="M0 98 C 70 80, 120 120, 300 70" className="fill-none stroke-card" strokeWidth="14" />
        <path d="M60 0 L 110 140" className="fill-none stroke-card" strokeWidth="10" />
        <path d="M200 0 C 190 60, 230 90, 240 140" className="fill-none stroke-card" strokeWidth="10" />
        <path d="M40 112 L 250 32" className="fill-none stroke-muted-foreground" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
        <path d="M40 112 C 110 120, 160 90, 250 32" className="fill-none stroke-primary" strokeWidth="5" strokeLinecap="round" />
        <circle cx="40" cy="112" r="9" className="fill-primary" />
        <circle cx="250" cy="32" r="9" className="fill-card stroke-primary" strokeWidth="4" />
        <circle cx="150" cy="62" r="8" className="fill-hurto" />
        <circle cx="120" cy="40" r="8" className="fill-iluminacion" />
        <circle cx="170" cy="104" r="8" className="fill-segura" />
      </svg>
      <p className="font-display text-xl font-bold">Empieza en un minuto</p>
      <p className="mt-1 text-muted-foreground">Crea tu cuenta o entra como invitado.</p>
      <div className="mt-6 space-y-3">
        <Link to="/acceso" search={{ modo: "registro" }} className={cn(botonVariantes({ tamano: "lg", bloque: true }))}>
          Comenzar
        </Link>
        <Link to="/acceso" search={{ modo: "ingreso" }} className={cn(botonVariantes({ variante: "contorno", tamano: "lg", bloque: true }))}>
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  );
}
