import { distanciaPuntoRuta, longitudRutaMetros } from "./geo";
import type { Coordenada, Reporte, TipoNovedad } from "./tipos";

/** Solo cuentan los reportes a menos de esta distancia del trayecto. */
export const RADIO_METROS = 250;
/** Puntos base por tipo (antes de aplicar el peso por recencia y confirmaciones). */
export const PUNTOS_POR_TIPO: Record<TipoNovedad, number> = {
  hurto: -16,
  iluminacion: -8,
  obra: -5,
  segura: 4,
};
export const PENALIZACION_POR_KM = 0.5;
export const PUNTAJE_BASE = 100;
export const PUNTAJE_MIN = 8;
export const PUNTAJE_MAX = 96;

const HORA = 3600000;

/** Recientes pesan más: < 24 h ×1,25 · hasta 7 días ×1 · más antiguos ×0,75. */
export function factorRecencia(edadMs: number): number {
  if (edadMs < 24 * HORA) return 1.25;
  if (edadMs <= 7 * 24 * HORA) return 1;
  return 0.75;
}

/** Cada confirmación suma 5 % de peso, hasta 10 confirmaciones (×1,5). */
export function factorConfirmaciones(n: number): number {
  return 1 + Math.min(Math.max(n, 0), 10) * 0.05;
}

export function pesoReporte(r: Reporte, ahora: number): number {
  return factorRecencia(ahora - r.creadoEn) * factorConfirmaciones(r.confirmaciones);
}

export function reportesCercanos(ruta: Coordenada[], reportes: Reporte[]): Reporte[] {
  return reportes.filter((r) => !r.resuelto && distanciaPuntoRuta(r, ruta) < RADIO_METROS);
}

export interface ResultadoPuntaje {
  /** Entero entre 8 y 96 */
  puntaje: number;
  /** Valor sin límites ni redondeo */
  bruto: number;
  km: number;
  cercanos: Reporte[];
  conteo: Record<TipoNovedad, number>;
}

export function limitarPuntaje(valor: number): number {
  return Math.min(PUNTAJE_MAX, Math.max(PUNTAJE_MIN, valor));
}

export function calcularPuntaje(
  ruta: Coordenada[],
  reportes: Reporte[],
  ahora: number,
  kmOverride?: number,
): ResultadoPuntaje {
  const cercanos = reportesCercanos(ruta, reportes);
  const km = kmOverride ?? longitudRutaMetros(ruta) / 1000;
  const conteo: Record<TipoNovedad, number> = { hurto: 0, iluminacion: 0, obra: 0, segura: 0 };
  let bruto = PUNTAJE_BASE;
  for (const r of cercanos) {
    conteo[r.tipo] += 1;
    bruto += PUNTOS_POR_TIPO[r.tipo] * pesoReporte(r, ahora);
  }
  bruto -= PENALIZACION_POR_KM * km;
  return { puntaje: Math.round(limitarPuntaje(bruto)), bruto, km, cercanos, conteo };
}

export type NivelSeguridad = "alta" | "media" | "baja";

export function nivelSeguridad(puntaje: number): NivelSeguridad {
  if (puntaje >= 70) return "alta";
  if (puntaje >= 45) return "media";
  return "baja";
}
