/** Metadatos únicos por pantalla. */
export function metaPantalla(titulo: string, descripcion: string) {
  const t = `${titulo} · RutaSegura`;
  return {
    meta: [
      { title: t },
      { name: "description", content: descripcion },
      { property: "og:title", content: t },
      { property: "og:description", content: descripcion },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
