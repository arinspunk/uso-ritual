## Context

Ver proposal.md para la motivación. El bloque de comentarios es un script client-side (`atproto-comments.js`) que llama a `app.bsky.feed.getPostThread` y construye el DOM mediante JS puro. La respuesta ya incluye `author.avatar` (URL CDN de Bluesky) y `author.displayName` en cada reply; no se necesita ninguna llamada adicional.

Tokens CSS relevantes: `--color-accent` (`#FF0090`, wada-pink), `--color-text`, `--color-text-muted`, `--font-ui`.

## Goals / Non-Goals

**Goals:**
- Mostrar el avatar del autor junto a cada reply
- Mostrar un placeholder con iniciales cuando el autor no tiene avatar
- Sustituir la fecha absoluta por tiempo relativo compacto y bilingüe (PT / EN)

**Non-Goals:**
- Añadir interactividad (likes, repost, etc.)
- Cachear o proxear las imágenes de avatar
- Soportar más de dos idiomas en esta iteración

## Decisions

### D1 — Layout del avatar y línea de thread

El elemento `.atproto-reply` pasa de `flex-wrap` plano a una estructura de dos columnas: columna izquierda con el avatar (y la línea de thread), columna derecha con el contenido.

```
.atproto-reply
├── .atproto-reply__avatar-wrap   (position: relative — ancla la línea)
│   └── img | div.avatar--placeholder  (32 × 32 px)
└── .atproto-reply__content
    ├── .atproto-reply__header  (nombre · handle · tiempo)
    └── .atproto-reply__text
```

Los replies anidados **no se indentan**. En su lugar, cuando un reply tiene sub-replies, `.atproto-reply__avatar-wrap::after` dibuja una línea vertical de 2 px (`var(--color-border)`) desde `top: 100%` (bajo el avatar) hasta `bottom: 0` del wrap, conectando visualmente el avatar del padre con el del hijo. Los hijos quedan alineados a la misma posición X que el padre.

```css
.atproto-reply__avatar-wrap::after {   /* solo cuando hay .atproto-reply__replies */
  content: '';
  position: absolute;
  left: 50%; transform: translateX(-50%);
  top: 100%; bottom: 0;
  width: 2px;
  background: var(--color-border);
}
.atproto-reply__replies { margin-left: 0; padding-left: 0; }
```

**Alternativa descartada:** `margin-left` en `.atproto-reply__replies` — indentación clásica, pero pierde la conexión visual entre avatares y hace los threads profundos muy estrechos.

**Alternativa descartada:** incrustar el avatar dentro del header en línea con el nombre — imposibilita anclar la línea de thread.

### D2 — Avatar con fallback de iniciales

- Si `author.avatar` existe: `<img class="atproto-reply__avatar" src="…" alt="" loading="lazy" width="32" height="32">`
- Si no existe: `<div class="atproto-reply__avatar atproto-reply__avatar--placeholder">XZ</div>`

Las iniciales se extraen del `displayName`: primera letra de cada palabra (máximo 2), en mayúscula. Si `displayName` está vacío o ausente, se usa la primera letra del `handle`.

Estilos del placeholder: `background: var(--color-accent)`, `color: var(--color-text)`, `font-family: var(--font-ui)`, borde redondeado al 50 %, texto centrado.

**Alternativa descartada:** SVG genérico con silueta de usuario — menos identidad visual, no conecta con el sistema de color del site.

### D3 — Tiempo relativo compacto

Se reemplaza `formatDate()` por `formatRelativeTime(iso, lang)`. La lógica:

| Delta           | PT          | EN          |
|-----------------|-------------|-------------|
| < 60 s          | `agora`     | `now`       |
| < 3 600 s       | `{n} m`     | `{n} m`     |
| < 86 400 s      | `{n} h`     | `{n} h`     |
| < 30 días       | `{n} d`     | `{n} d`     |
| < 365 días      | `{n} me`    | `{n} mo`    |
| ≥ 365 días      | `dd/mm/aaaa`| `dd/mm/aaaa`|

La implementación es una función manual (no `Intl.RelativeTimeFormat`) porque el formato compacto difiere del estándar de la API de internacionalización.

La fecha absoluta se mantiene accesible en el atributo `title` del elemento `<time>`, usando el locale del documento: `Intl.DateTimeFormat(lang, { dateStyle: 'short', timeStyle: 'short' })`. El atributo `datetime` sigue siendo el ISO original.

**Alternativa descartada:** `Intl.RelativeTimeFormat` con `style: "narrow"` — produce cadenas como "hace 5 min." que no se ajustan al formato compacto requerido.

### D4 — Marcado HTML semántico

El DOM generado por `renderReply()` pasa de `<div>` anidados con `style="margin-left"` a una estructura semántica:

```
<ol class="atproto-comments__list">           ← lista ordenada (cronológica)
  <li>
    <article class="atproto-reply">           ← contenido autocontenido
      <header class="atproto-reply__header">
        img | div.avatar--placeholder
        <b class="atproto-reply__author">
        <span class="atproto-reply__handle">
        <time class="atproto-reply__time">
      </header>
      <p class="atproto-reply__text">
      <ol class="atproto-reply__replies">     ← sub-replies anidados
        <li>…</li>
      </ol>
    </article>
  </li>
</ol>
```

Los sub-replies no se indentan — la jerarquía se comunica mediante la línea de thread del avatar (ver D1). Se elimina completamente el `style` inline generado por JS. `<b>` para el nombre del autor (distinción tipográfica, no énfasis semántico). Se añade `.atproto-reply__avatar-wrap` como contenedor posicionado del avatar para anclar el pseudo-elemento de la línea.

**Alternativa descartada:** mantener `<div>` con clases BEM — semánticamente neutro, peor para lectores de pantalla y herramientas de accesibilidad.

### D5 — Popover de app (patrón uniforme)

Tanto "Comenta en" (post raíz) como "Responder" (reply individual) usan el mismo patrón: un botón que abre un popover con los enlaces de app. El popover se construye con la **Popover API nativa** (`popover` attribute + `popovertarget`), que gestiona dismiss al clic exterior y accesibilidad sin JS adicional.

```
[Comenta en ▾]                    [Responder ▾]
      │                                  │
      ▼ popover                          ▼ popover
┌─────────────────┐            ┌─────────────────┐
│ • Bluesky       │            │ • Bluesky       │
│ • Mu            │            │ • Mu            │
│ • Deer          │            │ • Deer          │
│ ─────────────── │            │ ─────────────── │
│ Otra app        │            │ Otra app        │
│ [______] [→]    │            │ [______] [→]    │
└─────────────────┘            └─────────────────┘
URL: /profile/<DID>/post/<rkey>   URL: /profile/<author-DID>/post/<reply-rkey>
```

Apps conocidas (todas usan el patrón `/profile/<DID>/post/<rkey>`):

| Label    | Dominio       |
|----------|---------------|
| Bluesky  | `bsky.app`    |
| Mu       | `mu.social`   |
| Deer     | `deer.social` |

La app preferida se persiste en `localStorage` (`atproto-preferred-app`, valor = dominio). Al abrir cualquier popover, la app guardada aparece resaltada. Al hacer clic en una app o confirmar un dominio libre, se actualiza `localStorage`.

Cada popover recibe un `id` único generado en JS para evitar colisiones entre múltiples replies en la misma página.

El botón "Comenta en" se muestra en el estado vacío y al pie de la lista de replies. "Responder" se muestra al pie de cada `<article>` de reply.

**Alternativa descartada:** pills persistentes para "Comenta en" + popover solo para "Responder" — patrón mixto, mayor superficie de CSS y comportamiento distinto para la misma acción.

**Alternativa descartada:** `<details>/<summary>` — no tiene la semántica de popover flotante; se integra en el flujo del documento y desplaza el layout.

## Risks / Trade-offs

- **Imágenes externas del CDN de Bluesky** → URLs de `cdn.bsky.app`; si el CDN cae las imágenes no cargan pero el layout no se rompe (el placeholder sirve de fallback visual con `onerror`).
- **`displayName` con caracteres no-ASCII o emoji** → `.slice(0,1)` en Unicode puede cortar surrogates; usar `[...str][0]` (spread de iterador) para extraer grafemas correctamente.
