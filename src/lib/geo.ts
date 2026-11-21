import type { Coordenada } from "./tipos";

const R = 6371000;
const rad = (g: number) => (g * Math.PI) / 180;

export function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Proyección local en metros (suficiente para una ciudad). */
export function aMetros(p: Coordenada, ref: Coordenada): { x: number; y: number } {
  return {
    x: rad(p.lng - ref.lng) * R * Math.cos(rad(ref.lat)),
    y: rad(p.lat - ref.lat) * R,
  };
}

export function desdeMetros(x: number, y: number, ref: Coordenada): Coordenada {
  return {
    lat: ref.lat + (y / R) * (180 / Math.PI),
    lng: ref.lng + (x / (R * Math.cos(rad(ref.lat)))) * (180 / Math.PI),
  };
}

export function distanciaPuntoSegmento(p: Coordenada, a: Coordenada, b: Coordenada): number {
  const P = aMetros(p, a);
  const B = aMetros(b, a);
  const largo2 = B.x * B.x + B.y * B.y;
  if (largo2 === 0) return Math.hypot(P.x, P.y);
  const t = Math.max(0, Math.min(1, (P.x * B.x + P.y * B.y) / largo2));
  return Math.hypot(P.x - t * B.x, P.y - t * B.y);
}

export function distanciaPuntoRuta(p: Coordenada, ruta: Coordenada[]): number {
  if (ruta.length === 0) return Infinity;
  if (ruta.length === 1) return distanciaMetros(p, ruta[0]!);
  let min = Infinity;
  for (let i = 0; i < ruta.length - 1; i++) {
    min = Math.min(min, distanciaPuntoSegmento(p, ruta[i]!, ruta[i + 1]!));
  }
  return min;
}

export function longitudRutaMetros(ruta: Coordenada[]): number {
  let total = 0;
  for (let i = 0; i < ruta.length - 1; i++) total += distanciaMetros(ruta[i]!, ruta[i + 1]!);
  return total;
}
