import type * as Leaflet from "leaflet";
import type {} from "leaflet.markercluster";
import { Loader2, MapPin } from "lucide-react";
import { createElement, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CENTRO_NEIVA, LIMITES_MAPA, LIMITES_NEIVA, ZOOM_INICIAL } from "@/lib/lugares";
import { TIPOS } from "@/lib/novedades";
import type { Coordenada, Reporte, TipoNovedad, VistaMapa } from "@/lib/tipos";
import { cn } from "@/lib/utils";

type L = typeof Leaflet;

export interface RutaMapa {
  id: string;
  puntos: Coordenada[];
  estilo: "rapida" | "alterna";
  tenue?: boolean;
}

export interface Relleno {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PropsMapa {
  etiqueta: string;
  reportes?: Reporte[];
  agrupar?: boolean;
  activoId?: string | null;
  onSeleccionarReporte?: (id: string) => void;
  rutas?: RutaMapa[];
  origen?: Coordenada | null;
  destino?: Coordenada | null;
  /** Ajusta la vista a estos puntos cada vez que cambia `clave`. */
  encajar?: { puntos: Coordenada[]; clave: string; relleno?: Relleno } | null;
  /** Vista inicial */
  vista?: VistaMapa | null;
  onCambioVista?: (v: VistaMapa) => void;
  onClicMapa?: (c: Coordenada) => void;
  puntoElegido?: Coordenada | null;
  mostrarLimite?: boolean;
  /** Vuela a este punto cada vez que cambia `clave`. */
  enfocar?: { lat: number; lng: number; zoom: number; clave: string } | null;
  interactivo?: boolean;
  className?: string;
}

const htmlIcono = (tipo: TipoNovedad | "nuevo") =>
  renderToStaticMarkup(createElement(tipo === "nuevo" ? MapPin : TIPOS[tipo].icono, { "aria-hidden": true, strokeWidth: 2.4 }));

function iconoPin(Lf: L, tipo: TipoNovedad | "nuevo", activo: boolean, etiqueta: string) {
  return Lf.divIcon({
    className: "rs-pin-wrap",
    html: `<div class="rs-pin rs-pin--${tipo}${activo ? " rs-pin--activo" : ""}" role="img" aria-label="${etiqueta}">${htmlIcono(tipo)}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 40],
  });
}

export function MapaNeiva(props: PropsMapa) {
  const contRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<Leaflet.Map | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const [Lf, setLf] = useState<L | null>(null);
  const interactivo = props.interactivo ?? true;

  // Crear el mapa una sola vez (Leaflet solo existe en el navegador).
  useEffect(() => {
    let cancelado = false;
    let mapa: Leaflet.Map | null = null;
    let observador: ResizeObserver | null = null;
    void (async () => {
      const mod = await import("leaflet");
      const Leaf = ((mod as unknown as { default?: L }).default ?? mod) as L;
      (window as unknown as { L: L }).L = Leaf;
      await import("leaflet.markercluster");
      if (cancelado || !contRef.current) return;
      const v = propsRef.current.vista ?? { ...CENTRO_NEIVA, zoom: ZOOM_INICIAL };
      const limites = Leaf.latLngBounds(
        [LIMITES_MAPA.sur, LIMITES_MAPA.oeste],
        [LIMITES_MAPA.norte, LIMITES_MAPA.este],
      );
      mapa = Leaf.map(contRef.current, {
        center: [v.lat, v.lng],
        zoom: v.zoom,
        minZoom: 13,
        maxZoom: 18,
        maxBounds: limites,
        maxBoundsViscosity: 1,
        dragging: interactivo,
        scrollWheelZoom: interactivo,
        doubleClickZoom: interactivo,
        touchZoom: interactivo,
        keyboard: interactivo,
        zoomControl: interactivo,
      });
      Leaf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapa);
      const m = mapa;
      m.on("moveend", () => {
        const c = m.getCenter();
        propsRef.current.onCambioVista?.({ lat: c.lat, lng: c.lng, zoom: m.getZoom() });
      });
      m.on("click", (e: Leaflet.LeafletMouseEvent) => {
        propsRef.current.onClicMapa?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      observador = new ResizeObserver(() => m.invalidateSize());
      observador.observe(contRef.current);
      mapaRef.current = m;
      setLf(Leaf);
    })();
    return () => {
      cancelado = true;
      observador?.disconnect();
      mapa?.remove();
      mapaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { reportes, agrupar, activoId } = props;
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!Lf || !mapa || !reportes) return;
    const grupo: Leaflet.LayerGroup = agrupar
      ? Lf.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 48,
          spiderfyOnMaxZoom: true,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (c) => {
            const n = c.getChildCount();
            return Lf.divIcon({
              html: `<div class="rs-cluster" role="img" aria-label="${n} novedades agrupadas. Toca para acercar">${n}</div>`,
              className: "rs-cluster-wrap",
              iconSize: Lf.point(46, 46),
            });
          },
        })
      : Lf.layerGroup();
    for (const r of reportes) {
      const etiqueta = `${TIPOS[r.tipo].etiqueta} en ${r.barrio}`;
      const marcador = Lf.marker([r.lat, r.lng], {
        icon: iconoPin(Lf, r.tipo, r.id === activoId, etiqueta),
        title: etiqueta,
        riseOnHover: true,
        keyboard: true,
        zIndexOffset: r.id === activoId ? 1000 : 0,
      });
      marcador.on("click", () => propsRef.current.onSeleccionarReporte?.(r.id));
      grupo.addLayer(marcador);
    }
    grupo.addTo(mapa);
    return () => {
      grupo.remove();
    };
  }, [Lf, reportes, agrupar, activoId]);

  const { rutas } = props;
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!Lf || !mapa || !rutas?.length) return;
    const capa = Lf.layerGroup();
    // La ruta tenue se dibuja primero para que la resaltada quede encima.
    const orden = [...rutas].sort((a, b) => Number(Boolean(b.tenue)) - Number(Boolean(a.tenue)));
    for (const r of orden) {
      const latlngs = r.puntos.map((p) => [p.lat, p.lng] as [number, number]);
      const tenue = r.tenue ? " rs-ruta-tenue" : "";
      if (r.estilo === "alterna") {
        Lf.polyline(latlngs, { weight: 10, className: `rs-ruta-casco${tenue}`, interactive: false }).addTo(capa);
        Lf.polyline(latlngs, { weight: 6, className: `rs-ruta-alterna${tenue}`, interactive: false }).addTo(capa);
      } else {
        Lf.polyline(latlngs, { weight: 10, className: `rs-ruta-casco${tenue}`, interactive: false, opacity: 0.6 }).addTo(capa);
        Lf.polyline(latlngs, { weight: 6, className: `rs-ruta-rapida${tenue}`, interactive: false }).addTo(capa);
      }
    }
    capa.addTo(mapa);
    return () => {
      capa.remove();
    };
  }, [Lf, rutas]);

  const { origen, destino } = props;
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!Lf || !mapa) return;
    const capa = Lf.layerGroup();
    const crear = (c: Coordenada, texto: string, clase: string, aria: string) =>
      Lf.marker([c.lat, c.lng], {
        icon: Lf.divIcon({
          className: "rs-pin-wrap",
          html: `<div class="rs-lugar ${clase}" role="img" aria-label="${aria}">${texto}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        keyboard: false,
        zIndexOffset: 2000,
      }).addTo(capa);
    if (origen) crear(origen, "A", "", "Origen");
    if (destino) crear(destino, "B", "rs-lugar--destino", "Destino");
    capa.addTo(mapa);
    return () => {
      capa.remove();
    };
  }, [Lf, origen, destino]);

  const { puntoElegido } = props;
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!Lf || !mapa || !puntoElegido) return;
    const m = Lf.marker([puntoElegido.lat, puntoElegido.lng], {
      icon: iconoPin(Lf, "nuevo", false, "Punto elegido para tu reporte"),
      keyboard: false,
      zIndexOffset: 3000,
    }).addTo(mapa);
    return () => {
      m.remove();
    };
  }, [Lf, puntoElegido]);

  const { mostrarLimite } = props;
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!Lf || !mapa || !mostrarLimite) return;
    const rect = Lf.rectangle(
      [
        [LIMITES_NEIVA.sur, LIMITES_NEIVA.oeste],
        [LIMITES_NEIVA.norte, LIMITES_NEIVA.este],
      ],
      { className: "rs-limite", weight: 2, interactive: false },
    ).addTo(mapa);
    return () => {
      rect.remove();
    };
  }, [Lf, mostrarLimite]);

  const claveEncajar = props.encajar?.clave;
  useEffect(() => {
    const mapa = mapaRef.current;
    const enc = propsRef.current.encajar;
    if (!Lf || !mapa || !enc || enc.puntos.length === 0) return;
    const r = enc.relleno ?? { top: 40, right: 40, bottom: 40, left: 40 };
    mapa.invalidateSize();
    mapa.fitBounds(Lf.latLngBounds(enc.puntos.map((p) => [p.lat, p.lng] as [number, number])), {
      paddingTopLeft: [r.left, r.top],
      paddingBottomRight: [r.right, r.bottom],
      maxZoom: 16,
      animate: true,
    });
  }, [Lf, claveEncajar]);

  const claveEnfocar = props.enfocar?.clave;
  useEffect(() => {
    const mapa = mapaRef.current;
    const e = propsRef.current.enfocar;
    if (!Lf || !mapa || !e) return;
    mapa.flyTo([e.lat, e.lng], e.zoom, { duration: 0.6 });
  }, [Lf, claveEnfocar]);

  return (
    <div role="region" aria-label={props.etiqueta} className={cn("relative isolate overflow-hidden bg-muted", props.className)}>
      <div ref={contRef} className="absolute inset-0" />
      {!Lf && (
        <div className="absolute inset-0 grid place-items-center bg-muted">
          <p className="flex items-center gap-2 font-medium text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden /> Cargando mapa…
          </p>
        </div>
      )}
    </div>
  );
}
