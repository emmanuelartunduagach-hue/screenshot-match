import type { Reporte, TipoNovedad } from "./tipos";

interface Semilla {
  tipo: TipoNovedad;
  descripcion: string;
  barrio: string;
  lat: number;
  lng: number;
  minutos: number;
  autor: string | null;
  confirmaciones: number;
}

const H = 60;
const D = 24 * H;

/** 19 reportes: 7 hurtos, 4 de mala iluminación, 4 obras o bloqueos y 4 zonas seguras. */
const SEMILLAS: Semilla[] = [
  // Hurtos
  { tipo: "hurto", descripcion: "Le robaron el celular a una estudiante en la esquina de la carrera 5 con calle 8.", barrio: "Centro", lat: 2.9276, lng: -75.2876, minutos: 20, autor: "Laura M.", confirmaciones: 5 },
  { tipo: "hurto", descripcion: "Dos personas en moto arrancan bolsos cerca del parque.", barrio: "Los Mártires", lat: 2.9304, lng: -75.2922, minutos: 2 * H, autor: null, confirmaciones: 8 },
  { tipo: "hurto", descripcion: "Atracaron a un ciclista en la noche sobre la avenida.", barrio: "Chapinero", lat: 2.9339, lng: -75.2846, minutos: 5 * H, autor: "Andrés P.", confirmaciones: 3 },
  { tipo: "hurto", descripcion: "Raponazo cerca del paradero de buses de la calle 21.", barrio: "Quirinal", lat: 2.9362, lng: -75.2907, minutos: 1 * D + 3 * H, autor: null, confirmaciones: 2 },
  { tipo: "hurto", descripcion: "Atraco a un peatón con arma blanca a las 9 p. m.", barrio: "Diego de Ospina", lat: 2.9222, lng: -75.2819, minutos: 3 * H, autor: "Camila R.", confirmaciones: 6 },
  { tipo: "hurto", descripcion: "Roban maletas a viajeros que salen de la terminal a pie.", barrio: "Andalucía", lat: 2.9186, lng: -75.2838, minutos: 45, autor: null, confirmaciones: 4 },
  { tipo: "hurto", descripcion: "Hurto de bicicleta frente a la tienda del parque.", barrio: "Cándido Leguízamo", lat: 2.9466, lng: -75.2984, minutos: 3 * D, autor: "Jhon F.", confirmaciones: 1 },
  // Mala iluminación
  { tipo: "iluminacion", descripcion: "Lámparas apagadas en el tramo norte del malecón.", barrio: "Los Mártires", lat: 2.9279, lng: -75.2949, minutos: 6 * H, autor: null, confirmaciones: 4 },
  { tipo: "iluminacion", descripcion: "Calle muy oscura, varios postes sin luz.", barrio: "Sevilla", lat: 2.9392, lng: -75.2926, minutos: 1 * D, autor: "Diana C.", confirmaciones: 3 },
  { tipo: "iluminacion", descripcion: "El parque queda sin alumbrado después de las 7 p. m.", barrio: "Tenerife", lat: 2.9406, lng: -75.2829, minutos: 2 * D, autor: null, confirmaciones: 2 },
  { tipo: "iluminacion", descripcion: "Tramo de la Circunvalar sin luz cerca de la universidad.", barrio: "Los Andaquíes", lat: 2.9418, lng: -75.2994, minutos: 10 * H, autor: "Sebastián T.", confirmaciones: 5 },
  // Obras o bloqueos
  { tipo: "obra", descripcion: "Obra en la carrera 15, un carril cerrado y andén estrecho.", barrio: "Altico", lat: 2.9301, lng: -75.2807, minutos: 1 * D + 6 * H, autor: null, confirmaciones: 6 },
  { tipo: "obra", descripcion: "Andén levantado por obras del acueducto.", barrio: "Campo Núñez", lat: 2.9371, lng: -75.2866, minutos: 4 * H, autor: "María J.", confirmaciones: 2 },
  { tipo: "obra", descripcion: "Bloqueo por manifestación sobre la calle 7.", barrio: "Centro", lat: 2.9241, lng: -75.2861, minutos: 30, autor: null, confirmaciones: 3 },
  { tipo: "obra", descripcion: "Puente peatonal en reparación, toca dar la vuelta.", barrio: "Los Cámbulos", lat: 2.9434, lng: -75.2886, minutos: 5 * D, autor: "Óscar L.", confirmaciones: 1 },
  // Zonas seguras
  { tipo: "segura", descripcion: "CAI de policía y comercio abierto hasta tarde.", barrio: "Centro", lat: 2.9258, lng: -75.2899, minutos: 2 * H, autor: "Paula G.", confirmaciones: 9 },
  { tipo: "segura", descripcion: "Zona vigilada con cámaras y buena iluminación.", barrio: "Los Mártires", lat: 2.9246, lng: -75.2928, minutos: 1 * D, autor: null, confirmaciones: 7 },
  { tipo: "segura", descripcion: "Ciclorruta iluminada y con movimiento de gente.", barrio: "Las Granjas", lat: 2.9452, lng: -75.2916, minutos: 8 * H, autor: "Felipe A.", confirmaciones: 4 },
  { tipo: "segura", descripcion: "Vigilancia permanente frente al hospital.", barrio: "Altico", lat: 2.9334, lng: -75.2816, minutos: 12 * H, autor: null, confirmaciones: 5 },
];

export function crearReportesEjemplo(ahora: number): Reporte[] {
  return SEMILLAS.map((s, i) => ({
    id: `ejemplo-${i + 1}`,
    tipo: s.tipo,
    descripcion: s.descripcion,
    barrio: s.barrio,
    lat: s.lat,
    lng: s.lng,
    creadoEn: ahora - s.minutos * 60000,
    autor: s.autor,
    confirmaciones: s.confirmaciones,
    propio: false,
    resuelto: false,
  }));
}
