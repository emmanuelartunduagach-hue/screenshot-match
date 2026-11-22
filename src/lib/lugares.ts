import { distanciaMetros } from "./geo";
import type { Coordenada, Lugar } from "./tipos";

export const LUGARES: Lugar[] = [
  { id: "parque-santander", nombre: "Parque Santander", corto: "Parque Santander", barrio: "Centro", lat: 2.92632, lng: -75.28914 },
  { id: "terminal", nombre: "Terminal de Transportes", corto: "Terminal", barrio: "Andalucía", lat: 2.91683, lng: -75.28251 },
  { id: "malecon", nombre: "Malecón del río Magdalena", corto: "Malecón", barrio: "Centro", lat: 2.92504, lng: -75.29359 },
  { id: "usco", nombre: "Universidad Surcolombiana", corto: "Universidad Surcolombiana", barrio: "Los Andaquíes", lat: 2.943, lng: -75.3017 },
  { id: "estadio", nombre: "Estadio Guillermo Plazas Alcid", corto: "Estadio", barrio: "La Libertad", lat: 2.936, lng: -75.28028 },
  { id: "hospital", nombre: "Hospital Universitario Hernando Moncaleano Perdomo", corto: "Hospital Universitario", barrio: "Altico", lat: 2.93258, lng: -75.28103 },
];

export function lugarPorId(id: string): Lugar | undefined {
  return LUGARES.find((l) => l.id === id);
}

export const CENTRO_NEIVA: Coordenada = { lat: 2.9318, lng: -75.2885 };
export const ZOOM_INICIAL = 14;

/** Zona válida para reportar (perímetro urbano aproximado de Neiva). */
export const LIMITES_NEIVA = { sur: 2.892, oeste: -75.318, norte: 2.982, este: -75.243 };
/** Límite de desplazamiento del mapa (algo más amplio que la zona válida). */
export const LIMITES_MAPA = { sur: 2.872, oeste: -75.338, norte: 3.0, este: -75.222 };

export function dentroDeNeiva(c: Coordenada): boolean {
  return (
    c.lat >= LIMITES_NEIVA.sur &&
    c.lat <= LIMITES_NEIVA.norte &&
    c.lng >= LIMITES_NEIVA.oeste &&
    c.lng <= LIMITES_NEIVA.este
  );
}

/** Barrios reales de Neiva con un punto de referencia aproximado. */
export const BARRIOS: { nombre: string; lat: number; lng: number }[] = [
  { nombre: "Centro", lat: 2.9268, lng: -75.2885 },
  { nombre: "Los Mártires", lat: 2.9299, lng: -75.2934 },
  { nombre: "Diego de Ospina", lat: 2.9226, lng: -75.2813 },
  { nombre: "Andalucía", lat: 2.9175, lng: -75.2835 },
  { nombre: "Altico", lat: 2.9274, lng: -75.28 },
  { nombre: "Chapinero", lat: 2.9344, lng: -75.2841 },
  { nombre: "Campo Núñez", lat: 2.9365, lng: -75.2861 },
  { nombre: "Quirinal", lat: 2.9356, lng: -75.2902 },
  { nombre: "Sevilla", lat: 2.9384, lng: -75.2914 },
  { nombre: "Tenerife", lat: 2.941, lng: -75.2835 },
  { nombre: "Los Cámbulos", lat: 2.9436, lng: -75.2881 },
  { nombre: "Las Granjas", lat: 2.9463, lng: -75.2912 },
  { nombre: "Cándido Leguízamo", lat: 2.948, lng: -75.2969 },
  { nombre: "Santa Inés", lat: 2.9476, lng: -75.3003 },
  { nombre: "Los Andaquíes", lat: 2.9425, lng: -75.3035 },
  { nombre: "La Libertad", lat: 2.9365, lng: -75.2785 },
  { nombre: "La Gaitana", lat: 2.9306, lng: -75.2725 },
  { nombre: "Prado Alto", lat: 2.9301, lng: -75.2687 },
  { nombre: "El Jardín", lat: 2.9413, lng: -75.2689 },
  { nombre: "Ipanema", lat: 2.932, lng: -75.2573 },
  { nombre: "Las Palmas", lat: 2.9474, lng: -75.2543 },
];

export function barrioMasCercano(c: Coordenada): string {
  let mejor = BARRIOS[0]!;
  let min = Infinity;
  for (const b of BARRIOS) {
    const d = distanciaMetros(c, b);
    if (d < min) {
      min = d;
      mejor = b;
    }
  }
  return mejor.nombre;
}
