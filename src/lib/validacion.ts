export const MIN_DESCRIPCION = 10;
export const MAX_DESCRIPCION = 140;

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_CELULAR = /^3\d{9}$/;

export function normalizarContacto(v: string): string {
  const t = v.trim();
  return RE_CORREO.test(t) ? t.toLowerCase() : t.replace(/[\s-]/g, "").replace(/^\+57/, "");
}

export function validarContacto(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Escribe tu correo o tu celular";
  if (t.includes("@")) return RE_CORREO.test(t) ? undefined : "Escribe un correo válido";
  return RE_CELULAR.test(normalizarContacto(t)) ? undefined : "Escribe un correo válido o un celular de 10 dígitos que empiece por 3";
}

export function validarNombre(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Escribe tu nombre";
  if (t.length < 2) return "Tu nombre debe tener al menos 2 letras";
  if (t.length > 40) return "Usa máximo 40 caracteres";
  return undefined;
}

export function validarContrasena(v: string): string | undefined {
  if (!v) return "Escribe tu contraseña";
  if (v.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return undefined;
}

export function validarDescripcion(v: string): string | undefined {
  const n = v.trim().length;
  if (n < MIN_DESCRIPCION) return "Escribe al menos 10 caracteres para describir la novedad";
  if (n > MAX_DESCRIPCION) return "Usa máximo 140 caracteres";
  return undefined;
}
