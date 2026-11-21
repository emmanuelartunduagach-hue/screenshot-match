import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, Map, MessageCircle, Plus, Route as RouteIcon, type LucideIcon } from "lucide-react";
import { useMemo } from "react";

import { PieDemo } from "@/components/rs/Avisos";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { EstadoVacio } from "@/components/rs/EstadoVacio";
import { ItemNovedad } from "@/components/rs/ItemNovedad";
import { Tarjeta, tarjetaVariantes } from "@/components/rs/Tarjeta";
import { Skeleton } from "@/components/ui/skeleton";
import { useAhora } from "@/hooks/use-ahora";
import { metaPantalla } from "@/lib/meta";
import { useEstado } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/inicio")({
  head: () => metaPantalla("Inicio", "Tu resumen de novedades en Neiva y accesos rápidos para planear rutas y reportar."),
  component: Inicio,
});

type Destino = "/mapa" | "/ruta" | "/reportar" | "/mis-reportes";
const ACCESOS: { to: Destino; titulo: string; texto: string; icono: LucideIcon; destacado?: boolean }[] = [
  { to: "/ruta", titulo: "Planear ruta segura", texto: "Compara 2 rutas", icono: RouteIcon, destacado: true },
  { to: "/mapa", titulo: "Ver mapa", texto: "Novedades cerca", icono: Map },
  { to: "/reportar", titulo: "Reportar novedad", texto: "Avisa a tus vecinos", icono: Plus },
  { to: "/mis-reportes", titulo: "Mis reportes", texto: "Sigue tus avisos", icono: ClipboardList },
];

function saludo(hora: number) {
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

function Inicio() {
  const { sesion, reportes } = useEstado();
  const ahora = useAhora();
  const ultimas = useMemo(
    () => reportes.filter((r) => !r.resuelto).sort((a, b) => b.creadoEn - a.creadoEn).slice(0, 3),
    [reportes],
  );
  const nombre = sesion?.nombre.split(" ")[0] ?? "";
  const listo = ahora > 0;

  return (
    <div className="mx-auto max-w-4xl pb-6">
      <EncabezadoPantalla
        titulo={listo ? `${saludo(new Date(ahora).getHours())}${nombre ? `, ${nombre}` : ""}` : "Hola"}
        subtitulo="¿A dónde vas hoy en Neiva?"
        volverA="/bienvenida"
      />

      <div className="space-y-6 px-4 sm:px-6">
        <section aria-labelledby="accesos" className="animate-aparecer">
          <h2 id="accesos" className="sr-only">
            Accesos rápidos
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4">
            {ACCESOS.map(({ to, titulo, texto, icono: Icono, destacado }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    tarjetaVariantes({ variante: destacado ? "marca" : "interactiva", relleno: "md" }),
                    "flex h-full min-h-36 flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-elevada",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-2xl",
                      destacado ? "bg-primary-foreground/15" : "bg-primary-soft text-primary",
                    )}
                  >
                    <Icono className="size-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold leading-tight">{titulo}</span>
                    <span className={cn("mt-0.5 block", destacado ? "text-primary-foreground/85" : "text-muted-foreground")}>
                      {texto}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="zona-hoy">
          <Tarjeta relleno="none" className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
              <h2 id="zona-hoy" className="text-xl font-bold">
                Tu zona hoy
              </h2>
              <Link to="/mapa" className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold text-primary hover:underline">
                Ver todas <ChevronRight className="size-5" aria-hidden />
              </Link>
            </div>
            <div className="p-2">
              {!listo ? (
                <div className="space-y-2 p-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                  ))}
                </div>
              ) : ultimas.length === 0 ? (
                <EstadoVacio ilustracion="reportes" titulo="Sin novedades por ahora" texto="Cuando alguien reporte algo, lo verás aquí." />
              ) : (
                <ul>
                  {ultimas.map((r) => (
                    <li key={r.id}>
                      <ItemNovedad reporte={r} ahora={ahora} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Tarjeta>
        </section>

        <Link
          to="/asistente"
          className={cn(tarjetaVariantes({ variante: "suave" }), "flex items-center gap-3 transition-colors hover:bg-accent")}
        >
          <MessageCircle className="size-6 shrink-0 text-primary" aria-hidden />
          <span className="flex-1">
            <span className="block font-bold text-primary">¿Dudas con la app?</span>
            <span className="block text-muted-foreground">Pregúntale al asistente de RutaSegura</span>
          </span>
          <ChevronRight className="size-5 text-primary" aria-hidden />
        </Link>
      </div>
      <PieDemo />
    </div>
  );
}
