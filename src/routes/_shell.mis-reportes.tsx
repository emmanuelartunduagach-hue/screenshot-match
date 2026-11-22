import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCheck, Clock, Pencil, Plus, Route as RouteIcon, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PieDemo } from "@/components/rs/Avisos";
import { Boton, botonVariantes } from "@/components/rs/Boton";
import { CampoArea, CampoSelect } from "@/components/rs/Campo";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { EstadoVacio } from "@/components/rs/EstadoVacio";
import { EtiquetaEstado, EtiquetaTipo, IconoTipo } from "@/components/rs/Etiqueta";
import { MedidorSeguridad } from "@/components/rs/Medidor";
import { Tarjeta } from "@/components/rs/Tarjeta";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAhora } from "@/hooks/use-ahora";
import { formatoFecha, formatoKm } from "@/lib/formato";
import { lugarPorId } from "@/lib/lugares";
import { metaPantalla } from "@/lib/meta";
import { ORDEN_TIPOS, TIPOS, confirmacionesEfectivas, estadoReporte, tiempoRelativo } from "@/lib/novedades";
import { acciones, useEstado } from "@/lib/store";
import type { Reporte, RutaElegida, TipoNovedad } from "@/lib/tipos";
import { MAX_DESCRIPCION, validarDescripcion } from "@/lib/validacion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/mis-reportes")({
  head: () => metaPantalla("Mis reportes", "Sigue el estado de tus reportes en Neiva y revisa tus rutas guardadas."),
  component: MisReportes,
});

type Eliminar = { clase: "reporte"; id: string } | { clase: "ruta"; id: string } | null;

function MisReportes() {
  const { reportes, rutasGuardadas } = useEstado();
  const ahora = useAhora();
  const navigate = useNavigate();
  const propios = useMemo(() => reportes.filter((r) => r.propio).sort((a, b) => b.creadoEn - a.creadoEn), [reportes]);
  const [editando, setEditando] = useState<Reporte | null>(null);
  const [eliminar, setEliminar] = useState<Eliminar>(null);
  const listo = ahora > 0;

  const verRuta = (r: RutaElegida) => {
    acciones.elegirRuta(r);
    void navigate({ to: "/ruta/confirmada" });
  };

  return (
    <div className="mx-auto max-w-3xl pb-4">
      <EncabezadoPantalla
        titulo="Mis reportes"
        subtitulo="Seguimiento de lo que has reportado"
        acciones={
          <Link to="/reportar" className={cn(botonVariantes({ tamano: "sm" }), "hidden sm:inline-flex")}>
            <Plus aria-hidden /> Reportar
          </Link>
        }
      />

      <div className="space-y-8 px-4 sm:px-6">
        <section aria-labelledby="titulo-reportes" className="space-y-3">
          <h2 id="titulo-reportes" className="text-xl font-bold">
            Reportes {listo && propios.length > 0 && <span className="text-muted-foreground">({propios.length})</span>}
          </h2>
          {!listo ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : propios.length === 0 ? (
            <Tarjeta>
              <EstadoVacio
                ilustracion="reportes"
                titulo="Aún no tienes reportes"
                texto="Cuando veas algo en tu camino, repórtalo para cuidar a tus vecinos."
                accion={
                  <Link to="/reportar" className={botonVariantes()}>
                    <Plus aria-hidden /> Reportar novedad
                  </Link>
                }
              />
            </Tarjeta>
          ) : (
            <ul className="space-y-3">
              {propios.map((r) => (
                <li key={r.id}>
                  <Tarjeta className="animate-aparecer space-y-3">
                    <div className="flex gap-3">
                      <IconoTipo tipo={r.tipo} />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <EtiquetaTipo tipo={r.tipo} />
                          <EtiquetaEstado estado={estadoReporte(r, ahora)} />
                        </div>
                        <p className="font-medium">{r.descripcion}</p>
                        <p className="flex flex-wrap gap-x-3 text-muted-foreground">
                          <span>{r.barrio}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-4" aria-hidden />
                            {tiempoRelativo(r.creadoEn, ahora)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CheckCheck className="size-4" aria-hidden />
                            {confirmacionesEfectivas(r, ahora)} confirmaciones
                          </span>
                          <span>{r.autor ? `Como ${r.autor}` : "Anónimo"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-border pt-3">
                      <Boton variante="secundario" tamano="sm" onClick={() => setEditando(r)}>
                        <Pencil aria-hidden /> Editar
                      </Boton>
                      <Boton variante="fantasma" tamano="sm" className="text-hurto-fg hover:bg-hurto-soft" onClick={() => setEliminar({ clase: "reporte", id: r.id })}>
                        <Trash2 aria-hidden /> Eliminar
                      </Boton>
                    </div>
                  </Tarjeta>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-rutas" className="space-y-3">
          <h2 id="titulo-rutas" className="text-xl font-bold">
            Rutas guardadas
          </h2>
          {!listo ? (
            <Skeleton className="h-32 rounded-2xl" />
          ) : rutasGuardadas.length === 0 ? (
            <Tarjeta>
              <EstadoVacio
                ilustracion="rutas"
                titulo="Aún no guardas rutas"
                texto="Planea una ruta y guárdala para tenerla a mano."
                accion={
                  <Link to="/ruta" className={botonVariantes({ variante: "contorno" })}>
                    <RouteIcon aria-hidden /> Planear ruta
                  </Link>
                }
              />
            </Tarjeta>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {rutasGuardadas.map((r) => (
                <li key={r.id}>
                  <Tarjeta className="flex h-full flex-col gap-3">
                    <div>
                      <p className="font-bold leading-snug">
                        {lugarPorId(r.origenId)?.corto} <ArrowRight className="inline size-4" aria-label="a" />{" "}
                        {lugarPorId(r.destinoId)?.corto}
                      </p>
                      <p className="text-muted-foreground">
                        {r.nombre} · {r.minutos} min · {formatoKm(r.distanciaKm)}
                      </p>
                      <p className="text-muted-foreground">Guardada el {formatoFecha(r.elegidaEn)}</p>
                    </div>
                    <MedidorSeguridad puntaje={r.puntaje} />
                    <div className="mt-auto flex gap-2">
                      <Boton tamano="sm" className="flex-1" onClick={() => verRuta(r)}>
                        Ver ruta
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" aria-label="Eliminar ruta guardada" className="text-hurto-fg hover:bg-hurto-soft" onClick={() => setEliminar({ clase: "ruta", id: r.id })}>
                        <Trash2 />
                      </Boton>
                    </div>
                  </Tarjeta>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <PieDemo />

      <EditarReporte reporte={editando} onCerrar={() => setEditando(null)} />

      <AlertDialog open={eliminar !== null} onOpenChange={(o) => !o && setEliminar(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {eliminar?.clase === "ruta" ? "¿Eliminar esta ruta guardada?" : "¿Eliminar este reporte?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {eliminar?.clase === "ruta" ? "Podrás volver a planearla cuando quieras." : "Desaparecerá del mapa para todos. No podrás deshacerlo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel asChild>
              <Boton variante="contorno">Cancelar</Boton>
            </AlertDialogCancel>
            <Boton
              variante="peligro"
              onClick={() => {
                if (eliminar?.clase === "ruta") {
                  acciones.eliminarRutaGuardada(eliminar.id);
                  toast.success("Ruta eliminada");
                } else if (eliminar) {
                  acciones.eliminarReporte(eliminar.id);
                  toast.success("Reporte eliminado");
                }
                setEliminar(null);
              }}
            >
              <Trash2 aria-hidden /> Sí, eliminar
            </Boton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditarReporte({ reporte, onCerrar }: { reporte: Reporte | null; onCerrar: () => void }) {
  return (
    <Dialog open={reporte !== null} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        {reporte && <FormularioEdicion key={reporte.id} reporte={reporte} onCerrar={onCerrar} />}
      </DialogContent>
    </Dialog>
  );
}

function FormularioEdicion({ reporte, onCerrar }: { reporte: Reporte; onCerrar: () => void }) {
  const [tipo, setTipo] = useState<TipoNovedad>(reporte.tipo);
  const [descripcion, setDescripcion] = useState(reporte.descripcion);
  const [resuelto, setResuelto] = useState(reporte.resuelto);
  const [error, setError] = useState<string | undefined>();

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const err = validarDescripcion(descripcion);
        setError(err);
        if (err) return;
        acciones.editarReporte(reporte.id, { tipo, descripcion: descripcion.trim(), resuelto });
        toast.success("Cambios guardados");
        onCerrar();
      }}
    >
      <DialogHeader className="text-left">
        <DialogTitle className="font-display text-2xl">Editar reporte</DialogTitle>
        <DialogDescription className="text-base">Corrige el tipo o la descripción, o márcalo como resuelto.</DialogDescription>
      </DialogHeader>
      <CampoSelect id="editar-tipo" etiqueta="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoNovedad)}>
        {ORDEN_TIPOS.map((t) => (
          <option key={t} value={t}>
            {TIPOS[t].etiqueta}
          </option>
        ))}
      </CampoSelect>
      <CampoArea
        id="editar-descripcion"
        etiqueta="Descripción"
        value={descripcion}
        maxLength={MAX_DESCRIPCION}
        onChange={(e) => setDescripcion(e.target.value)}
        error={error}
        contador={<span className="tabular-nums text-muted-foreground">{descripcion.length}/{MAX_DESCRIPCION}</span>}
      />
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted p-4">
        <label htmlFor="editar-resuelto" className="flex-1">
          <span className="block font-bold">Marcar como resuelto</span>
          <span className="block text-muted-foreground">Dejará de contar en el mapa y las rutas.</span>
        </label>
        <Switch id="editar-resuelto" checked={resuelto} onCheckedChange={setResuelto} />
      </div>
      <div className="flex gap-3">
        <Boton type="button" variante="contorno" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton type="submit" className="flex-1">
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
