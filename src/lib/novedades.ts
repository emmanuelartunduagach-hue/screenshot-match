import { Construction, LightbulbOff, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";

import type { Reporte, TipoNovedad } from "./tipos";

export interface MetaTipo {
  id: TipoNovedad;
  etiqueta: string;
  /** Texto para conteos: "2 reportes de hurto" */
  singular: string;
  plural: string;
  descripcionCorta: string;
  icono: LucideIcon;
}

export const TIPOS: Record<TipoNovedad, MetaTipo> = {
  hurto: {
    id: "hurto",
    etiqueta: "Hurto",
    singular: "reporte de hurto",
    plural: "reportes de hurto",
    descripcionCorta: "Robo o intento de robo",
    icono: ShieldAlert,
  },
  iluminacion: {
    id: "iluminacion",
    etiqueta: "Mala iluminación",
    singular: "punto con mala iluminación",
    plural: "puntos con mala iluminación",
    descripcionCorta: "Calle o parque oscuro",
    icono: LightbulbOff,
  },
  obra: {
    id: "obra",
    etiqueta: "Obra o bloqueo",
    singular: "obra o bloqueo",
    plural: "obras o bloqueos",
    descripcionCorta: "Vía cerrada, obra o manifestación",
    icono: Construction,
  },
  segura: {
    id: "segura",
    etiqueta: "Zona segura",
    singular: "zona segura",
    plural: "zonas seguras",
    descripcionCorta: "Vigilancia, luz y movimiento",
    icono: ShieldCheck,
  },
};

export const ORDEN_TIPOS: TipoNovedad[] = ["hurto", "iluminacion", "obra", "segura"];

export function tiempoRelativo(marca: number, ahora: number): string {
  const min = Math.max(0, Math.floor((ahora - marca) / 60000));
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
}

/** Vecinos simulados: cada reporte propio gana 1 confirmación por minuto, hasta 3. */
export function confirmacionesEfectivas(r: Reporte, ahora: number): number {
  if (!r.propio) return r.confirmaciones;
  const simuladas = Math.min(3, Math.max(0, Math.floor((ahora - r.creadoEn) / 60000)));
  return r.confirmaciones + simuladas;
}

export type EstadoReporte = "Publicado" | "Confirmado por vecinos" | "Resuelto";

export function estadoReporte(r: Reporte, ahora: number): EstadoReporte {
  if (r.resuelto) return "Resuelto";
  if (confirmacionesEfectivas(r, ahora) >= 2) return "Confirmado por vecinos";
  return "Publicado";
}

export function contarPor(n: number, tipo: TipoNovedad): string {
  const meta = TIPOS[tipo];
  return `${n} ${n === 1 ? meta.singular : meta.plural}`;
}
