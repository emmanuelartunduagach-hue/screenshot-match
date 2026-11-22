<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (RutaSegura)

- App state (session, reports, saved routes, map view/filter) lives in `src/lib/store.ts` (useSyncExternalStore + localStorage); the chat history in `src/lib/chat.ts`. Why: demo prototype with no backend except the AI assistant.
- Safety score and simulated routes are pure functions in `src/lib/seguridad.ts` and `src/lib/rutas.ts`, covered by `src/lib/seguridad.test.ts`. Why: the rules are the core of the product and must stay testable.
- Leaflet is only loaded via dynamic `import()` inside `src/components/rs/MapaNeiva.tsx` (it sets `window.L` before loading markercluster). Why: Leaflet touches `window` at import time and breaks SSR.
- The assistant streams plain text from the server route `src/routes/api/asistente.ts` via `@lovable.dev/ai-gateway`; the system prompt lives in `src/lib/asistente-prompt.ts` and must be updated when app screens or score rules change. Why: keeps the assistant from inventing features.
- Logged-in screens are children of the pathless layout `src/routes/_shell.tsx` (sidebar on desktop, bottom nav on mobile). Why: one shared shell and session guard.
- `--text-xs`/`--text-sm` are mapped to 1rem in `src/styles.css`. Why: accessibility rule of a 16 px minimum text size, including shadcn components.
- Map marker/route colors are CSS classes (`.rs-pin--*`, `.rs-ruta-*`) using design tokens, never inline colors in Leaflet options.
