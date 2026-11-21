import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Esquema = z.object({
  mensajes: z
    .array(
      z.object({
        rol: z.enum(["usuario", "asistente"]),
        texto: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
});

export const Route = createFileRoute("/api/asistente")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let datos: z.infer<typeof Esquema>;
        try {
          datos = Esquema.parse(await request.json());
        } catch {
          return Response.json({ error: "Solicitud no válida" }, { status: 400 });
        }

        const { streamResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
        const { INSTRUCCION_ASISTENTE } = await import("@/lib/asistente-prompt");

        const flujo = await streamResponse(
          {
            model: "openai/gpt-6.1-sol",
            instructions: INSTRUCCION_ASISTENTE,
            input: datos.mensajes.map((m) =>
              m.rol === "usuario"
                ? { role: "user" as const, content: m.texto }
                : { role: "assistant" as const, content: [{ type: "output_text" as const, text: m.texto }] },
            ),
          },
          { signal: request.signal },
        ).catch((e: unknown) => {
          console.error("asistente: fallo al iniciar", e instanceof GatewayError ? e.code : e);
          return null;
        });
        if (!flujo) return Response.json({ error: "No pude responder ahora" }, { status: 502 });

        const codificador = new TextEncoder();
        const cuerpo = new ReadableStream<Uint8Array>({
          async start(controlador) {
            try {
              for await (const evento of flujo) {
                const ev = evento as { type?: string; delta?: unknown };
                if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") {
                  controlador.enqueue(codificador.encode(ev.delta));
                }
              }
              controlador.close();
            } catch (e) {
              console.error("asistente: fallo en el flujo", e instanceof GatewayError ? e.code : e);
              controlador.error(e);
            }
          },
        });

        return new Response(cuerpo, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
