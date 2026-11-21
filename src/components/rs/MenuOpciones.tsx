import { useNavigate } from "@tanstack/react-router";
import { LogOut, MoreVertical, Palette, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { acciones } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Boton } from "./Boton";

const claseItem = "min-h-11 cursor-pointer gap-3 rounded-lg px-3 text-base [&>svg]:size-5";

export function MenuOpciones({ className }: { className?: string }) {
  const [confirmar, setConfirmar] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Boton variante="fantasma" tamano="icono" aria-label="Más opciones" className={cn(className)}>
            <MoreVertical />
          </Boton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
          <DropdownMenuItem className={claseItem} onSelect={() => navigate({ to: "/guia-de-estilo" })}>
            <Palette aria-hidden /> Guía de estilo
          </DropdownMenuItem>
          <DropdownMenuItem className={claseItem} onSelect={() => setConfirmar(true)}>
            <RotateCcw aria-hidden /> Restablecer datos de ejemplo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={claseItem}
            onSelect={() => {
              acciones.cerrarSesion();
              navigate({ to: "/bienvenida" });
            }}
          >
            <LogOut aria-hidden /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Restablecer los datos de ejemplo?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Volverán los 19 reportes originales. Se borrarán los reportes que creaste y tus confirmaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel asChild>
              <Boton variante="contorno">Cancelar</Boton>
            </AlertDialogCancel>
            <Boton
              variante="peligro"
              onClick={() => {
                acciones.restablecerDatos();
                setConfirmar(false);
                toast.success("Listo, volvieron los datos de ejemplo");
              }}
            >
              Sí, restablecer
            </Boton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
