import { afterEach, describe, expect, it, vi } from "vitest";

import { crearReportesEjemplo } from "./datos-ejemplo";
import { LUGARES } from "./lugares";
import { MENSAJE_SIMILAR } from "./rutas";
import {
  decodificarPolilinea,
  obtenerTrazosCalles,
  parecido,
  planearDesdeTrazos,
  type TrazoCalles,
} from "./rutas-calles";

const AHORA = Date.UTC(2026, 10, 21, 18);
const [A, B] = [LUGARES[0]!, LUGARES[3]!];

/** Trazo en "L" que pasa por una esquina. */
function enL(esquina: { lat: number; lng: number }, metros: number): TrazoCalles {
  return { puntos: [A, esquina, B].map((p) => ({ lat: p.lat, lng: p.lng })), metros };
}
const norte = enL({ lat: B.lat, lng: A.lng }, 3000);
const oeste = enL({ lat: A.lat, lng: B.lng }, 3300);
const lejos = enL({ lat: A.lat - 0.05, lng: B.lng }, 9000);

describe("Rutas por calles", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("la más corta es la rápida y usa la distancia real", () => {
    const p = planearDesdeTrazos([oeste, norte], crearReportesEjemplo(AHORA), AHORA);
    expect(p.fuente).toBe("calles");
    expect(p.rapida.distanciaKm).toBeCloseTo(3);
    expect(p.alterna.distanciaKm).toBeCloseTo(3.3);
  });

  it("descarta alternas más de 25 % más largas", () => {
    const p = planearDesdeTrazos([norte, lejos], crearReportesEjemplo(AHORA), AHORA);
    expect(p.alterna.distanciaKm).toBeCloseTo(3);
    expect(p.recomendada).toBeNull();
    expect(p.explicacion).toBe(MENSAJE_SIMILAR);
  });

  it("mide cuánto se parecen dos trazos", () => {
    expect(parecido(norte, norte)).toBe(1);
    expect(parecido(norte, oeste)).toBeLessThan(0.8);
  });

  it("convierte la respuesta de OSRM en trazos (lng,lat → lat,lng)", async () => {
    const respuesta = {
      code: "Ok",
      routes: [
        {
          distance: 2700,
          geometry: {
            coordinates: [
              [A.lng, A.lat],
              [B.lng, B.lat],
            ],
          },
        },
      ],
    };
    const fetchFalso = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(respuesta) });
    vi.stubGlobal("fetch", fetchFalso);
    const trazos = await obtenerTrazosCalles(A, B);
    // una consulta principal y, como no hay alterna distinta, los 4 desvíos
    expect(fetchFalso).toHaveBeenCalledTimes(5);
    expect(trazos).toHaveLength(1);
    expect(trazos[0]!.metros).toBe(2700);
    expect(trazos[0]!.puntos[0]).toEqual({ lat: A.lat, lng: A.lng });
  });

  it("si OSRM ya trae una alterna distinta, no hace consultas extra", async () => {
    const geo = (t: TrazoCalles) => ({
      distance: t.metros,
      geometry: { coordinates: t.puntos.map((p) => [p.lng, p.lat]) },
    });
    const respuesta = { code: "Ok", routes: [geo(norte), geo(oeste)] };
    const fetchFalso = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(respuesta) });
    vi.stubGlobal("fetch", fetchFalso);
    const trazos = await obtenerTrazosCalles(LUGARES[2]!, LUGARES[4]!);
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    expect(trazos).toHaveLength(2);
  });

  it("decodifica polilíneas (ejemplo de la documentación de Google)", () => {
    const p = decodificarPolilinea("_p~iF~ps|U_ulLnnqC_mqNvxq`@", 5);
    expect(p).toHaveLength(3);
    expect(p[0]!.lat).toBeCloseTo(38.5);
    expect(p[0]!.lng).toBeCloseTo(-120.2);
    expect(p[2]!.lat).toBeCloseTo(43.252);
    expect(p[2]!.lng).toBeCloseTo(-126.453);
  });

  it("si OSRM no responde, usa Valhalla", async () => {
    const valhalla = {
      trip: { summary: { length: 2.5 }, legs: [{ shape: "_p~iF~ps|U_ulLnnqC" }] },
      alternates: [{ trip: { summary: { length: 2.9 }, legs: [{ shape: "_ulLnnqC_mqNvxq`@" }] } }],
    };
    const fetchFalso = vi.fn((url: string) =>
      Promise.resolve(
        url.includes("valhalla")
          ? { ok: true, json: () => Promise.resolve(valhalla) }
          : { ok: false, status: 429 },
      ),
    );
    vi.stubGlobal("fetch", fetchFalso);
    const trazos = await obtenerTrazosCalles(LUGARES[4]!, LUGARES[5]!);
    expect(fetchFalso.mock.calls.some(([u]) => u.includes("valhalla"))).toBe(true);
    expect(trazos[0]!.metros).toBe(2500);
  });

  it("si fallan OSRM y Valhalla, la promesa se rechaza para usar la ruta aproximada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(obtenerTrazosCalles(LUGARES[1]!, LUGARES[2]!)).rejects.toThrow();
  });
});
