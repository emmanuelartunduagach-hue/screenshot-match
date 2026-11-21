import { ArrowRight, Clock, Footprints, ShieldCheck, Sparkles } from "lucide-react";

import { formatoKm } from "@/lib/formato";
import { ORDEN_TIPOS, TIPOS } from "@/lib/novedades";
import type { RutaSimulada } from "@/lib/rutas";
import { cn } from "@/lib/utils";

import { Boton } from "./Boton";
import { Etiqueta } from "./Etiqueta";
import { MedidorSeguridad } from "./Medidor";
import { Tarjeta } from "./Tarjeta";

export function MuestraLinea({ estilo }: { estilo: "rapida" | "alterna" }) {
  return (
    <svg viewBox="0 0 40 10" className="h-2.5 w-10 shrink-0" aria-hidden>
      {estilo === "alterna" ? (
        <line x1="2" y1="5" x2="38" y2="5" className="stroke-primary" strokeWidth="5" strokeLinecap="round" />
      ) : (
        <line x1="2" y1="5" x2="38" y2="5" className="stroke-muted-foreground" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 7" />
      )}
    </svg>
  );
}

export function TarjetaRuta({
  ruta,
  recomendada,
  explicacion,
  seleccionada,
  onSeleccionar,
  onElegir,
}: {
  ruta: RutaSimulada;
  recomendada: boolean;
  explicacion?: string | undefined;
  seleccionada: boolean;
  onSeleccionar: () => void;
  onElegir: () => void;
}) {
  const cercanos = ORDEN_TIPOS.filter((t) => ruta.conteo[t] > 0);
  return (
    <Tarjeta variante={seleccionada ? "resaltada" : "normal"} relleno="none" className="overflow-hidden animate-aparecer">
      <button
        type="button"
        onClick={onSeleccionar}
        aria-pressed={seleccionada}
        aria-label={`${ruta.nombre}${recomendada ? ", más segura" : ""}. Ver en el mapa`}
        className="block w-full space-y-4 p-4 text-left transition-colors hover:bg-muted/60 sm:p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <MuestraLinea estilo={ruta.id} />
          <h3 className="mr-auto text-lg font-bold">{ruta.nombre}</h3>
          {recomendada && (
            <Etiqueta tono="segura" icono={ShieldCheck}>
              Más segura
            </Etiqueta>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Clock className="size-5 text-muted-foreground" aria-hidden />
            <dt className="sr-only">Tiempo</dt>
            <dd className="font-bold">{ruta.minutos} min</dd>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Footprints className="size-5 text-muted-foreground" aria-hidden />
            <dt className="sr-only">Distancia a pie</dt>
            <dd className="font-bold">{formatoKm(ruta.distanciaKm)}</dd>
          </div>
        </dl>

        <MedidorSeguridad puntaje={ruta.puntaje} />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground">Cerca:</span>
          {cercanos.length === 0 ? (
            <span className="text-muted-foreground">sin reportes</span>
          ) : (
            cercanos.map((t) => {
              const meta = TIPOS[t];
              return (
                <Etiqueta key={t} tono={t} icono={meta.icono}>
                  {ruta.conteo[t]} {meta.etiqueta.toLowerCase()}
                </Etiqueta>
              );
            })
          )}
        </div>

        {recomendada && explicacion && (
          <p className="flex gap-2 rounded-xl bg-segura-soft p-3 font-medium text-segura-fg">
            <Sparkles className="mt-0.5 size-5 shrink-0" aria-hidden />
            {explicacion}
          </p>
        )}
      </button>
      <div className="border-t border-border p-3 sm:px-5">
        <Boton bloque variante={recomendada || seleccionada ? "primario" : "contorno"} onClick={onElegir}>
          Elegir esta ruta <ArrowRight aria-hidden />
        </Boton>
      </div>
    </Tarjeta>
  );
}

export function claseSeleccion(sel: boolean) {
  return cn(sel && "ring-2 ring-primary");
}
