import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ClipboardList, Home, Map, MapPin, MousePointerClick, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Aviso } from "@/components/rs/Aviso";
import { PieDemo } from "@/components/rs/Avisos";
import { Boton, botonVariantes } from "@/components/rs/Boton";
import { CampoArea, CampoTexto, MensajeError } from "@/components/rs/Campo";
import { EncabezadoPantalla, useVolver } from "@/components/rs/EncabezadoPantalla";
import { EstadoVacio } from "@/components/rs/EstadoVacio";
import { IconoTipo } from "@/components/rs/Etiqueta";
import { MapaNeiva } from "@/components/rs/MapaNeiva";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAhora } from "@/hooks/use-ahora";
import { barrioMasCercano, dentroDeNeiva } from "@/lib/lugares";
import { metaPantalla } from "@/lib/meta";
import { ORDEN_TIPOS, TIPOS } from "@/lib/novedades";
import { acciones, useEstado } from "@/lib/store";
import type { Coordenada, TipoNovedad } from "@/lib/tipos";
import { MAX_DESCRIPCION, validarDescripcion, validarNombre } from "@/lib/validacion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/reportar")({
  head: () => metaPantalla("Reportar novedad", "Ubica en el mapa de Neiva un hurto, mala iluminación, obra o zona segura y avisa a tus vecinos."),
  component: Reportar,
});

type Paso = 1 | 2 | 3 | "listo";
const PASOS = ["Ubicación", "Tipo", "Descripción"];

function Reportar() {
  const { sesion } = useEstado();
  const listo = useAhora() > 0;
  const navigate = useNavigate();
  const volver = useVolver("/mapa");

  const [paso, setPaso] = useState<Paso>(1);
  const [punto, setPunto] = useState<Coordenada | null>(null);
  const [errorPunto, setErrorPunto] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoNovedad | null>(null);
  const [errorTipo, setErrorTipo] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [anonimo, setAnonimo] = useState(true);
  const [nombre, setNombre] = useState(sesion && !sesion.invitado ? sesion.nombre : "");
  const [errores, setErrores] = useState<{ descripcion?: string | undefined; nombre?: string | undefined }>({});
  const [publicando, setPublicando] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  useEffect(() => {
    if (sesion && !sesion.invitado) setNombre((n) => n || sesion.nombre);
  }, [sesion]);

  const hayDatos = paso !== "listo" && (punto !== null || tipo !== null || descripcion.trim().length > 0);
  const salir = () => (hayDatos ? setConfirmarSalida(true) : volver());

  const elegirPunto = (c: Coordenada) => {
    if (!dentroDeNeiva(c)) {
      setErrorPunto("Elige un punto dentro de Neiva");
      toast.error("Elige un punto dentro de Neiva");
      return;
    }
    setErrorPunto(null);
    setPunto(c);
  };

  const publicar = () => {
    const nuevos: { descripcion?: string; nombre?: string } = {};
    const eD = validarDescripcion(descripcion);
    if (eD) nuevos.descripcion = eD;
    if (!anonimo) {
      const eN = validarNombre(nombre);
      if (eN) nuevos.nombre = eN === "Escribe tu nombre" ? "Escribe tu nombre o elige reportar de forma anónima" : eN;
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0 || !punto || !tipo) {
      document.getElementById(nuevos.descripcion ? "reporte-descripcion" : "reporte-nombre")?.focus();
      return;
    }
    setPublicando(true);
    window.setTimeout(() => {
      acciones.crearReporte({
        tipo,
        descripcion: descripcion.trim(),
        lat: punto.lat,
        lng: punto.lng,
        barrio: barrioMasCercano(punto),
        autor: anonimo ? null : nombre.trim(),
      });
      setPublicando(false);
      setPaso("listo");
      toast.success("Reporte publicado. Ya aparece en el mapa");
    }, 500);
  };

  if (paso === "listo") {
    return (
      <div className="mx-auto max-w-xl">
        <EncabezadoPantalla titulo="Reporte publicado" volverA="/mapa" />
        <EstadoVacio
          ilustracion="listo"
          titulo="¡Gracias! Tu reporte ya está en el mapa"
          texto="Tus vecinos podrán verlo y confirmarlo. Puedes editarlo o eliminarlo cuando quieras."
          accion={
            <div className="flex w-full max-w-xs flex-col gap-3">
              <Link to="/mis-reportes" className={botonVariantes({ tamano: "lg", bloque: true })}>
                <ClipboardList aria-hidden /> Ver mis reportes
              </Link>
              <Link to="/mapa" className={botonVariantes({ variante: "contorno", bloque: true })}>
                <Map aria-hidden /> Ver en el mapa
              </Link>
              <Link to="/inicio" className={botonVariantes({ variante: "fantasma", bloque: true })}>
                <Home aria-hidden /> Volver al inicio
              </Link>
            </div>
          }
        />
        <PieDemo />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto flex flex-col", paso === 1 ? "h-full max-w-5xl" : "max-w-xl")}>
      <EncabezadoPantalla titulo="Reportar novedad" subtitulo={`Paso ${paso} de 3 · ${PASOS[paso - 1]}`} onVolver={salir} />

      <div className="px-4 sm:px-6">
        <ol className="grid grid-cols-3 gap-2" aria-label="Progreso del reporte">
          {PASOS.map((p, i) => (
            <li key={p} aria-current={paso === i + 1 ? "step" : undefined}>
              <span className={cn("block h-1.5 rounded-full transition-colors", i + 1 <= paso ? "bg-primary" : "bg-border")} />
              <span className={cn("mt-1 block", i + 1 === paso ? "font-bold text-primary" : "text-muted-foreground")}>{p}</span>
            </li>
          ))}
        </ol>
      </div>

      {paso === 1 && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-4 sm:px-6">
          <p className="flex items-center gap-2 font-medium">
            <MousePointerClick className="size-5 text-primary" aria-hidden /> Toca el mapa donde ocurrió la novedad.
          </p>
          <div className="relative min-h-72 flex-1 overflow-hidden rounded-2xl border border-border">
            {listo ? (
              <MapaNeiva
                etiqueta="Mapa para ubicar el reporte. Toca un punto dentro de Neiva"
                className="absolute inset-0"
                onClicMapa={elegirPunto}
                puntoElegido={punto}
                mostrarLimite
                vista={{ lat: 2.932, lng: -75.287, zoom: 14 }}
              />
            ) : (
              <Skeleton className="absolute inset-0" />
            )}
          </div>
          {errorPunto && <Aviso tono="error">{errorPunto}. La zona válida está marcada con línea punteada.</Aviso>}
          {punto && !errorPunto && (
            <Aviso tono="exito" icono={MapPin} titulo={`Punto en ${barrioMasCercano(punto)}`}>
              Puedes tocar otro lugar para cambiarlo.
            </Aviso>
          )}
          <div className="flex gap-3">
            <Boton variante="contorno" onClick={salir}>
              Cancelar
            </Boton>
            <Boton className="flex-1" disabled={!punto} onClick={() => setPaso(2)}>
              Continuar <ArrowRight aria-hidden />
            </Boton>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-4 px-4 pb-6 pt-5 sm:px-6">
          <fieldset>
            <legend className="mb-3 text-lg font-bold">¿Qué tipo de novedad es?</legend>
            <div role="radiogroup" aria-label="Tipo de novedad" className="grid gap-3 sm:grid-cols-2">
              {ORDEN_TIPOS.map((t) => {
                const meta = TIPOS[t];
                const activo = tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => {
                      setTipo(t);
                      setErrorTipo(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all hover:border-primary/40",
                      activo ? "border-primary shadow-elevada" : "border-border",
                    )}
                  >
                    <IconoTipo tipo={t} />
                    <span className="flex-1">
                      <span className="block font-bold">{meta.etiqueta}</span>
                      <span className="block text-muted-foreground">{meta.descripcionCorta}</span>
                    </span>
                    <span
                      className={cn("grid size-6 place-items-center rounded-full border-2", activo ? "border-primary bg-primary" : "border-input")}
                      aria-hidden
                    >
                      {activo && <span className="size-2.5 rounded-full bg-primary-foreground" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          {errorTipo && <MensajeError id="tipo-error">{errorTipo}</MensajeError>}
          <div className="flex gap-3">
            <Boton variante="contorno" onClick={() => setPaso(1)}>
              <ArrowLeft aria-hidden /> Atrás
            </Boton>
            <Boton
              className="flex-1"
              onClick={() => {
                if (!tipo) {
                  setErrorTipo("Elige un tipo de novedad para continuar");
                  return;
                }
                setPaso(3);
              }}
            >
              Continuar <ArrowRight aria-hidden />
            </Boton>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6">
          <CampoArea
            id="reporte-descripcion"
            etiqueta="Describe lo que pasó"
            placeholder="Ej.: Dos personas en moto robando celulares en la esquina."
            value={descripcion}
            maxLength={MAX_DESCRIPCION}
            onChange={(e) => {
              setDescripcion(e.target.value);
              if (errores.descripcion) setErrores((x) => ({ ...x, descripcion: validarDescripcion(e.target.value) }));
            }}
            error={errores.descripcion}
            ayuda="Entre 10 y 140 caracteres. No incluyas datos personales."
            contador={
              <span className={cn("tabular-nums", descripcion.trim().length < 10 ? "text-muted-foreground" : "text-segura-fg")} aria-live="polite">
                {descripcion.length}/{MAX_DESCRIPCION}
              </span>
            }
          />

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="reporte-anonimo" className="flex-1">
                <span className="block font-bold">Reportar de forma anónima</span>
                <span className="block text-muted-foreground">Tu nombre no se mostrará en el mapa.</span>
              </label>
              <Switch id="reporte-anonimo" checked={anonimo} onCheckedChange={setAnonimo} />
            </div>
            {!anonimo && (
              <div className="mt-4">
                <CampoTexto
                  id="reporte-nombre"
                  etiqueta="Tu nombre"
                  placeholder="Así te verán tus vecinos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  error={errores.nombre}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Boton variante="contorno" onClick={() => setPaso(2)}>
              <ArrowLeft aria-hidden /> Atrás
            </Boton>
            <Boton className="flex-1" onClick={publicar} cargando={publicando}>
              {!publicando && <Send aria-hidden />} {publicando ? "Publicando…" : "Publicar"}
            </Boton>
          </div>
        </div>
      )}

      <AlertDialog open={confirmarSalida} onOpenChange={setConfirmarSalida}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Cancelar el reporte?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">Perderás lo que llevas escrito y el punto que elegiste.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel asChild>
              <Boton variante="contorno">Seguir reportando</Boton>
            </AlertDialogCancel>
            <Boton
              variante="peligro"
              onClick={() => {
                setConfirmarSalida(false);
                toast("Reporte cancelado");
                void navigate({ to: "/mapa" });
              }}
            >
              Sí, cancelar
            </Boton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
