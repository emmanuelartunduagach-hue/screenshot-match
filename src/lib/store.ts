import { useSyncExternalStore } from "react";

import { crearReportesEjemplo } from "./datos-ejemplo";
import type {
  Cuenta,
  FiltroMapa,
  Reporte,
  RutaElegida,
  Sesion,
  TipoNovedad,
  VistaMapa,
} from "./tipos";

/** Estado local de la demo, guardado en localStorage. */
export interface EstadoApp {
  version: 1;
  sesion: Sesion | null;
  cuentas: Cuenta[];
  reportes: Reporte[];
  /** Ids de reportes que esta persona ya confirmó (una vez por persona). */
  confirmados: string[];
  rutasGuardadas: RutaElegida[];
  rutaElegida: RutaElegida | null;
  vistaMapa: VistaMapa | null;
  filtroMapa: FiltroMapa;
  ultimoOrigen: string;
  ultimoDestino: string;
}

const CLAVE = "rutasegura:estado:v1";

function estadoVacio(): EstadoApp {
  return {
    version: 1,
    sesion: null,
    cuentas: [],
    reportes: [],
    confirmados: [],
    rutasGuardadas: [],
    rutaElegida: null,
    vistaMapa: null,
    filtroMapa: "todos",
    ultimoOrigen: "parque-santander",
    ultimoDestino: "usco",
  };
}

const ESTADO_SERVIDOR: EstadoApp = estadoVacio();
let estado: EstadoApp | null = null;
const oyentes = new Set<() => void>();

function cargar(): EstadoApp {
  if (estado) return estado;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const leido = JSON.parse(crudo) as Partial<EstadoApp>;
      if (leido.version === 1) {
        estado = { ...estadoVacio(), ...leido } as EstadoApp;
        return estado;
      }
    }
  } catch {
    // localStorage no disponible o dañado: empezamos de cero.
  }
  estado = { ...estadoVacio(), reportes: crearReportesEjemplo(Date.now()) };
  guardar(estado);
  return estado;
}

function guardar(e: EstadoApp) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(e));
  } catch {
    // Sin espacio o modo privado: la demo sigue en memoria.
  }
}

export function obtenerEstado(): EstadoApp {
  return typeof window === "undefined" ? ESTADO_SERVIDOR : cargar();
}

function actualizar(cambio: (e: EstadoApp) => EstadoApp) {
  estado = cambio(cargar());
  guardar(estado);
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => {
    oyentes.delete(o);
  };
}

/** Lee el estado completo. Deriva listas con useMemo en el componente. */
export function useEstado(): EstadoApp {
  return useSyncExternalStore(suscribir, obtenerEstado, () => ESTADO_SERVIDOR);
}

function nuevoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.round(performance.now())}`;
}

// ----------------------------- Acciones -----------------------------

export const acciones = {
  registrar(cuenta: Cuenta) {
    actualizar((e) => ({
      ...e,
      cuentas: [...e.cuentas.filter((c) => c.contacto !== cuenta.contacto), cuenta],
      sesion: { ...cuenta, invitado: false },
    }));
  },
  buscarCuenta(contacto: string): Cuenta | undefined {
    return cargar().cuentas.find((c) => c.contacto.toLowerCase() === contacto.toLowerCase());
  },
  iniciarSesion(sesion: Sesion) {
    actualizar((e) => ({ ...e, sesion }));
  },
  cerrarSesion() {
    actualizar((e) => ({ ...e, sesion: null }));
  },
  crearReporte(datos: Pick<Reporte, "tipo" | "descripcion" | "lat" | "lng" | "barrio" | "autor">): Reporte {
    const reporte: Reporte = {
      ...datos,
      id: nuevoId(),
      creadoEn: Date.now(),
      confirmaciones: 0,
      propio: true,
      resuelto: false,
    };
    actualizar((e) => ({
      ...e,
      reportes: [reporte, ...e.reportes],
      vistaMapa: { lat: reporte.lat, lng: reporte.lng, zoom: 16 },
      filtroMapa: "todos",
    }));
    return reporte;
  },
  editarReporte(id: string, cambios: Partial<Pick<Reporte, "tipo" | "descripcion" | "resuelto">>) {
    actualizar((e) => ({
      ...e,
      reportes: e.reportes.map((r) => (r.id === id && r.propio ? { ...r, ...cambios } : r)),
    }));
  },
  eliminarReporte(id: string) {
    actualizar((e) => ({ ...e, reportes: e.reportes.filter((r) => !(r.id === id && r.propio)) }));
  },
  confirmarReporte(id: string) {
    actualizar((e) => {
      if (e.confirmados.includes(id)) return e;
      return {
        ...e,
        confirmados: [...e.confirmados, id],
        reportes: e.reportes.map((r) =>
          r.id === id ? { ...r, confirmaciones: r.confirmaciones + 1 } : r,
        ),
      };
    });
  },
  elegirRuta(ruta: RutaElegida) {
    actualizar((e) => ({ ...e, rutaElegida: ruta }));
  },
  guardarRuta(ruta: RutaElegida) {
    actualizar((e) => ({
      ...e,
      rutasGuardadas: [ruta, ...e.rutasGuardadas.filter((r) => r.id !== ruta.id)],
    }));
  },
  eliminarRutaGuardada(id: string) {
    actualizar((e) => ({ ...e, rutasGuardadas: e.rutasGuardadas.filter((r) => r.id !== id) }));
  },
  guardarVistaMapa(vista: VistaMapa) {
    actualizar((e) => ({ ...e, vistaMapa: vista }));
  },
  cambiarFiltro(filtro: TipoNovedad | "todos") {
    actualizar((e) => ({ ...e, filtroMapa: filtro }));
  },
  recordarTrayecto(origen: string, destino: string) {
    actualizar((e) => ({ ...e, ultimoOrigen: origen, ultimoDestino: destino }));
  },
  /** Vuelve a los 19 reportes originales y borra confirmaciones; conserva sesión y rutas. */
  restablecerDatos() {
    actualizar((e) => ({
      ...e,
      reportes: crearReportesEjemplo(Date.now()),
      confirmados: [],
      vistaMapa: null,
      filtroMapa: "todos",
    }));
  },
};

export { nuevoId };
