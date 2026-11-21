import { Check, CheckCheck, Clock, MapPin, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { confirmacionesEfectivas, tiempoRelativo } from "@/lib/novedades";
import { acciones } from "@/lib/store";
import type { Reporte } from "@/lib/tipos";

import { Boton } from "./Boton";
import { EtiquetaTipo, IconoTipo } from "./Etiqueta";

export function DetalleNovedad({
  reporte,
  ahora,
  yaConfirmado,
  onCerrar,
}: {
  reporte: Reporte | null;
  ahora: number;
  yaConfirmado: boolean;
  onCerrar: () => void;
}) {
  return (
    <Dialog open={reporte !== null} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="max-w-md gap-5 rounded-3xl p-6">
        {reporte && (
          <>
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-3 pr-10">
                <IconoTipo tipo={reporte.tipo} className="size-12" />
                <EtiquetaTipo tipo={reporte.tipo} />
              </div>
              <DialogTitle className="font-display text-2xl leading-tight">{reporte.barrio}</DialogTitle>
              <DialogDescription className="text-base text-foreground">{reporte.descripcion}</DialogDescription>
            </DialogHeader>

            <dl className="grid gap-2.5 rounded-2xl bg-muted p-4">
              <Fila icono={Clock} etiqueta="Cuándo" valor={tiempoRelativo(reporte.creadoEn, ahora)} />
              <Fila icono={UserRound} etiqueta="Reportó" valor={reporte.autor ?? "Anónimo"} />
              <Fila
                icono={CheckCheck}
                etiqueta="Confirmaciones"
                valor={`${confirmacionesEfectivas(reporte, ahora)} ${confirmacionesEfectivas(reporte, ahora) === 1 ? "vecino" : "vecinos"}`}
              />
              <Fila icono={MapPin} etiqueta="Barrio" valor={reporte.barrio} />
            </dl>

            {reporte.propio ? (
              <Boton variante="secundario" bloque disabled>
                Es tu reporte
              </Boton>
            ) : yaConfirmado ? (
              <Boton variante="secundario" bloque disabled>
                <Check aria-hidden /> Ya confirmaste
              </Boton>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">¿Tú también lo viste? Confirma para que tus vecinos sepan que es real.</p>
                <Boton
                  bloque
                  onClick={() => {
                    acciones.confirmarReporte(reporte.id);
                    toast.success("Gracias por confirmar");
                  }}
                >
                  <CheckCheck aria-hidden /> Confirmar
                </Boton>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Fila({ icono: Icono, etiqueta, valor }: { icono: typeof Clock; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icono className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <dt className="w-36 text-muted-foreground">{etiqueta}</dt>
      <dd className="font-semibold">{valor}</dd>
    </div>
  );
}
