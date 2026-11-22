import { describe, expect, it } from "vitest";

import { CENTRO_NEIVA, LUGARES } from "./lugares";
import { crearReportesEjemplo } from "./datos-ejemplo";
import { desdeMetros, longitudRutaMetros } from "./geo";
import { MENSAJE_SIMILAR, explicarRecomendacion, planearRutas, trazoRecto } from "./rutas";
import { calcularPuntaje, factorConfirmaciones, factorRecencia } from "./seguridad";
import type { Reporte, TipoNovedad } from "./tipos";

const AHORA = 1_800_000_000_000;
const DIA = 24 * 3600 * 1000;
// Ruta recta de 1 km hacia el este desde el centro de Neiva
const INICIO = CENTRO_NEIVA;
const FIN = desdeMetros(1000, 0, CENTRO_NEIVA);
const RUTA = trazoRecto(INICIO, FIN, 20);

/** Reporte "neutro": 2 días de antigüedad y 0 confirmaciones → peso exactamente 1. */
function rep(tipo: TipoNovedad, metrosAlNorte: number, extra: Partial<Reporte> = {}): Reporte {
  const p = desdeMetros(500, metrosAlNorte, CENTRO_NEIVA);
  return {
    id: `${tipo}-${metrosAlNorte}-${Math.random()}`,
    tipo,
    descripcion: "prueba de reporte",
    lat: p.lat,
    lng: p.lng,
    barrio: "Centro",
    creadoEn: AHORA - 2 * DIA,
    autor: null,
    confirmaciones: 0,
    propio: false,
    resuelto: false,
    ...extra,
  };
}

const base = () => calcularPuntaje(RUTA, [], AHORA).bruto;

describe("Puntaje de seguridad", () => {
  it("un hurto resta 16 puntos", () => {
    expect(base() - calcularPuntaje(RUTA, [rep("hurto", 50)], AHORA).bruto).toBeCloseTo(16, 5);
  });

  it("la mala iluminación resta 8 puntos", () => {
    expect(base() - calcularPuntaje(RUTA, [rep("iluminacion", 50)], AHORA).bruto).toBeCloseTo(8, 5);
  });

  it("una obra o bloqueo resta 5 puntos", () => {
    expect(base() - calcularPuntaje(RUTA, [rep("obra", 50)], AHORA).bruto).toBeCloseTo(5, 5);
  });

  it("cada zona segura suma 4 puntos", () => {
    expect(calcularPuntaje(RUTA, [rep("segura", 50)], AHORA).bruto - base()).toBeCloseTo(4, 5);
  });

  it("solo cuentan los reportes a menos de 250 m del trayecto", () => {
    expect(calcularPuntaje(RUTA, [rep("hurto", 240)], AHORA).cercanos).toHaveLength(1);
    expect(calcularPuntaje(RUTA, [rep("hurto", 260)], AHORA).cercanos).toHaveLength(0);
  });

  it("cada ruta pierde 0,5 puntos por kilómetro", () => {
    const km = longitudRutaMetros(RUTA) / 1000;
    expect(km).toBeCloseTo(1, 2);
    expect(base()).toBeCloseTo(100 - 0.5 * km, 5);
  });

  it("los reportes recientes pesan más que los antiguos", () => {
    expect(factorRecencia(2 * 3600 * 1000)).toBeGreaterThan(factorRecencia(3 * DIA));
    expect(factorRecencia(3 * DIA)).toBeGreaterThan(factorRecencia(10 * DIA));
    const reciente = calcularPuntaje(RUTA, [rep("hurto", 50, { creadoEn: AHORA - 3600 * 1000 })], AHORA).bruto;
    const antiguo = calcularPuntaje(RUTA, [rep("hurto", 50, { creadoEn: AHORA - 10 * DIA })], AHORA).bruto;
    expect(reciente).toBeLessThan(antiguo);
  });

  it("los reportes con más confirmaciones pesan más", () => {
    expect(factorConfirmaciones(6)).toBeGreaterThan(factorConfirmaciones(0));
    const muchas = calcularPuntaje(RUTA, [rep("hurto", 50, { confirmaciones: 8 })], AHORA).bruto;
    const ninguna = calcularPuntaje(RUTA, [rep("hurto", 50)], AHORA).bruto;
    expect(muchas).toBeLessThan(ninguna);
  });

  it("nunca baja de 8", () => {
    const muchos = Array.from({ length: 10 }, (_, i) => rep("hurto", 10 + i));
    expect(calcularPuntaje(RUTA, muchos, AHORA).puntaje).toBe(8);
  });

  it("nunca sube de 96", () => {
    const seguras = Array.from({ length: 5 }, (_, i) => rep("segura", 10 + i));
    expect(calcularPuntaje(RUTA, seguras, AHORA).puntaje).toBe(96);
  });

  it("los reportes resueltos no cuentan", () => {
    expect(calcularPuntaje(RUTA, [rep("hurto", 50, { resuelto: true })], AHORA).cercanos).toHaveLength(0);
  });
});

describe("Rutas simuladas", () => {
  const reportes = crearReportesEjemplo(AHORA);
  const pares = LUGARES.flatMap((a) => LUGARES.filter((b) => b.id !== a.id).map((b) => [a, b] as const));

  it("la ruta alterna es como máximo 25 % más larga que la rápida", () => {
    for (const [a, b] of pares) {
      const p = planearRutas(a, b, reportes, AHORA);
      expect(p.alterna.distanciaKm).toBeLessThanOrEqual(p.rapida.distanciaKm * 1.25 + 1e-9);
    }
  });

  it("si la diferencia de puntaje es menor a 10, no recomienda ninguna", () => {
    for (const [a, b] of pares) {
      const p = planearRutas(a, b, reportes, AHORA);
      if (Math.abs(p.alterna.puntaje - p.rapida.puntaje) < 10) {
        expect(p.recomendada).toBeNull();
        expect(p.explicacion).toBe(MENSAJE_SIMILAR);
      } else {
        expect(p.recomendada).not.toBeNull();
      }
    }
  });

  it("explica la recomendación con lo que evita y el tiempo extra", () => {
    const vacio = { hurto: 0, iluminacion: 0, obra: 0, segura: 0 };
    const frase = explicarRecomendacion(
      { conteo: { ...vacio, segura: 1 }, minutos: 25 },
      { conteo: { ...vacio, hurto: 2 }, minutos: 20 },
    );
    expect(frase).toBe("Evita 2 reportes de hurto y pasa por 1 zona segura, a cambio de 5 min más.");
  });
});

describe("Datos de ejemplo", () => {
  it("trae 19 reportes: 7 hurtos, 4 iluminación, 4 obras y 4 zonas seguras", () => {
    const r = crearReportesEjemplo(AHORA);
    const n = (t: TipoNovedad) => r.filter((x) => x.tipo === t).length;
    expect(r).toHaveLength(19);
    expect([n("hurto"), n("iluminacion"), n("obra"), n("segura")]).toEqual([7, 4, 4, 4]);
  });
});
