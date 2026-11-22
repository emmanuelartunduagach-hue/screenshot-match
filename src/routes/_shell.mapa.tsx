import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { PieDemo } from "@/components/rs/Avisos";
import { Boton, botonVariantes } from "@/components/rs/Boton";
import { DetalleNovedad } from "@/components/rs/DetalleNovedad";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { EstadoVacio } from "@/components/rs/EstadoVacio";
import { FiltrosTipo } from "@/components/rs/FiltrosTipo";
import { ItemNovedad } from "@/components/rs/ItemNovedad";
import { MapaNeiva } from "@/components/rs/MapaNeiva";
import { Skeleton } from "@/components/ui/skeleton";
import { useAhora } from "@/hooks/use-ahora";
import { metaPantalla } from "@/lib/meta";
import { TIPOS } from "@/lib/novedades";
import { acciones, useEstado } from "@/lib/store";
import type { TipoNovedad, VistaMapa } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/mapa")({
  head: () => metaPantalla("Mapa de novedades", "Mapa de Neiva con hurtos, mala iluminación, obras y zonas seguras reportadas por la comunidad."),
  component: Mapa,
});

function Mapa() {
  const estado = useEstado();
  const ahora = useAhora();
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [enfocar, setEnfocar] = useState<{ lat: number; lng: number; zoom: number; clave: string } | null>(null);

  const activos = useMemo(
    () => estado.reportes.filter((r) => !r.resuelto).sort((a, b) => b.creadoEn - a.creadoEn),
    [estado.reportes],
  );
  const conteos = useMemo(() => {
    const c: Record<TipoNovedad, number> = { hurto: 0, iluminacion: 0, obra: 0, segura: 0 };
    activos.forEach((r) => (c[r.tipo] += 1));
    return c;
  }, [activos]);
  const filtro = estado.filtroMapa;
  const visibles = useMemo(
    () => (filtro === "todos" ? activos : activos.filter((r) => r.tipo === filtro)),
    [activos, filtro],
  );
  const detalle = estado.reportes.find((r) => r.id === seleccionado) ?? null;
  const guardarVista = useCallback((v: VistaMapa) => acciones.guardarVistaMapa(v), []);
  const listo = ahora > 0;

  const abrir = (id: string, volar: boolean) => {
    setSeleccionado(id);
    const r = estado.reportes.find((x) => x.id === id);
    if (r && volar) setEnfocar({ lat: r.lat, lng: r.lng, zoom: 17, clave: `${id}-${Date.now()}` });
  };

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(260px,44%)_auto_minmax(0,1fr)] lg:grid-cols-[420px_minmax(0,1fr)] lg:grid-rows-[auto_auto_minmax(0,1fr)]">
      <EncabezadoPantalla
        titulo="Mapa de novedades"
        subtitulo={listo ? `${activos.length} novedades activas en Neiva` : "Neiva, Huila"}
        className="lg:col-start-1 lg:row-start-1 lg:border-r lg:border-border"
      />

      <div className="relative lg:col-start-2 lg:row-span-3 lg:row-start-1">
        {listo ? (
          <MapaNeiva
            etiqueta="Mapa de novedades de Neiva"
            className="absolute inset-0"
            reportes={visibles}
            agrupar
            activoId={seleccionado}
            onSeleccionarReporte={(id) => abrir(id, false)}
            vista={estado.vistaMapa}
            onCambioVista={guardarVista}
            enfocar={enfocar}
          />
        ) : (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        <Link
          to="/reportar"
          className={cn(botonVariantes({ tamano: "lg" }), "absolute bottom-4 right-4 z-[500] rounded-full shadow-elevada")}
        >
          <Plus aria-hidden /> Reportar
        </Link>
      </div>

      <div className="border-b border-border bg-background px-4 py-3 sm:px-6 lg:col-start-1 lg:row-start-2 lg:border-r">
        <FiltrosTipo filtro={filtro} conteos={conteos} onCambiar={(f) => acciones.cambiarFiltro(f)} className="lg:flex-wrap" />
      </div>

      <section aria-labelledby="lista-novedades" className="min-h-0 overflow-y-auto lg:col-start-1 lg:row-start-3 lg:border-r lg:border-border">
        <h2 id="lista-novedades" className="px-4 pb-1 pt-4 text-lg font-bold sm:px-6">
          {filtro === "todos" ? "Novedades recientes" : TIPOS[filtro].etiqueta}
        </h2>
        <div className="px-2 sm:px-4">
          {!listo ? (
            <div className="space-y-2 p-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : visibles.length === 0 ? (
            <EstadoVacio
              ilustracion="filtro"
              titulo="No hay novedades de este tipo"
              texto="Prueba con otro filtro o reporta lo que veas."
              accion={
                <Boton variante="contorno" onClick={() => acciones.cambiarFiltro("todos")}>
                  Ver todas
                </Boton>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {visibles.map((r) => (
                <li key={r.id} className="py-1">
                  <ItemNovedad reporte={r} ahora={ahora} activo={r.id === seleccionado} onClick={() => abrir(r.id, true)} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <PieDemo />
      </section>

      <DetalleNovedad
        reporte={detalle}
        ahora={ahora}
        yaConfirmado={detalle ? estado.confirmados.includes(detalle.id) : false}
        onCerrar={() => setSeleccionado(null)}
      />
    </div>
  );
}
