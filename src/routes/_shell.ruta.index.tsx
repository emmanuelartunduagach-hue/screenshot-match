import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, ChevronUp, Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { Aviso } from "@/components/rs/Aviso";
import { PieDemo } from "@/components/rs/Avisos";
import { Boton } from "@/components/rs/Boton";
import { CampoSelect } from "@/components/rs/Campo";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { MapaNeiva, type RutaMapa } from "@/components/rs/MapaNeiva";
import { TarjetaRuta } from "@/components/rs/TarjetaRuta";
import { Skeleton } from "@/components/ui/skeleton";
import { useAhora } from "@/hooks/use-ahora";
import { useEsEscritorio } from "@/hooks/use-escritorio";
import { LUGARES, lugarPorId } from "@/lib/lugares";
import { metaPantalla } from "@/lib/meta";
import { MENSAJE_SIMILAR, novedadesEvitadas, planearRutas, type PlanRutas, type RutaSimulada } from "@/lib/rutas";
import { obtenerTrazosCalles, planearDesdeTrazos, type TrazoCalles } from "@/lib/rutas-calles";
import { acciones, useEstado } from "@/lib/store";
import type { RutaElegida } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/ruta/")({
  head: () => metaPantalla("Planear ruta segura", "Compara la ruta más rápida y una alterna con su puntaje de seguridad entre lugares de Neiva."),
  component: PlanearRuta,
});

const ALTURA_CERRADO = 168;
const ORDEN_ALTERNA: ("alterna" | "rapida")[] = ["alterna", "rapida"];
const ORDEN_RAPIDA: ("alterna" | "rapida")[] = ["rapida", "alterna"];

function PlanearRuta() {
  const estado = useEstado();
  const ahora = useAhora(60000);
  const esEscritorio = useEsEscritorio();
  const navigate = useNavigate();
  const origenId = estado.ultimoOrigen;
  const destinoId = estado.ultimoDestino;
  const origen = lugarPorId(origenId);
  const destino = lugarPorId(destinoId);
  const mismoLugar = origenId === destinoId;

  const activos = useMemo(() => estado.reportes.filter((r) => !r.resuelto), [estado.reportes]);
  // Trazos reales por calles (OSRM). Si falla la conexión se usa la ruta aproximada.
  const [trazos, setTrazos] = useState<{ clave: string; estado: "cargando" | "listo" | "error"; datos: TrazoCalles[] }>({
    clave: "",
    estado: "cargando",
    datos: [],
  });
  const claveTrayecto = `${origenId}-${destinoId}`;
  useEffect(() => {
    if (!origen || !destino || mismoLugar) return;
    const control = new AbortController();
    setTrazos({ clave: claveTrayecto, estado: "cargando", datos: [] });
    obtenerTrazosCalles(origen, destino, control.signal)
      .then((datos) => setTrazos({ clave: claveTrayecto, estado: "listo", datos }))
      .catch(() => {
        if (!control.signal.aborted) setTrazos({ clave: claveTrayecto, estado: "error", datos: [] });
      });
    return () => control.abort();
  }, [claveTrayecto, origen, destino, mismoLugar]);
  const estadoTrazos = trazos.clave === claveTrayecto ? trazos.estado : "cargando";

  const plan = useMemo<PlanRutas | null>(() => {
    if (!(ahora > 0 && origen && destino && !mismoLugar)) return null;
    if (estadoTrazos === "listo" && trazos.datos.length > 0) return planearDesdeTrazos(trazos.datos, activos, ahora);
    if (estadoTrazos === "error") return planearRutas(origen, destino, activos, ahora);
    return null;
  }, [ahora, origen, destino, mismoLugar, activos, estadoTrazos, trazos.datos]);

  const [seleccion, setSeleccion] = useState<"rapida" | "alterna">("alterna");
  const recomendada = plan?.recomendada ?? null;
  useEffect(() => {
    setSeleccion(recomendada ?? "alterna");
  }, [origenId, destinoId, recomendada]);

  // Panel inferior (celular)
  const [abierto, setAbierto] = useState(true);
  const contRef = useRef<HTMLDivElement>(null);
  const [altoCont, setAltoCont] = useState(0);
  useEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAltoCont(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const altoAbierto = Math.round(altoCont * 0.58);
  const altoVisible = abierto ? altoAbierto : ALTURA_CERRADO;

  const rutasMapa = useMemo<RutaMapa[]>(
    () =>
      plan
        ? [
            { id: "rapida", puntos: plan.rapida.puntos, estilo: "rapida", tenue: seleccion !== "rapida" },
            { id: "alterna", puntos: plan.alterna.puntos, estilo: "alterna", tenue: seleccion !== "alterna" },
          ]
        : [],
    [plan, seleccion],
  );
  const reportesMapa = useMemo(() => {
    if (!plan) return [];
    const ids = new Set([...plan.rapida.cercanos, ...plan.alterna.cercanos].map((r) => r.id));
    return activos.filter((r) => ids.has(r.id));
  }, [plan, activos]);

  const encajar = useMemo(() => {
    if (!plan) return null;
    return {
      puntos: [...plan.rapida.puntos, ...plan.alterna.puntos],
      clave: `${origenId}-${destinoId}-${esEscritorio ? "e" : abierto ? "a" : "c"}-${altoCont > 0}`,
      relleno: esEscritorio
        ? { top: 50, right: 50, bottom: 50, left: 50 }
        : { top: 30, right: 30, bottom: altoVisible + 20, left: 30 },
    };
  }, [plan, origenId, destinoId, esEscritorio, abierto, altoVisible, altoCont]);

  const elegir = (ruta: RutaSimulada) => {
    if (!plan) return;
    const otra = ruta.id === "rapida" ? plan.alterna : plan.rapida;
    const explicacion =
      plan.recomendada === null
        ? MENSAJE_SIMILAR
        : plan.recomendada === ruta.id
          ? plan.explicacion
          : "Es la otra opción: revisa las novedades que tiene cerca antes de salir.";
    const elegida: RutaElegida = {
      id: `${origenId}-${destinoId}-${ruta.id}`,
      origenId,
      destinoId,
      nombre: ruta.nombre,
      minutos: ruta.minutos,
      distanciaKm: ruta.distanciaKm,
      puntaje: ruta.puntaje,
      explicacion,
      evitadas: novedadesEvitadas(ruta, otra).map((r) => ({ id: r.id, tipo: r.tipo, barrio: r.barrio })),
      zonasSeguras: ruta.conteo.segura,
      puntos: ruta.puntos,
      elegidaEn: Date.now(),
    };
    acciones.elegirRuta(elegida);
    void navigate({ to: "/ruta/confirmada" });
  };

  const contenido = (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 space-y-3">
          <CampoSelect
            id="ruta-origen"
            etiqueta="Origen"
            value={origenId}
            onChange={(e) => acciones.recordarTrayecto(e.target.value, destinoId)}
          >
            {LUGARES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </CampoSelect>
          <CampoSelect
            id="ruta-destino"
            etiqueta="Destino"
            value={destinoId}
            onChange={(e) => acciones.recordarTrayecto(origenId, e.target.value)}
            error={mismoLugar ? "Elige un destino diferente al origen" : undefined}
          >
            {LUGARES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </CampoSelect>
        </div>
        <Boton
          variante="secundario"
          tamano="icono"
          aria-label="Intercambiar origen y destino"
          className="mt-7 shrink-0"
          onClick={() => acciones.recordarTrayecto(destinoId, origenId)}
        >
          <ArrowUpDown />
        </Boton>
      </div>

      {plan ? (
        <>
          {plan.fuente === "aproximada" && (
            <Aviso tono="advertencia" titulo="No se pudo cargar la ruta por calles">
              Revisa tu conexión. Mientras tanto se muestra una ruta aproximada en línea recta.
            </Aviso>
          )}
          {plan.recomendada === null && (
            <Aviso tono="info" titulo={MENSAJE_SIMILAR}>
              Elige la que prefieras. La más rápida te toma {plan.rapida.minutos} min.
            </Aviso>
          )}
          {(plan.recomendada === "rapida" ? ORDEN_RAPIDA : ORDEN_ALTERNA).map((id) => (
              <TarjetaRuta
                key={id}
                ruta={plan[id]}
                recomendada={plan.recomendada === id}
                explicacion={plan.recomendada === id ? plan.explicacion : undefined}
                seleccionada={seleccion === id}
                onSeleccionar={() => setSeleccion(id)}
                onElegir={() => elegir(plan[id])}
              />
            ))}
        </>
      ) : !mismoLugar ? (
        <div className="space-y-3">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : null}

      <p className="flex items-center gap-2 text-muted-foreground">
        <Info className="size-5 shrink-0" aria-hidden />{" "}
        {plan?.fuente === "aproximada"
          ? "Ruta aproximada con datos de ejemplo"
          : "Rutas a pie por calles reales (OpenStreetMap). Novedades de ejemplo"}
      </p>
      <PieDemo className="pt-0" />
    </div>
  );

  const mapa =
    ahora > 0 ? (
      <MapaNeiva
        etiqueta="Mapa con las rutas sugeridas"
        className="absolute inset-0"
        rutas={rutasMapa}
        reportes={reportesMapa}
        origen={origen ?? null}
        destino={destino ?? null}
        encajar={encajar}
      />
    ) : (
      <Skeleton className="absolute inset-0 rounded-none" />
    );

  const resumen = plan ? plan[seleccion] : null;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex shrink-0 flex-col lg:h-full lg:w-[440px] lg:border-r lg:border-border">
        <EncabezadoPantalla titulo="Planear ruta segura" subtitulo="Compara y elige cómo llegar" />
        {esEscritorio && <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{contenido}</div>}
      </div>

      <div ref={contRef} className="relative min-h-0 flex-1 overflow-hidden">
        {mapa}
        {!esEscritorio && (
          <PanelInferior
            abierto={abierto}
            onCambiar={setAbierto}
            alto={altoAbierto}
            resumen={
              resumen
                ? `${resumen.nombre}${plan?.recomendada === resumen.id ? " · Más segura" : ""} · ${resumen.minutos} min · ${resumen.puntaje}/100`
                : mismoLugar
                  ? "Elige un destino diferente"
                  : "Calculando rutas…"
            }
          >
            {contenido}
          </PanelInferior>
        )}
      </div>
    </div>
  );
}

function PanelInferior({
  abierto,
  onCambiar,
  alto,
  resumen,
  children,
}: {
  abierto: boolean;
  onCambiar: (v: boolean) => void;
  alto: number;
  resumen: string;
  children: React.ReactNode;
}) {
  const inicioY = useRef<number | null>(null);
  const arrastro = useRef(false);

  const bajar = (e: ReactPointerEvent) => {
    inicioY.current = e.clientY;
  };
  const soltar = (e: ReactPointerEvent) => {
    if (inicioY.current === null) return;
    const dy = e.clientY - inicioY.current;
    inicioY.current = null;
    if (Math.abs(dy) > 24) {
      arrastro.current = true;
      onCambiar(dy < 0);
    }
  };

  return (
    <section
      aria-label="Rutas sugeridas"
      className="absolute inset-x-0 bottom-0 z-[600] flex flex-col rounded-t-3xl bg-card shadow-panel transition-[height] duration-300 ease-out"
      style={{ height: abierto && alto > 0 ? alto : ALTURA_CERRADO }}
    >
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="panel-rutas"
        onPointerDown={bajar}
        onPointerUp={soltar}
        onClick={() => {
          if (arrastro.current) {
            arrastro.current = false;
            return;
          }
          onCambiar(!abierto);
        }}
        className="w-full shrink-0 touch-none rounded-t-3xl px-5 pb-2 pt-2.5 text-left"
      >
        <span className="mx-auto block h-1.5 w-12 rounded-full bg-border" aria-hidden />
        <span className="mt-2 flex items-center gap-2">
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold">{abierto ? "Tus rutas" : "Ver rutas"}</span>
            <span className="block truncate text-muted-foreground">{resumen}</span>
          </span>
          <span className="grid size-11 place-items-center rounded-full bg-muted">
            <ChevronUp className={cn("size-5 transition-transform", abierto && "rotate-180")} aria-hidden />
          </span>
          <span className="sr-only">{abierto ? "Bajar panel" : "Subir panel"}</span>
        </span>
      </button>
      <div id="panel-rutas" className={cn("min-h-0 flex-1 overflow-y-auto px-4 pb-4", !abierto && "overflow-hidden")}>
        {children}
      </div>
    </section>
  );
}
