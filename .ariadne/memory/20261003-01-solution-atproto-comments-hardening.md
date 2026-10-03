# Solution: Endurecimiento de atproto-comments.js
> Source: Aplicar todas las mejoras detectadas en el análisis de `src/assets/js/atproto-comments.js`.
> Date: 2026-10-03
> Context: .ariadne/project-context.md

## Problem
El script que renderiza los comentarios de Bluesky funciona, pero tiene fragilidades: textos i18n dispersos en ternarios (con sufijos de tiempo sin traducir), entradas sin validar (`appview`, fechas, dominio personalizado), facets que pueden solaparse, código duplicado, accesibilidad mejorable y ningún fallback si la Popover API no existe.

## Proposed Approach
Refactorizar el IIFE existente **sin cambiar archivos ni dependencias** (un único `.js` estático, sin build). Se mantiene el DOM generado y las clases BEM actuales; solo se añaden los cambios mínimos de CSS necesarios en `_atproto-comments.css` (usando tokens de `_tokens.css`). Se respeta que el proyecto solo tiene PT (raíz) y EN (`/en/`): **no se añade `es`** (descartado del análisis original por contradecir el contexto del proyecto).

## Implementation Steps
1. **i18n centralizado:** crear `const I18N = { pt: {...}, en: {...} }` con todas las cadenas (reply, comment, otherApp, placeholder, error, now, minutes, hours, days, months, replyTo). Helper `t(key)` con fallback a `en`. Sustituye todos los ternarios `lang === "pt"`. El placeholder del input pasa a ser neutro (`app.example`).
2. **Validación de entradas:**
   - `appview` con valor por defecto `https://public.api.bsky.app` y sin barra final.
   - `formatRelativeTime` / `formatAbsoluteDate`: si la fecha es inválida (`isNaN`), devolver cadena vacía y no renderizar el `<time>` (o renderizarlo vacío sin `·`).
   - Dominio personalizado: `normalizeDomain(raw): string | null` usando `new URL("https://" + raw).hostname` y comprobando que contiene un punto; rechazar espacios/rutas. Input con `aria-invalid` si falla.
3. **Facets robustos:** en `buildFacetedText`, descartar facets con `start < pos`, `end <= start` o `end > bytes.length`; añadir soporte para `#mention` (enlace a `https://bsky.app/profile/{did}`) y `#tag` (enlace a `https://bsky.app/hashtag/{tag}`) solo como enlaces, sin cambiar la estructura.
4. **Preferencia de app actualizada:** al elegir/guardar app, actualizar la clase `--active` de los enlaces del popover en el evento `toggle` (re-evaluar `localStorage` al abrir).
5. **Posicionamiento del popover:** calcular posición en el evento `toggle` tras abrir (ya medido `offsetWidth`), añadir volteo hacia arriba si no cabe debajo, y cerrar el popover en `scroll`/`resize` (listeners pasivos registrados solo mientras está abierto).
6. **Fallback sin Popover API:** si `!HTMLElement.prototype.hasOwnProperty("popover")`, `buildAppAction` renderiza un enlace directo a `https://bsky.app/profile/{did}/post/{rkey}` con la misma clase del botón.
7. **Deduplicación:** extraer `sortedReplies(list)` (filtra `threadViewPost` + ordena por `createdAt`) y usarlo en `renderReply` y `load`. Simplificar `hiddenRkeys` quitando el `try/catch` y comparando URIs completas (`ref.uri`) con `post.uri`.
8. **Accesibilidad:** `aria-haspopup="true"` en el botón, `aria-label` "Responder a {autor}" en respuestas, `aria-live`/`role="status"` en el error, el `·` del tiempo movido a CSS (`::before`) en `_atproto-comments.css`.
9. **Escalabilidad de hilo:** constante `MAX_DEPTH = 6` documentada; si un reply tiene `replyCount > replies.length` mostrar enlace "Ver más en Bluesky" apuntando al post (usa `data-post-url` ya presente en `post.vto`).
10. **Limpieza:** eliminar comentarios `Task X.Y`, mantener comentarios útiles en inglés.
11. **Verificación manual:** `deno task serve`, abrir un post con `atprotoRkey` en `/` y `/en/`; probar sin respuestas, con error de red (offline), con fecha inválida y con popover en el borde inferior.

## Trade-offs
- **Chosen because:** una refactorización local en un solo archivo no requiere build, dependencias ni cambios de layout; mantiene el contrato `data-*` de `post.vto`.
- **Rejected alternative(s):** (a) migrar a Web Component o TypeScript compilado por Lume (más piezas, rompe la regla de "sin dependencias nuevas"); (b) añadir tests con Deno/jsdom (el proyecto no tiene testing; se valora aparte); (c) añadir idioma `es` (el proyecto solo es PT/EN).
- **Risks/limitations:** el volteo del popover y el ajuste en scroll añaden lógica de UI sin tests automáticos; menciones/hashtags dependen de bsky.app como destino fijo; "Ver más" depende de `replyCount` disponible en la respuesta del appview.

## Constraints Applied
- Sin dependencias nuevas ni CDN (Hard Constraints).
- CSS: tokens de `_tokens.css`, nombres BEM, sin valores hardcodeados.
- Multilanguage: solo PT (raíz) y EN; `lang` heredado de `document.documentElement.lang`.
- Los cambios no tocan `post.vto` salvo, si fuera necesario, nada más allá de los `data-*` existentes.
- Comentarios y código en inglés (regla del usuario); este documento en español.
