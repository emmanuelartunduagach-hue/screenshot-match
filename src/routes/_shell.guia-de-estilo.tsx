import { createFileRoute } from "@tanstack/react-router";
import { Plus, Route as RouteIcon } from "lucide-react";

import { Aviso } from "@/components/rs/Aviso";
import { PieDemo } from "@/components/rs/Avisos";
import { Boton } from "@/components/rs/Boton";
import { CampoTexto } from "@/components/rs/Campo";
import { EncabezadoPantalla } from "@/components/rs/EncabezadoPantalla";
import { EstadoVacio } from "@/components/rs/EstadoVacio";
import { EtiquetaEstado, EtiquetaTipo, Etiqueta } from "@/components/rs/Etiqueta";
import { MedidorSeguridad } from "@/components/rs/Medidor";
import { Tarjeta } from "@/components/rs/Tarjeta";
import { metaPantalla } from "@/lib/meta";
import { ORDEN_TIPOS } from "@/lib/novedades";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/guia-de-estilo")({
  head: () => metaPantalla("Guía de estilo", "Colores, tipografías, botones, tarjetas, etiquetas, avisos y estados del sistema visual de RutaSegura."),
  component: GuiaEstilo,
});

const COLORES = [
  { nombre: "Azul noche (principal)", clase: "bg-primary", valor: "#0F2A4A", texto: "text-primary-foreground" },
  { nombre: "Azul noche fuerte", clase: "bg-primary-strong", valor: "#0B1D33", texto: "text-primary-foreground" },
  { nombre: "Azul suave", clase: "bg-primary-soft", valor: "#DCE9F6", texto: "text-primary" },
  { nombre: "Fondo", clase: "bg-background border border-border", valor: "#F4F6F9", texto: "text-foreground" },
  { nombre: "Texto secundario", clase: "bg-muted-foreground", valor: "#4A5868", texto: "text-primary-foreground" },
  { nombre: "Borde", clase: "bg-border", valor: "#D3DBE5", texto: "text-foreground" },
];

const SEGURIDAD = [
  { nombre: "Hurto · riesgo alto", clase: "bg-hurto", valor: "#C62828", texto: "text-primary-foreground" },
  { nombre: "Mala iluminación · precaución", clase: "bg-iluminacion", valor: "#F2B705", texto: "text-primary-strong" },
  { nombre: "Obra o bloqueo", clase: "bg-obra", valor: "#E86A10", texto: "text-primary-strong" },
  { nombre: "Zona segura", clase: "bg-segura", valor: "#1F8A4C", texto: "text-primary-foreground" },
];

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-border pb-2 text-2xl font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

function Muestras({ items }: { items: typeof COLORES }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((c) => (
        <li key={c.nombre} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className={cn("flex h-20 items-end p-3 font-bold", c.clase, c.texto)}>Aa</div>
          <div className="p-3">
            <p className="font-semibold">{c.nombre}</p>
            <p className="font-mono text-muted-foreground">{c.valor}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function GuiaEstilo() {
  return (
    <div className="mx-auto max-w-4xl pb-4">
      <EncabezadoPantalla titulo="Guía de estilo" subtitulo="Sistema visual de RutaSegura" />
      <div className="space-y-10 px-4 sm:px-6">
        <Seccion titulo="Colores">
          <Muestras items={COLORES} />
          <h3 className="pt-2 text-lg font-bold">Solo para niveles de seguridad</h3>
          <Muestras items={SEGURIDAD} />
          <p className="text-muted-foreground">
            Ningún estado depende solo del color: siempre va con icono y texto. Contraste mínimo AA.
          </p>
        </Seccion>

        <Seccion titulo="Tipografía">
          <Tarjeta className="space-y-3">
            <p className="font-display text-4xl font-extrabold">Sora 800 · Títulos</p>
            <p className="font-display text-2xl font-bold">Sora 700 · Subtítulos</p>
            <p className="text-lg font-semibold">Manrope 600 · Destacados</p>
            <p>Manrope 400 · Texto de lectura, mínimo 16 px.</p>
            <p className="text-muted-foreground">Texto secundario en gris azulado.</p>
          </Tarjeta>
        </Seccion>

        <Seccion titulo="Botones">
          <Tarjeta className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Boton>
                <Plus aria-hidden /> Primario
              </Boton>
              <Boton variante="secundario">Secundario</Boton>
              <Boton variante="contorno">Contorno</Boton>
              <Boton variante="fantasma">Fantasma</Boton>
              <Boton variante="peligro">Peligro</Boton>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { estado: "Normal", el: <Boton>Elegir esta ruta</Boton> },
                { estado: "Hover (pasa el cursor)", el: <Boton className="bg-primary-strong shadow-elevada">Elegir esta ruta</Boton> },
                { estado: "Deshabilitado", el: <Boton disabled>Elegir esta ruta</Boton> },
                { estado: "Cargando", el: <Boton cargando>Publicando…</Boton> },
              ].map((x) => (
                <div key={x.estado} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
                  <dt className="font-semibold">{x.estado}</dt>
                  <dd>{x.el}</dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground">Altura mínima de 44 px. Usa Tab para ver el foco visible.</p>
          </Tarjeta>
        </Seccion>

        <Seccion titulo="Campos">
          <Tarjeta className="grid gap-4 sm:grid-cols-2">
            <CampoTexto id="guia-normal" etiqueta="Normal" placeholder="tucorreo@ejemplo.com" />
            <CampoTexto id="guia-error" etiqueta="Con error" defaultValue="correo@" error="Escribe un correo válido" />
            <CampoTexto id="guia-ayuda" etiqueta="Con ayuda" ayuda="Mínimo 6 caracteres" type="password" />
            <CampoTexto id="guia-off" etiqueta="Deshabilitado" disabled defaultValue="No editable" />
          </Tarjeta>
        </Seccion>

        <Seccion titulo="Tarjetas">
          <div className="grid gap-4 sm:grid-cols-3">
            <Tarjeta>
              <p className="font-bold">Normal</p>
              <p className="text-muted-foreground">Contenido general.</p>
            </Tarjeta>
            <Tarjeta variante="interactiva">
              <p className="font-bold">Interactiva</p>
              <p className="text-muted-foreground">Se eleva al pasar el cursor.</p>
            </Tarjeta>
            <Tarjeta variante="resaltada">
              <p className="font-bold">Seleccionada</p>
              <p className="text-muted-foreground">Ruta activa en el mapa.</p>
            </Tarjeta>
          </div>
          <Tarjeta variante="marca" className="flex items-center gap-3">
            <RouteIcon className="size-6" aria-hidden />
            <span className="font-bold">Tarjeta de marca para la acción principal</span>
          </Tarjeta>
          <Tarjeta>
            <MedidorSeguridad puntaje={82} />
            <MedidorSeguridad puntaje={56} className="mt-4" />
            <MedidorSeguridad puntaje={31} className="mt-4" />
          </Tarjeta>
        </Seccion>

        <Seccion titulo="Etiquetas">
          <div className="flex flex-wrap gap-2">
            {ORDEN_TIPOS.map((t) => (
              <EtiquetaTipo key={t} tipo={t} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <EtiquetaEstado estado="Publicado" />
            <EtiquetaEstado estado="Confirmado por vecinos" />
            <EtiquetaEstado estado="Resuelto" />
            <Etiqueta tono="marca">Nuevo</Etiqueta>
          </div>
        </Seccion>

        <Seccion titulo="Avisos">
          <div className="space-y-3">
            <Aviso tono="info" titulo="Información">Las novedades son datos de ejemplo.</Aviso>
            <Aviso tono="exito" titulo="Confirmación">Tu reporte ya está en el mapa.</Aviso>
            <Aviso tono="advertencia" titulo="Precaución">Tramo con mala iluminación después de las 7 p. m.</Aviso>
            <Aviso tono="error" titulo="Error">Elige un punto dentro de Neiva.</Aviso>
          </div>
        </Seccion>

        <Seccion titulo="Estado vacío">
          <Tarjeta>
            <EstadoVacio
              ilustracion="reportes"
              titulo="Aún no tienes reportes"
              texto="Invita a actuar con un botón claro."
              accion={<Boton>Reportar novedad</Boton>}
            />
          </Tarjeta>
        </Seccion>
      </div>
      <PieDemo />
    </div>
  );
}
