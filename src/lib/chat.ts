export interface MensajeChat {
  id: string;
  rol: "usuario" | "asistente";
  texto: string;
  error?: boolean;
}

const CLAVE = "rutasegura:chat:v1";

export const BIENVENIDA_ASISTENTE =
  "Hola, soy el asistente de RutaSegura. Puedo ayudarte a usar la app: reportar novedades, entender el mapa y elegir rutas seguras.";

export const MENSAJE_ERROR_CHAT = "No pude responder ahora, intenta de nuevo";

export const SUGERENCIAS = [
  "¿Cómo reporto una novedad?",
  "¿Qué significan los colores del mapa?",
  "¿Cómo se calcula el puntaje de seguridad?",
  "¿Cómo encuentro la ruta más segura?",
  "¿Qué hago en una emergencia?",
];

export function leerChat(): MensajeChat[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const v = crudo ? (JSON.parse(crudo) as unknown) : [];
    return Array.isArray(v) ? (v as MensajeChat[]) : [];
  } catch {
    return [];
  }
}

export function guardarChat(m: MensajeChat[]) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(m.filter((x) => !x.error)));
  } catch {
    // sin almacenamiento disponible
  }
}

/** Envía la conversación y entrega el texto a medida que llega. */
export async function pedirRespuesta(
  historial: MensajeChat[],
  alRecibir: (parcial: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/asistente", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mensajes: historial.filter((m) => !m.error && m.texto.trim()).slice(-20).map((m) => ({ rol: m.rol, texto: m.texto.slice(0, 2000) })),
    }),
    ...(signal ? { signal } : {}),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const lector = res.body.getReader();
  const decodificador = new TextDecoder();
  let texto = "";
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    texto += decodificador.decode(value, { stream: true });
    alRecibir(texto);
  }
  texto += decodificador.decode();
  if (!texto.trim()) throw new Error("Respuesta vacía");
  return texto;
}
