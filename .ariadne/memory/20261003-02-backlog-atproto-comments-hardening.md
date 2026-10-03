# Backlog: Endurecimiento de atproto-comments.js
> Source: 20261003-01-solution-atproto-comments-hardening.md
> Date: 2026-10-03
> Context: .ariadne/project-context.md

## Summary
- **Objective:** Refactorizar `src/assets/js/atproto-comments.js` para centralizar i18n, validar entradas, robustecer facets/popover, mejorar accesibilidad y eliminar duplicación, sin nuevas dependencias.
- **Total tasks:** 15
- **Phases:** 4

> Nota: todos los archivos JS/CSS se escriben en inglés (código y comentarios). Los números de línea cambian durante la ejecución; las tareas referencian funciones por nombre.

---

## Phase 1: Fundamentos (i18n y validación)

**[1.1]** ✅ Centralizar i18n en un diccionario
> **What to do:** Todas las cadenas visibles salen de un único diccionario `I18N` y un helper `t(key)`; ya no queda ningún ternario `lang === "pt"`.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Añadir tras la constante `lang`: `const I18N = { pt: {...}, en: {...} }` y `function t(key, vars)` que lee `I18N[lang] ?? I18N.en` con fallback a `I18N.en[key]`. Claves: `reply`, `replyTo` (con `{name}`), `comment`, `otherApp`, `inputPlaceholder`, `error`, `now`, `minutes`, `hours`, `days`, `months`, `viewMore`, `invalidDomain`. Valores PT: "Responder", "Responder a {name}", "Comentar", "Outra app", "Não foi possível carregar os comentários.", "agora", "min", "h", "d", "m", "Ver mais no Bluesky". Valores EN: "Reply", "Reply to {name}", "Comment", "Other app", "Comments couldn't be loaded.", "now", "m", "h", "d", "mo", "View more on Bluesky". `inputPlaceholder` = `"app.example"` en ambos. Sustituir usos en `formatRelativeTime`, `buildAppPopover`, `renderReply`, `renderError`, `load`.
> - **Do NOT:** No añadir idioma `es`. No cambiar la firma de ninguna función exportada al DOM. No tocar otros archivos.
> **Done when:** `rg 'lang === "pt"' src/assets/js/atproto-comments.js` → 0 resultados y `deno task build` → sin errores.
> **Date completed:** 2026-10-03
> **Work done:** Añadidos `I18N` (pt/en) y `t(key, vars)` con `replaceAll` para `{name}`; eliminados todos los ternarios `lang === "pt"`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[1.2]** ✅ Validar `appview` y valor por defecto
> **What to do:** El script usa `https://public.api.bsky.app` si `data-appview` falta o está vacío, y elimina la barra final.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Sustituir `const appview = container.dataset.appview;` por `const DEFAULT_APPVIEW = "https://public.api.bsky.app"; const appview = (container.dataset.appview || DEFAULT_APPVIEW).replace(/\/+$/, "");`
> - **Do NOT:** No modificar `src/_includes/layouts/post.vto` ni `src/_data/atproto.yml`.
> **Done when:** En el navegador, con `data-appview` borrado desde DevTools y recarga forzada del script, la petición va a `https://public.api.bsky.app/xrpc/...` (pestaña Network).
> **Date completed:** 2026-10-03
> **Work done:** `DEFAULT_APPVIEW` + normalización con `.replace(/\/+$/, "")`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[1.3]** ✅ Validar fechas inválidas
> **What to do:** Una fecha ausente o inválida no produce "NaN" ni `·` en la cabecera del comentario.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Añadir `function isValidDate(iso)` (`!Number.isNaN(new Date(iso).getTime())`). En `formatRelativeTime` y `formatAbsoluteDate`, devolver `""` si `!isValidDate(iso)`. En `renderReply`, solo crear y añadir el elemento `<time>` si `isValidDate(record.createdAt)`.
> - **Do NOT:** No cambiar el formato `dd/mm/yyyy` para fechas de más de un año.
> **Done when:** Ejecutar en consola `formatRelativeTime("")` desde una copia aislada devuelve `""`; y un comentario con `createdAt` vacío (probado mutando `record.createdAt` en un fixture local) no renderiza `<time>`.
> **Date completed:** 2026-10-03
> **Work done:** `isValidDate`; early return en formatters; `<time>` condicional en `renderReply`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[1.4]** ✅ Validar el dominio personalizado
> **What to do:** El input "Otra app" solo acepta hostnames válidos y marca error si no lo son.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Añadir `function normalizeDomain(raw): string | null`: quita `http(s)://`, espacios y barra final; construye `new URL("https://" + value)`; devuelve `url.hostname` solo si no hay `pathname` distinto de `/`, ni `search`, y el hostname contiene un `.`; si lanza o falla, `null`. En `openCustom` (dentro de `buildAppPopover`) usar `normalizeDomain`; si es `null`, poner `input.setAttribute("aria-invalid", "true")` y `return`; si es válido, quitar el atributo y continuar con la lógica actual. Guardar en `localStorage` el hostname normalizado.
> - **Do NOT:** No bloquear dominios por lista. No usar `innerHTML`.
> **Done when:** Introducir `mi app` o `foo/bar` → el input queda con `aria-invalid="true"` y no se abre pestaña; introducir `https://mu.social/` → abre `https://mu.social/profile/...`.
> **Date completed:** 2026-10-03
> **Work done:** `normalizeDomain` + `aria-invalid` en `openCustom`; guarda hostname normalizado.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

---

## Phase 2: Lógica de render (facets, replies, ocultos)

**[2.1]** ✅ Facets robustos (descartar solapados y fuera de rango)
> **What to do:** `buildFacetedText` nunca duplica ni corta texto aunque haya facets solapados o con rangos inválidos.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Tras ordenar `links` por `start`, en el bucle de render omitir cualquier entrada con `link.start < pos || link.end <= link.start || link.end > bytes.length`.
> - **Do NOT:** No cambiar el uso de `TextEncoder`/`TextDecoder` (rangos en bytes UTF-8).
> **Done when:** Prueba manual con record sintético `{text:"hola mundo", facets:[{index:{byteStart:0,byteEnd:4},features:[link]},{index:{byteStart:2,byteEnd:6},features:[link]}]}` produce el texto "hola mundo" sin repeticiones.
> **Date completed:** 2026-10-03
> **Work done:** Skip de facets solapados/inválidos en el bucle de `buildFacetedText`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[2.2]** ✅ Soporte de menciones y hashtags
> **What to do:** Los facets `#mention` y `#tag` se renderizan como enlaces a bsky.app.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** En `buildFacetedText`, ampliar la recolección de `links` con: `app.bsky.richtext.facet#mention` → `https://bsky.app/profile/${feature.did}`; `app.bsky.richtext.facet#tag` → `https://bsky.app/hashtag/${encodeURIComponent(feature.tag)}`. Mantener `rel="noopener noreferrer"` y `target="_blank"`.
> - **Do NOT:** No aceptar `uri` que no empiece por `http://` o `https://` en el caso `#link`. No crear nuevas clases CSS.
> **Done when:** Un comentario real con `@usuario` y `#tag` muestra ambos como enlaces con `href` correcto (inspección en DevTools).
> **Date completed:** 2026-10-03
> **Work done:** Recolección de `#mention` y `#tag` en `buildFacetedText` con mismos attrs de enlace.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[2.3]** ✅ Extraer `sortedReplies` y simplificar `hiddenRkeys`
> **What to do:** El filtrado/orden de respuestas vive en una sola función y la comparación de ocultos usa URIs completas.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Crear `function sortedReplies(list)` que filtra `$type === "app.bsky.feed.defs#threadViewPost"` y ordena ascendente por `post.record.createdAt` (usar `|| 0` como ahora); usarla en `renderReply` (`subReplies`) y en `load` (`replies`). Reescribir `hiddenRkeys` como `hiddenUris(thread): Set<string>` sin `try/catch`: `new Set((thread.threadgate?.record?.hiddenReplies ?? []).map((r) => r.uri).filter(Boolean))`; en `renderReply` comparar `hidden.has(view.post?.uri)`. Actualizar la llamada en `load`.
> - **Do NOT:** No cambiar el orden (ascendente) ni la profundidad de la API.
> **Done when:** `rg "threadViewPost" src/assets/js/atproto-comments.js` muestra el filtro solo en `sortedReplies` y en `renderReply` (comprobación de tipo de la vista); `deno task build` → OK; el hilo real sigue renderizando el mismo número de comentarios.
> **Date completed:** 2026-10-03
> **Work done:** `sortedReplies` + `hiddenUris`; filtro `threadViewPost` solo en `sortedReplies` y guard de tipo en `renderReply`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

---

## Phase 3: Popover y acciones

**[3.1]** ✅ Actualizar la marca activa al abrir el popover
> **What to do:** El enlace/app marcado como preferida refleja siempre el valor actual de `localStorage`.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** En `buildAppAction`, dentro del listener `toggle` (cuando `e.newState === "open"`), recorrer `popover.querySelectorAll(".atproto-app-popover__link")` y alternar `atproto-app-popover__link--active` comparando `new URL(a.href).hostname` con `localStorage.getItem(PREF_KEY)`. Rellenar también `input.value` si la preferencia es un dominio no conocido.
> - **Do NOT:** No reconstruir el popover entero.
> **Done when:** Elegir "Deer" en un popover y abrir el de otro comentario → "Deer" aparece marcado sin recargar.
> **Date completed:** 2026-10-03
> **Work done:** Sync de `--active` e input custom en `toggle` open de `buildAppAction`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[3.2]** ✅ Posicionamiento robusto del popover
> **What to do:** El popover se voltea hacia arriba si no cabe debajo y se cierra al hacer scroll o resize.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** En el listener `toggle` de `buildAppAction`: tras abrir, medir `popover.offsetHeight`/`offsetWidth`; si `rect.bottom + gap + height > window.innerHeight` y `rect.top - gap - height >= 0`, usar `top = rect.top - gap - height`. Registrar `window.addEventListener("scroll", close, { passive: true, once: true })` y `resize` análogo al abrir; en `newState === "closed"` retirarlos. `close = () => popover.hidePopover?.()`.
> - **Do NOT:** No usar librerías de posicionamiento ni CSS Anchor Positioning.
> **Done when:** Abrir el popover del último comentario en una ventana baja → se muestra por encima del botón; al hacer scroll se cierra.
> **Date completed:** 2026-10-03
> **Work done:** Flip vertical + listeners pasivos `scroll`/`resize` con cleanup en close.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[3.3]** ✅ Fallback sin Popover API
> **What to do:** Si el navegador no soporta `popover`, el botón es un enlace directo al post en bsky.app.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Añadir `const SUPPORTS_POPOVER = "popover" in HTMLElement.prototype;`. Al inicio de `buildAppAction`, si `!SUPPORTS_POPOVER`, crear `<a class="atproto-app-btn [btnClass]" href="https://bsky.app/profile/${did}/post/${rkey}" target="_blank" rel="noopener noreferrer">` con el `label`, envuelto en `div.atproto-app-action`, y devolverlo.
> - **Do NOT:** No añadir polyfills.
> **Done when:** Forzando `SUPPORTS_POPOVER = false` temporalmente, los botones son `<a>` con `href` correcto (inspección DevTools); revertir el forzado.
> **Date completed:** 2026-10-03
> **Work done:** `SUPPORTS_POPOVER` + early return con `<a>` en `buildAppAction`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

---

## Phase 4: Accesibilidad, hilos largos, CSS y limpieza

**[4.1]** ✅ Atributos ARIA
> **What to do:** Los botones y el mensaje de error son accesibles.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** En `buildAppButton` añadir `btn.setAttribute("aria-haspopup", "true")` y aceptar un 4.º parámetro opcional `ariaLabel`; `buildAppAction` recibe `ariaLabel` y lo propaga. En `renderReply` pasar `t("replyTo", { name: author.displayName || author.handle })`. En `renderError` añadir `div.setAttribute("role", "status")`.
> - **Do NOT:** No cambiar nombres de clases existentes.
> **Done when:** Inspección DevTools → botones de respuesta con `aria-label="Responder a <nombre>"` y `aria-haspopup="true"`; el contenedor de error con `role="status"`.
> **Date completed:** 2026-10-03
> **Work done:** `aria-haspopup`, `ariaLabel` en button/action; `role="status"` en error; `replyTo` en replies.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[4.2]** ✅ Mover el `·` del tiempo a CSS
> **What to do:** El separador visual `·` se genera por CSS y no forma parte del texto de `<time>`.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`, `src/assets/css/_atproto-comments.css`
> - **How:** En `renderReply`, `time.textContent = formatRelativeTime(...)` (sin `"· "`). En CSS añadir `.atproto-reply__time::before { content: "· "; }` usando los tokens/estilos ya presentes en la regla `.atproto-reply__time`.
> - **Do NOT:** No hardcodear colores ni tamaños; no tocar otras reglas del archivo.
> **Done when:** Visualmente la cabecera sigue mostrando "Nombre @handle · 3 h" y `time.textContent` en DevTools no incluye `·`.
> **Date completed:** 2026-10-03
> **Work done:** Eliminado `"· "` del JS; añadido `::before` en `_atproto-comments.css`.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[4.3]** ✅ Enlace "Ver más en Bluesky" para hilos truncados
> **What to do:** Si una respuesta tiene más hijos que los cargados, se muestra un enlace al post original.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`, `src/assets/css/_atproto-comments.css`
> - **How:** Declarar `const MAX_DEPTH = 6;` y usarlo en la URL de `load` (`depth=${MAX_DEPTH}`). En `renderReply`, tras construir `subList`, si `(post.replyCount || 0) > (view.replies || []).length`, añadir al `content` un `<a class="atproto-reply__more" href="https://bsky.app/profile/${author.did}/post/${replyRkey}" target="_blank" rel="noopener noreferrer">` con `t("viewMore")`. CSS: regla `.atproto-reply__more` con `font-size: var(--font-size-small)`, `line-height: var(--line-height-small)`, `color: var(--color-text-muted)`.
> - **Do NOT:** No hacer peticiones adicionales; no usar `data-post-url`.
> **Done when:** Un comentario con `replyCount` mayor que sus respuestas visibles muestra el enlace con `href` correcto; uno sin truncado, no.
> **Date completed:** 2026-10-03
> **Work done:** `MAX_DEPTH` en `load`; enlace `.atproto-reply__more` + estilos con tokens.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[4.4]** ✅ Organizar el archivo en bloques
> **What to do:** Reordenar las funciones del IIFE en cuatro bloques claramente delimitados, sin cambiar su comportamiento ni convertirlas en clase.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Ordenar y separar con comentarios de sección (`// --- Constants & i18n ---`, `// --- Pure utilities ---`, `// --- DOM builders ---`, `// --- Bootstrap ---`): (1) constantes, `I18N`, `t()`, `HIDE_LABELS`, `KNOWN_APPS`, `PREF_KEY`, `MAX_DEPTH`, `SUPPORTS_POPOVER`; (2) utilidades puras: `isValidDate`, `formatRelativeTime`, `formatAbsoluteDate`, `getInitials`, `normalizeDomain`, `isHiddenByLabel`, `hiddenUris`, `sortedReplies`, `buildFacetedText`; (3) constructores DOM: `buildPlaceholder`, `buildAvatarWrap`, `buildAppPopover`, `buildAppButton`, `buildAppAction`, `renderReply`, `renderError`; (4) `load()` y la llamada `load();`. Mantener el early return inicial del contenedor y las constantes derivadas de `container` al principio del IIFE.
> - **Do NOT:** No introducir clases, `this`, `bind` ni módulos ES. No renombrar funciones. No cambiar lógica.
> **Done when:** `deno task build` → OK, el hilo de comentarios se renderiza igual que antes y los cuatro comentarios de sección aparecen en orden (`rg "^  // --- " src/assets/js/atproto-comments.js` → 4 resultados).
> **Date completed:** 2026-10-03
> **Work done:** IIFE reordenado en 4 bloques con los comentarios de sección indicados.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

**[4.5]** ✅ Limpieza de comentarios y verificación final
> **What to do:** Eliminar ruido y validar el resultado en ambos idiomas.
> **Spec:**
> - **Files:** `src/assets/js/atproto-comments.js`
> - **How:** Eliminar todos los comentarios `// Task X.Y …` y `// Tasks …`; conservar comentarios explicativos en inglés. Ejecutar `deno task serve` y revisar un post con comentarios en `/` (PT) y `/en/` (EN) en: sin respuestas, error de red (modo offline), popover al borde inferior, fecha inválida.
> - **Do NOT:** No introducir cambios funcionales en esta tarea.
> **Done when:** `rg "Task \d" src/assets/js/atproto-comments.js` → 0 resultados, `deno task build` → OK y la revisión manual de los 4 escenarios no muestra errores en consola.
> **Date completed:** 2026-10-03
> **Work done:** Eliminados comentarios `Task X.Y`; `deno task build` OK; checks `rg` (i18n ternarios, Task, secciones) OK. Revisión manual de escenarios en navegador pendiente del usuario.
> **Commit:** `7dc75c6` refactor(atproto): harden comments script for i18n, validation and a11y

---

## Progress
- ⏳ Pending: 0 | 🔄 In Progress: 0 | ✅ Done: 15 | ⚠️ Blocked: 0
- **Completion:** 100%

## Dependencies & Critical Path
- [1.1] bloquea [1.4], [4.1] y [4.3] porque usan claves del diccionario `t()`.
- [2.3] debe ir antes de [4.3] para que `renderReply` use `sortedReplies`/`hiddenUris` ya estabilizados.
- [3.1], [3.2] y [3.3] modifican `buildAppAction`: ejecutar en orden 3.1 → 3.2 → 3.3, y [4.1] después de [3.3].
- [4.4] (organizar en bloques) se ejecuta cuando todas las funciones nuevas ya existen, es decir, después de [4.3].
- [4.5] va siempre al final.
- Todas las tareas JS editan el mismo archivo: ejecutar secuencialmente, nunca en paralelo.

## Decisions Log
- 2026-10-03: se mantiene una colección de funciones dentro del IIFE (no clase). Hay una sola instancia por página, estado mínimo y mayoría de funciones puras. Si en el futuro se necesitan varios hilos o reutilización, migrar a Web Component.

## Deviations Log
- 2026-10-03 [4.5]: la verificación visual en navegador (PT/EN, offline, popover borde, fecha inválida) queda pendiente del usuario; los checks automatizables (`rg`, `deno task build`) pasaron.

## ⚠ Coherence Warnings
- ⚠ Solution step 5 ("Posicionamiento del popover") y step 6 ("Fallback") se separan en [3.2] y [3.3]; ambos tocan `buildAppAction`, de ahí el orden obligatorio.
- ⚠ El paso 9 de la solución menciona `data-post-url`; la tarea [4.3] construye la URL desde `author.did`/`rkey` del reply (el atributo es del post raíz, no de cada respuesta). Cambio intencional.
- ⚠ El proyecto no tiene tests: la verificación es manual/`deno task build`.
