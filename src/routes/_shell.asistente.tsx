import { createFileRoute } from "@tanstack/react-router";
import { Bot, RotateCcw, SendHorizonal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Boton } from "@/components/rs/Boton";
import { claseControl } from "@/components/rs/Campo";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { TextoFormateado } from "@/components/rs/TextoFormateado";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BIENVENIDA_ASISTENTE,
  MENSAJE_ERROR_CHAT,
  SUGERENCIAS,
  guardarChat,
  leerChat,
  pedirRespuesta,
  type MensajeChat,
} from "@/lib/chat";
import { metaPantalla } from "@/lib/meta";
import { nuevoId } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/asistente")({
  head: () => metaPantalla("Asistente", "Resuelve tus dudas sobre cómo usar RutaSegura: reportar, el mapa y las rutas seguras."),
  component: Asistente,
});

function Asistente() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [cargado, setCargado] = useState(false);
  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const [transmitiendo, setTransmitiendo] = useState<string | null>(null);
  const [confirmarLimpiar, setConfirmarLimpiar] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const entradaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMensajes(leerChat());
    setCargado(true);
  }, []);
  useEffect(() => {
    if (cargado) guardarChat(mensajes);
  }, [mensajes, cargado]);
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, transmitiendo, esperando]);

  const ocupado = esperando || transmitiendo !== null;

  const enviar = async (contenido: string, base?: MensajeChat[]) => {
    const t = contenido.trim();
    if (!t || ocupado) return;
    const historial = [...(base ?? mensajes).filter((m) => !m.error), { id: nuevoId(), rol: "usuario" as const, texto: t }];
    setMensajes(historial);
    setTexto("");
    setEsperando(true);
    try {
      const respuesta = await pedirRespuesta(historial, (parcial) => {
        setEsperando(false);
        setTransmitiendo(parcial);
      });
      setMensajes((m) => [...m, { id: nuevoId(), rol: "asistente", texto: respuesta }]);
    } catch {
      setMensajes((m) => [...m, { id: nuevoId(), rol: "asistente", texto: MENSAJE_ERROR_CHAT, error: true }]);
    } finally {
      setEsperando(false);
      setTransmitiendo(null);
      entradaRef.current?.focus();
    }
  };

  const reintentar = () => {
    const sinError = mensajes.filter((m) => !m.error);
    const ultimo = sinError[sinError.length - 1];
    if (ultimo?.rol === "usuario") void enviar(ultimo.texto, sinError.slice(0, -1));
  };

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    void enviar(texto);
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <EncabezadoPantalla
        titulo="Asistente"
        subtitulo="Dudas sobre cómo usar RutaSegura"
        acciones={
          <Boton variante="contorno" tamano="sm" onClick={() => setConfirmarLimpiar(true)} disabled={mensajes.length === 0 || ocupado}>
            <Trash2 aria-hidden /> Limpiar
          </Boton>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6" aria-live="polite" aria-busy={ocupado}>
        <ol className="space-y-3 pb-4">
          <Burbuja rol="asistente" texto={BIENVENIDA_ASISTENTE} />
          {mensajes.map((m) => (
            <Burbuja key={m.id} rol={m.rol} texto={m.texto} error={m.error ?? false} onReintentar={m.error ? reintentar : undefined} />
          ))}
          {transmitiendo !== null && <Burbuja rol="asistente" texto={transmitiendo} />}
          {esperando && (
            <li className="flex items-end gap-2">
              <AvatarBot />
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-card px-4 py-3 text-muted-foreground shadow-suave" role="status">
                <span className="flex gap-1" aria-hidden>
                  <span className="size-2 animate-pulso rounded-full bg-primary" />
                  <span className="size-2 animate-pulso rounded-full bg-primary [animation-delay:150ms]" />
                  <span className="size-2 animate-pulso rounded-full bg-primary [animation-delay:300ms]" />
                </span>
                Escribiendo...
              </div>
            </li>
          )}
        </ol>
        <div ref={finRef} />
      </div>

      <div className="border-t border-border bg-background px-4 pb-3 pt-3 sm:px-6">
        <div className="sin-barra -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6" role="group" aria-label="Preguntas sugeridas">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={ocupado}
              onClick={() => void enviar(s)}
              className="h-11 shrink-0 rounded-full border-2 border-primary/20 bg-card px-4 font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft disabled:opacity-55"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={alEnviar} className="flex gap-2">
          <label htmlFor="chat-entrada" className="sr-only">
            Escribe tu pregunta
          </label>
          <input
            id="chat-entrada"
            ref={entradaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu pregunta…"
            maxLength={500}
            autoComplete="off"
            className={cn(claseControl, "h-12 flex-1")}
          />
          <Boton type="submit" tamano="icono" className="size-12" aria-label="Enviar" disabled={!texto.trim() || ocupado}>
            <SendHorizonal />
          </Boton>
        </form>
      </div>

      <AlertDialog open={confirmarLimpiar} onOpenChange={setConfirmarLimpiar}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Borrar la conversación?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">Se eliminarán todos los mensajes de este chat.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel asChild>
              <Boton variante="contorno">Cancelar</Boton>
            </AlertDialogCancel>
            <Boton
              variante="peligro"
              onClick={() => {
                setMensajes([]);
                setConfirmarLimpiar(false);
                toast.success("Conversación borrada");
              }}
            >
              Sí, borrar
            </Boton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AvatarBot() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden>
      <Bot className="size-5" />
    </span>
  );
}

function Burbuja({
  rol,
  texto,
  error = false,
  onReintentar,
}: {
  rol: MensajeChat["rol"];
  texto: string;
  error?: boolean;
  onReintentar?: (() => void) | undefined;
}) {
  if (rol === "usuario") {
    return (
      <li className="flex animate-aparecer justify-end">
        <span className="sr-only">Tú:</span>
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">{texto}</div>
      </li>
    );
  }
  return (
    <li className="flex animate-aparecer items-end gap-2">
      <AvatarBot />
      <span className="sr-only">Asistente:</span>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 shadow-suave",
          error ? "border border-hurto/30 bg-hurto-soft text-hurto-fg" : "bg-card text-card-foreground",
        )}
      >
        <TextoFormateado texto={texto} />
        {error && onReintentar && (
          <Boton variante="fantasma" tamano="sm" className="-ml-2 mt-1 text-hurto-fg hover:bg-card" onClick={onReintentar}>
            <RotateCcw aria-hidden /> Reintentar
          </Boton>
        )}
      </div>
    </li>
  );
}
