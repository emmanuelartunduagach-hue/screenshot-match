import { aMetros, desdeMetros, distanciaPuntoSegmento, longitudRutaMetros } from "./geo";
import { contarPor } from "./novedades";
import { calcularPuntaje, type ResultadoPuntaje } from "./seguridad";
import type { Coordenada, Reporte } from "./tipos";

/** Las calles no son líneas rectas: la distancia real se estima un 30 % mayor. */
export const FACTOR_CALLES = 1.3;
/** Velocidad a pie */
export const VELOCIDAD_KMH = 4.8;
/** La ruta alterna puede ser como máximo 25 % más larga que la rápida. */
export const MAX_EXTRA_ALTERNA = 0.25;
/** La curva no se separa del corredor más de esta fracción de la distancia directa. */
export const MAX_DESVIO_CORREDOR = 0.3;
export const DIFERENCIA_SIMILAR = 10;
export const MENSAJE_SIMILAR = "Las dos rutas tienen un nivel de seguridad similar";

const PUNTOS_TRAZO = 48;

export interface RutaSimulada extends ResultadoPuntaje {
  id: "rapida" | "alterna";
  nombre: string;
  puntos: Coordenada[];
  distanciaKm: number;
  minutos: number;
}

export interface PlanRutas {
  rapida: RutaSimulada;
  alterna: RutaSimulada;
  recomendada: "rapida" | "alterna" | null;
  explicacion: string;
}

export function trazoRecto(o: Coordenada, d: Coordenada, n = PUNTOS_TRAZO): Coordenada[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return { lat: o.lat + (d.lat - o.lat) * t, lng: o.lng + (d.lng - o.lng) * t };
  });
}

/**
 * Curva suave (Bézier cuadrática) con el punto de control desplazado
 * perpendicularmente al corredor. `factor` es relativo a la distancia directa y su
 * signo elige el lado.
 */
export function curvaAlterna(o: Coordenada, d: Coordenada, factor: number, n = PUNTOS_TRAZO): Coordenada[] {
  const B = aMetros(d, o);
  const largo = Math.hypot(B.x, B.y);
  if (largo === 0) return [o, d];
  const nx = -B.y / largo;
  const ny = B.x / largo;
  const cx = B.x / 2 + nx * factor * largo;
  const cy = B.y / 2 + ny * factor * largo;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    const x = 2 * u * t * cx + t * t * B.x;
    const y = 2 * u * t * cy + t * t * B.y;
    return desdeMetros(x, y, o);
  });
}

export function desvioMaximo(ruta: Coordenada[], o: Coordenada, d: Coordenada): number {
  return Math.max(...ruta.map((p) => distanciaPuntoSegmento(p, o, d)));
}

const FACTORES_CANDIDATOS = [0.2, -0.2, 0.32, -0.32, 0.45, -0.45, 0.58, -0.58];

function armarRuta(
  id: RutaSimulada["id"],
  nombre: string,
  puntos: Coordenada[],
  reportes: Reporte[],
  ahora: number,
): RutaSimulada {
  const distanciaKm = (longitudRutaMetros(puntos) * FACTOR_CALLES) / 1000;
  const minutos = Math.max(1, Math.round((distanciaKm / VELOCIDAD_KMH) * 60));
  const puntaje = calcularPuntaje(puntos, reportes, ahora, distanciaKm);
  return { id, nombre, puntos, distanciaKm, minutos, ...puntaje };
}

export function planearRutas(o: Coordenada, d: Coordenada, reportes: Reporte[], ahora: number): PlanRutas {
  const rapida = armarRuta("rapida", "Ruta más rápida", trazoRecto(o, d), reportes, ahora);
  const directa = longitudRutaMetros(rapida.puntos);

  let alterna: RutaSimulada | null = null;
  for (const f of FACTORES_CANDIDATOS) {
    const puntos = curvaAlterna(o, d, f);
    if (longitudRutaMetros(puntos) > directa * (1 + MAX_EXTRA_ALTERNA)) continue;
    if (desvioMaximo(puntos, o, d) > directa * MAX_DESVIO_CORREDOR) continue;
    const candidata = armarRuta("alterna", "Ruta alterna", puntos, reportes, ahora);
    if (!alterna || candidata.bruto > alterna.bruto + 0.01) alterna = candidata;
  }
  alterna ??= armarRuta("alterna", "Ruta alterna", curvaAlterna(o, d, 0.2), reportes, ahora);

  const diferencia = alterna.puntaje - rapida.puntaje;
  if (Math.abs(diferencia) < DIFERENCIA_SIMILAR) {
    return { rapida, alterna, recomendada: null, explicacion: MENSAJE_SIMILAR };
  }
  const recomendada = diferencia > 0 ? "alterna" : "rapida";
  const [rec, otra] = recomendada === "alterna" ? [alterna, rapida] : [rapida, alterna];
  return { rapida, alterna, recomendada, explicacion: explicarRecomendacion(rec, otra) };
}

function unir(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

export function explicarRecomendacion(
  rec: Pick<RutaSimulada, "conteo" | "minutos">,
  otra: Pick<RutaSimulada, "conteo" | "minutos">,
): string {
  const evita: string[] = [];
  for (const t of ["hurto", "iluminacion", "obra"] as const) {
    const n = otra.conteo[t] - rec.conteo[t];
    if (n > 0) evita.push(contarPor(n, t));
  }
  const seguras = rec.conteo.segura - otra.conteo.segura;
  let frase = evita.length > 0 ? `Evita ${unir(evita)}` : "Tiene reportes cercanos menos graves";
  if (seguras > 0) frase += `${evita.length > 1 ? "," : " y"} pasa por ${contarPor(seguras, "segura")}`;
  const extra = rec.minutos - otra.minutos;
  if (extra > 0) frase += `, a cambio de ${extra} min más`;
  else if (extra < 0) frase += `, y además es ${-extra} min más rápida`;
  else frase += ", sin tiempo extra";
  return `${frase}.`;
}

/** Novedades (no zonas seguras) cerca de `otra` que `elegida` no tiene cerca. */
export function novedadesEvitadas(elegida: RutaSimulada, otra: RutaSimulada): Reporte[] {
  const ids = new Set(elegida.cercanos.map((r) => r.id));
  return otra.cercanos.filter((r) => r.tipo !== "segura" && !ids.has(r.id));
}
