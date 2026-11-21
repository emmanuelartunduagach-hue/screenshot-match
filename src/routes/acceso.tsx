import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Aviso } from "@/components/rs/Aviso";
import { PieDemo } from "@/components/rs/Avisos";
import { Boton } from "@/components/rs/Boton";
import { CampoTexto } from "@/components/rs/Campo";
import { useVolver } from "@/components/rs/EncabezadoPantalla";
import { Logo } from "@/components/rs/Logo";
import { metaPantalla } from "@/lib/meta";
import { acciones } from "@/lib/store";
import { normalizarContacto, validarContacto, validarContrasena, validarNombre } from "@/lib/validacion";
import { cn } from "@/lib/utils";

type Modo = "registro" | "ingreso";

export const Route = createFileRoute("/acceso")({
  validateSearch: (s: Record<string, unknown>): { modo?: Modo } =>
    s["modo"] === "ingreso" ? { modo: "ingreso" } : { modo: "registro" },
  head: () => metaPantalla("Acceso", "Crea tu cuenta, inicia sesión o entra como invitado a RutaSegura."),
  component: Acceso,
});

interface Errores {
  nombre?: string;
  contacto?: string;
  contrasena?: string;
}

function Acceso() {
  const { modo: modoInicial = "registro" } = Route.useSearch();
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const volver = useVolver("/bienvenida");

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setErrores({});
    setErrorGeneral(null);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const nuevos: Errores = {};
    const eContacto = validarContacto(contacto);
    const eClave = validarContrasena(contrasena);
    if (eContacto) nuevos.contacto = eContacto;
    if (eClave) nuevos.contrasena = eClave;
    if (modo === "registro") {
      const eNombre = validarNombre(nombre);
      if (eNombre) nuevos.nombre = eNombre;
    }
    setErrores(nuevos);
    setErrorGeneral(null);
    if (Object.keys(nuevos).length > 0) {
      const primero = (["nombre", "contacto", "contrasena"] as const).find((k) => nuevos[k]);
      if (primero) document.getElementById(`acceso-${primero}`)?.focus();
      return;
    }
    const c = normalizarContacto(contacto);
    setEnviando(true);
    // Simulación: pequeña espera para mostrar el estado "cargando".
    window.setTimeout(() => {
      setEnviando(false);
      if (modo === "registro") {
        acciones.registrar({ nombre: nombre.trim(), contacto: c });
        toast.success(`¡Cuenta creada! Bienvenido, ${nombre.trim().split(" ")[0]}`);
      } else {
        const cuenta = acciones.buscarCuenta(c);
        if (!cuenta) {
          setErrorGeneral("No encontramos una cuenta con ese correo o celular. Crea una cuenta nueva.");
          return;
        }
        acciones.iniciarSesion({ ...cuenta, invitado: false });
        toast.success(`Hola de nuevo, ${cuenta.nombre.split(" ")[0]}`);
      }
      void navigate({ to: "/inicio" });
    }, 600);
  };

  const invitado = () => {
    acciones.iniciarSesion({ nombre: "Invitado", contacto: "", invitado: true });
    toast.success("Entraste como invitado");
    void navigate({ to: "/inicio" });
  };

  const esRegistro = modo === "registro";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-md items-center gap-2 px-4 pt-4">
        <Boton variante="fantasma" tamano="icono" aria-label="Volver" onClick={volver} className="-ml-2">
          <ArrowLeft />
        </Boton>
        <Logo />
      </header>

      <main className="mx-auto w-full max-w-md flex-1 animate-aparecer px-5 pb-6 pt-6">
        <h1 className="text-3xl font-extrabold">{esRegistro ? "Crea tu cuenta" : "Inicia sesión"}</h1>
        <p className="mt-1 text-muted-foreground">
          {esRegistro ? "Así tus reportes quedan a tu nombre." : "Entra para ver tus reportes y rutas."}
        </p>

        <div role="tablist" aria-label="Tipo de acceso" className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["registro", "ingreso"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={modo === m}
              onClick={() => cambiarModo(m)}
              className={cn(
                "h-11 rounded-lg font-semibold transition-all",
                modo === m ? "bg-card text-primary shadow-suave" : "text-muted-foreground hover:text-primary",
              )}
            >
              {m === "registro" ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} noValidate className="mt-6 space-y-4">
          {errorGeneral && <Aviso tono="error">{errorGeneral}</Aviso>}
          {esRegistro && (
            <CampoTexto
              id="acceso-nombre"
              etiqueta="Nombre"
              autoComplete="name"
              placeholder="Ej.: Laura Méndez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              error={errores.nombre}
            />
          )}
          <CampoTexto
            id="acceso-contacto"
            etiqueta="Correo o celular"
            autoComplete="username"
            inputMode="email"
            placeholder="tucorreo@ejemplo.com o 3001234567"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            error={errores.contacto}
          />
          <CampoTexto
            id="acceso-contrasena"
            etiqueta="Contraseña"
            type="password"
            autoComplete={esRegistro ? "new-password" : "current-password"}
            placeholder="Mínimo 6 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            error={errores.contrasena}
          />
          <Boton type="submit" tamano="lg" bloque cargando={enviando}>
            {enviando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Entrar"}
          </Boton>
        </form>

        <div className="my-6 flex items-center gap-3 text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
        </div>

        <Boton variante="contorno" tamano="lg" bloque onClick={invitado}>
          <UserRound aria-hidden /> Entrar como invitado
        </Boton>
        <p className="mt-3 text-center text-muted-foreground">Simulación: no se envían datos a ningún servidor.</p>
      </main>
      <PieDemo />
    </div>
  );
}
