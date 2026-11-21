export function formatoKm(km: number): string {
  return `${km.toLocaleString("es-CO", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km`;
}

export function formatoFecha(ms: number): string {
  return new Date(ms).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
