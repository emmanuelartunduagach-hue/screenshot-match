import { aMetros, desdeMetros, distanciaPuntoRuta } from "./geo";
import { MAX_EXTRA_ALTERNA, armarRuta, decidirPlan, type PlanRutas } from "./rutas";
import type { Coordenada, Reporte } from "./tipos";

/**
 * Rutas reales a pie por las calles de OpenStreetMap. Se usa el servidor público de
 * OSRM (perfil peatonal de routing.openstreetmap.de) y, si no responde o limita las
 * consultas, el de Valhalla (valhalla1.openstreetmap.de). Ambos los mantiene FOSSGIS.
 */
export const URL_OSRM = "https://routing.openstreetmap.de/routed-foot/route/v1/driving/";
export const URL_VALHALLA = "https://valhalla1.openstreetmap.de/route";
/** Tras un fallo de OSRM, se usa directamente Valhalla durante este tiempo. */
const PAUSA_OSRM_MS = 5 * 60 * 1000;

/** Desvíos que se prueban para forzar caminos distintos (fracción de la distancia directa). */
const DESVIOS = [0.2, -0.2, 0.35, -0.35];
/** Dos trazos se consideran "el mismo camino" si comparten este porcentaje de puntos. */
const MAX_PARECIDO = 0.8;
/** Distancia (m) para decir que un punto de un trazo está sobre el otro. */
const TOLERANCIA_M = 30;

export interface TrazoCalles {
  puntos: Coordenada[];
  /** Longitud real por calles, en metros */
  metros: number;
}

interface RespuestaOsrm {
  code: string;
  routes?: { distance: number; geometry: { coordinates: [number, number][] } }[];
}

async function pedirOsrm(
  paradas: Coordenada[],
  alternativas: boolean,
  signal?: AbortSignal,
): Promise<TrazoCalles[]> {
  const coords = paradas.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  const url = `${URL_OSRM}${coords}?overview=full&geometries=geojson&alternatives=${alternativas ? 3 : "false"}`;
  const res = await fetch(url, { signal: signal ?? null });
  if (!res.ok) throw new Error(`OSRM respondió ${res.status}`);
  const datos = (await res.json()) as RespuestaOsrm;
  if (datos.code !== "Ok" || !datos.routes?.length) throw new Error(`OSRM: ${datos.code}`);
  return datos.routes.map((r) => ({
    metros: r.distance,
    puntos: r.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
  }));
}

interface RespuestaValhalla {
  trip?: { summary: { length: number }; legs: { shape: string }[] };
  alternates?: { trip: { summary: { length: number }; legs: { shape: string }[] } }[];
}

/** Decodifica una polilínea codificada de Google con 6 decimales (formato de Valhalla). */
export function decodificarPolilinea(texto: string, precision = 6): Coordenada[] {
  const factor = 10 ** precision;
  const puntos: Coordenada[] = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  const leer = () => {
    let resultado = 0;
    let desplazamiento = 0;
    let byte: number;
    do {
      byte = texto.charCodeAt(i++) - 63;
      resultado |= (byte & 0x1f) << desplazamiento;
      desplazamiento += 5;
    } while (byte >= 0x20);
    return resultado & 1 ? ~(resultado >> 1) : resultado >> 1;
  };
  while (i < texto.length) {
    lat += leer();
    lng += leer();
    puntos.push({ lat: lat / factor, lng: lng / factor });
  }
  return puntos;
}

async function pedirValhalla(
  paradas: Coordenada[],
  alternativas: boolean,
  signal?: AbortSignal,
): Promise<TrazoCalles[]> {
  const consulta = {
    locations: paradas.map((p, i) => ({
      lat: p.lat,
      lon: p.lng,
      type: i === 0 || i === paradas.length - 1 ? "break" : "through",
    })),
    costing: "pedestrian",
    units: "kilometers",
    ...(alternativas && paradas.length === 2 ? { alternates: 2 } : {}),
  };
  const res = await fetch(`${URL_VALHALLA}?json=${encodeURIComponent(JSON.stringify(consulta))}`, {
    signal: signal ?? null,
  });
  if (!res.ok) throw new Error(`Valhalla respondió ${res.status}`);
  const datos = (await res.json()) as RespuestaValhalla;
  if (!datos.trip) throw new Error("Valhalla: sin ruta");
  return [datos.trip, ...(datos.alternates ?? []).map((a) => a.trip)].map((trip) => ({
    metros: trip.summary.length * 1000,
    puntos: trip.legs.flatMap((l) => decodificarPolilinea(l.shape)),
  }));
}

let osrmPausadoHasta = 0;

/** Pide la ruta a OSRM y, si falla, a Valhalla. */
async function pedirRutas(
  paradas: Coordenada[],
  alternativas: boolean,
  signal?: AbortSignal,
): Promise<TrazoCalles[]> {
  if (Date.now() >= osrmPausadoHasta) {
    try {
      return await pedirOsrm(paradas, alternativas, signal);
    } catch (e) {
      if (signal?.aborted) throw e;
      osrmPausadoHasta = Date.now() + PAUSA_OSRM_MS;
    }
  }
  return pedirValhalla(paradas, alternativas, signal);
}

/** Punto a mitad de camino, desplazado hacia un lado del trayecto directo. */
export function puntoDesvio(o: Coordenada, d: Coordenada, factor: number): Coordenada {
  const B = aMetros(d, o);
  const largo = Math.hypot(B.x, B.y);
  return desdeMetros(
    B.x / 2 - (B.y / largo) * factor * largo,
    B.y / 2 + (B.x / largo) * factor * largo,
    o,
  );
}

/** Fracción de puntos de `a` que quedan encima de `b`. */
export function parecido(a: TrazoCalles, b: TrazoCalles): number {
  if (a.puntos.length === 0) return 1;
  const encima = a.puntos.filter((p) => distanciaPuntoRuta(p, b.puntos) < TOLERANCIA_M).length;
  return encima / a.puntos.length;
}

const cache = new Map<string, TrazoCalles[]>();

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Los servidores públicos limitan las ráfagas: si fallan, espera y reintenta una vez. */
async function pedirConReintento(
  paradas: Coordenada[],
  alternativas: boolean,
  signal?: AbortSignal,
): Promise<TrazoCalles[]> {
  try {
    return await pedirRutas(paradas, alternativas, signal);
  } catch (e) {
    if (signal?.aborted) throw e;
    await esperar(1200);
    return pedirRutas(paradas, alternativas, signal);
  }
}

function hayAlternaDistinta(trazos: TrazoCalles[]): boolean {
  const [corta, ...resto] = [...trazos].sort((a, b) => a.metros - b.metros);
  return resto.some(
    (t) =>
      t.metros <= corta!.metros * (1 + MAX_EXTRA_ALTERNA) && parecido(t, corta!) < MAX_PARECIDO,
  );
}

/**
 * Pide a OSRM la ruta con sus alternativas. Si ninguna es un camino realmente
 * distinto, prueba (de a una, para no saturar el servidor) rutas que pasan por un
 * punto desviado a cada lado del trayecto.
 */
export async function obtenerTrazosCalles(
  o: Coordenada,
  d: Coordenada,
  signal?: AbortSignal,
): Promise<TrazoCalles[]> {
  const clave = `${o.lat},${o.lng};${d.lat},${d.lng}`;
  const guardado = cache.get(clave);
  if (guardado) return guardado;

  const unicos: TrazoCalles[] = [];
  const agregar = (nuevos: TrazoCalles[]) => {
    for (const t of nuevos) {
      if (!unicos.some((u) => parecido(t, u) > 0.97 && parecido(u, t) > 0.97)) unicos.push(t);
    }
  };

  agregar(await pedirConReintento([o, d], true, signal));
  for (const f of DESVIOS) {
    if (hayAlternaDistinta(unicos)) break;
    try {
      await esperar(400);
      agregar(await pedirRutas([o, puntoDesvio(o, d, f), d], false, signal));
    } catch {
      if (signal?.aborted) throw new DOMException("Cancelado", "AbortError");
    }
  }
  cache.set(clave, unicos);
  return unicos;
}

/**
 * Arma el plan con trazos reales: la más corta es la "rápida" y, entre las demás que
 * no sean más de 25 % más largas ni casi iguales a la rápida, la de mejor puntaje es la "alterna".
 */
export function planearDesdeTrazos(
  trazos: TrazoCalles[],
  reportes: Reporte[],
  ahora: number,
): PlanRutas {
  if (trazos.length === 0) throw new Error("Sin trazos");
  const ordenados = [...trazos].sort((a, b) => a.metros - b.metros);
  const corta = ordenados[0]!;
  const rapida = armarRuta(
    "rapida",
    "Ruta más rápida",
    corta.puntos,
    reportes,
    ahora,
    corta.metros,
  );

  const candidatas = ordenados
    .slice(1)
    .filter((t) => t.metros <= corta.metros * (1 + MAX_EXTRA_ALTERNA))
    .map((t) => ({ t, parecido: parecido(t, corta) }));
  const distintas = candidatas.filter((c) => c.parecido < MAX_PARECIDO);
  const grupo = distintas.length > 0 ? distintas : candidatas;

  let alterna = null as ReturnType<typeof armarRuta> | null;
  for (const { t } of grupo) {
    const r = armarRuta("alterna", "Ruta alterna", t.puntos, reportes, ahora, t.metros);
    if (!alterna || r.bruto > alterna.bruto + 0.01) alterna = r;
  }
  alterna ??= armarRuta("alterna", "Ruta alterna", corta.puntos, reportes, ahora, corta.metros);
  return decidirPlan(rapida, alterna, "calles");
}
