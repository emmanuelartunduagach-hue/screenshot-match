import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/bienvenida" });
  },
  head: () => ({
    meta: [
      { title: "RutaSegura · Rutas más seguras en Neiva" },
      { name: "description", content: "App comunitaria para conocer novedades de seguridad y elegir rutas más seguras en Neiva, Huila." },
      { property: "og:title", content: "RutaSegura · Rutas más seguras en Neiva" },
      { property: "og:description", content: "App comunitaria para conocer novedades de seguridad y elegir rutas más seguras en Neiva, Huila." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
