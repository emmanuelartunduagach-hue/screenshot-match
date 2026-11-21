import { Fragment, type ReactNode } from "react";

/** Formato mínimo para respuestas del asistente: párrafos, listas y **negrita**. */
function enLinea(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i}>{parte.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{parte.replace(/^#+\s*/, "")}</Fragment>
    ),
  );
}

export function TextoFormateado({ texto }: { texto: string }) {
  const bloques: ReactNode[] = [];
  let lista: { ordenada: boolean; items: string[] } | null = null;
  const cerrar = () => {
    if (!lista) return;
    const L = lista;
    const Tag = L.ordenada ? "ol" : "ul";
    bloques.push(
      <Tag key={`l${bloques.length}`} className={L.ordenada ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
        {L.items.map((it, i) => (
          <li key={i}>{enLinea(it)}</li>
        ))}
      </Tag>,
    );
    lista = null;
  };
  for (const linea of texto.split("\n")) {
    const vineta = /^\s*[-*•]\s+(.*)$/.exec(linea);
    const numero = /^\s*\d+[.)]\s+(.*)$/.exec(linea);
    if (vineta || numero) {
      const ordenada = Boolean(numero);
      if (!lista || lista.ordenada !== ordenada) {
        cerrar();
        lista = { ordenada, items: [] };
      }
      lista.items.push((vineta?.[1] ?? numero?.[1] ?? "").trim());
    } else if (linea.trim() === "") {
      cerrar();
    } else {
      cerrar();
      bloques.push(<p key={`p${bloques.length}`}>{enLinea(linea)}</p>);
    }
  }
  cerrar();
  return <div className="space-y-2">{bloques}</div>;
}
