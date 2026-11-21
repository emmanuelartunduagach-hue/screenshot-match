import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Bookmark, BookmarkCheck, Clock, Footprints, Home, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PieDemo } from "@/components/rs/Avisos";
import { Boton, botonVariantes } from "@/components/rs/Boton";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { EstadoVacio } from "@/components/rs/EstadoVacio";
import { EtiquetaTipo } from "@/components/rs/Etiqueta";
import { MapaNeiva } from "@/components/rs/MapaNeiva";
import { MedidorSeguridad } from "@/components/rs/Medidor";
import { Tarjeta } from "@/components/rs/Tarjeta";
import { useAhora } from "@/hooks/use-ahora";
import { formatoKm } from "@/lib/formato";
import { lugarPorId } from "@/lib/lugares";
import { metaPantalla } from "@/lib/meta";
import { contarPor } from "@/lib/novedades";
import { acciones, useEstado } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/ruta/confirmada")({
  head: () => metaPantalla("Ruta confirmada", "Resumen de la ruta que elegiste: tiempo, puntaje de seguridad y novedades que evitas."),
  component: RutaConfirmada,
});

function RutaConfirmada() {
  const { rutaElegida: ruta, rutasGuardadas } = useEstado();
  const listo = useAhora() > 0;

  if (!listo) return <EncabezadoPantalla titulo="Ruta confirmada" volverA="/ruta" />;

  if (!ruta) {
    return (
      <div className="mx-auto max-w-2xl">
        <EncabezadoPantalla titulo="Ruta confirmada" volverA="/ruta" />
        <EstadoVacio
          ilustracion="rutas"
          titulo="Aún no eliges una ruta"
          texto="Compara las opciones y elige la que más te convenga."
          accion={
            <Link to="/ruta" className={botonVariantes()}>
              Planear ruta
            </Link>
          }
        />
      </div>
    );
  }

  const origen = lugarPorId(ruta.origenId);
  const destino = lugarPorId(ruta.destinoId);
  const guardada = rutasGuardadas.some((r) => r.id === ruta.id);

  return (
    <div className="mx-auto max-w-2xl pb-4">
      <EncabezadoPantalla titulo="Ruta confirmada" volverA="/ruta" />
      <div className="space-y-4 px-4 sm:px-6">
        <div className="flex animate-subir items-center gap-4 rounded-3xl bg-segura-soft p-4 text-segura-fg">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-segura text-primary-foreground">
            <ShieldCheck className="size-7" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-bold">¡Listo! Ya tienes tu ruta</p>
            <p>Elegiste la {ruta.nombre.toLowerCase()}. Ve con cuidado.</p>
          </div>
        </div>

        <Tarjeta relleno="none" className="overflow-hidden">
          <MapaNeiva
            etiqueta="Mapa de la ruta elegida"
            className="h-52 sm:h-64"
            interactivo={false}
            rutas={[{ id: "r", puntos: ruta.puntos, estilo: ruta.nombre === "Ruta alterna" ? "alterna" : "rapida" }]}
            origen={origen ?? null}
            destino={destino ?? null}
            encajar={{ puntos: ruta.puntos, clave: ruta.id }}
          />
          <div className="space-y-4 p-4 sm:p-5">
            <ol className="space-y-1">
              <li className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground" aria-hidden>
                  A
                </span>
                <span>
                  <span className="block text-muted-foreground">Origen</span>
                  <span className="block font-bold">{origen?.nombre}</span>
                </span>
              </li>
              <li aria-hidden className="pl-1.5 text-muted-foreground">
                <ArrowDown className="size-5" />
              </li>
              <li className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full border-2 border-primary bg-card font-bold text-primary" aria-hidden>
                  B
                </span>
                <span>
                  <span className="block text-muted-foreground">Destino</span>
                  <span className="block font-bold">{destino?.nombre}</span>
                </span>
              </li>
            </ol>

            <dl className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                <Clock className="size-5 text-muted-foreground" aria-hidden />
                <dt className="sr-only">Tiempo</dt>
                <dd className="font-bold">{ruta.minutos} min a pie</dd>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                <Footprints className="size-5 text-muted-foreground" aria-hidden />
                <dt className="sr-only">Distancia</dt>
                <dd className="font-bold">{formatoKm(ruta.distanciaKm)}</dd>
              </div>
            </dl>
            <MedidorSeguridad puntaje={ruta.puntaje} />
            <p className="text-muted-foreground">{ruta.explicacion}</p>
          </div>
        </Tarjeta>

        <Tarjeta>
          <h2 className="text-lg font-bold">Novedades que evitas</h2>
          {ruta.evitadas.length === 0 ? (
            <p className="mt-1 text-muted-foreground">Esta ruta no evita novedades frente a la otra opción.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {ruta.evitadas.map((n) => (
                <li key={n.id} className="flex flex-wrap items-center gap-2">
                  <EtiquetaTipo tipo={n.tipo} />
                  <span className="text-muted-foreground">en {n.barrio}</span>
                </li>
              ))}
            </ul>
          )}
          {ruta.zonasSeguras > 0 && (
            <p className="mt-3 flex items-center gap-2 font-semibold text-segura-fg">
              <ShieldCheck className="size-5" aria-hidden /> Pasa por {contarPor(ruta.zonasSeguras, "segura")}
            </p>
          )}
        </Tarjeta>

        <div className="grid gap-3 sm:grid-cols-3">
          <Boton
            variante={guardada ? "secundario" : "primario"}
            disabled={guardada}
            onClick={() => {
              acciones.guardarRuta(ruta);
              toast.success("Ruta guardada en Mis reportes");
            }}
          >
            {guardada ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
            {guardada ? "Ruta guardada" : "Guardar ruta"}
          </Boton>
          <Link to="/ruta" className={cn(botonVariantes({ variante: "contorno" }))}>
            <RotateCcw aria-hidden /> Elegir otra
          </Link>
          <Link to="/inicio" className={cn(botonVariantes({ variante: "fantasma" }))}>
            <Home aria-hidden /> Volver al inicio
          </Link>
        </div>
      </div>
      <PieDemo />
    </div>
  );
}
