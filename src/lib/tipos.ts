export type TipoNovedad = "hurto" | "iluminacion" | "obra" | "segura";

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Reporte {
  id: string;
  tipo: TipoNovedad;
  descripcion: string;
  lat: number;
  lng: number;
  barrio: string;
  /** Marca de tiempo (ms) */
  creadoEn: number;
  /** null = Anónimo */
  autor: string | null;
  confirmaciones: number;
  /** Lo creó la persona que usa la app */
  propio: boolean;
  resuelto: boolean;
}

export interface Lugar {
  id: string;
  nombre: string;
  corto: string;
  barrio: string;
  lat: number;
  lng: number;
}

export interface Sesion {
  nombre: string;
  contacto: string;
  invitado: boolean;
}

export interface Cuenta {
  nombre: string;
  contacto: string;
}

export interface RutaElegida {
  id: string;
  origenId: string;
  destinoId: string;
  nombre: string;
  minutos: number;
  distanciaKm: number;
  puntaje: number;
  explicacion: string;
  /** Novedades que la otra ruta tiene cerca y esta no */
  evitadas: { id: string; tipo: TipoNovedad; barrio: string }[];
  zonasSeguras: number;
  puntos: Coordenada[];
  elegidaEn: number;
}

export interface VistaMapa {
  lat: number;
  lng: number;
  zoom: number;
}

export type FiltroMapa = TipoNovedad | "todos";
