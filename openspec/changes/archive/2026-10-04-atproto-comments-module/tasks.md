## 1. Repo y tooling

- [x] 1.1 Crear repositorio GitHub `atproto-comments` (público, licencia MIT)
- [x] 1.2 Inicializar `deno.json` con tasks: `build`, `check`, `test`
- [x] 1.3 Añadir `package.json` con campos `name`, `version`, `exports`, `files`, `type: "module"`
- [x] 1.4 Añadir `jsr.json` con `name: "@arinspunk/atproto-comments"`, `version` y `exports`
- [x] 1.5 Añadir `tsconfig.json` (target ES2022, module ESNext, `declaration: true`)
- [x] 1.6 Añadir script de build con esbuild: produce `dist/index.js` (ESM) y `dist/index.umd.js` (UMD, IIFE autoregistrado)

## 2. Conversión a TypeScript

- [x] 2.1 Crear `src/index.ts` con la clase `AtprotoComments extends HTMLElement`
- [x] 2.2 Definir `static observedAttributes` para `thread-uri`, `appview`, `lang`, `max-depth`
- [x] 2.3 Implementar `connectedCallback` que valida `thread-uri` y lanza `load()`
- [x] 2.4 Validar formato AT URI (`at://` prefix); renderizar estado de error si es inválido o ausente
- [x] 2.5 Portar las utilidades puras: `formatRelativeTime`, `formatAbsoluteDate`, `getInitials`, `normalizeDomain`, `isValidDate`
- [x] 2.6 Portar el objeto `I18N` con strings en `pt` y `en`; resolver idioma desde atributo `lang` → `document.documentElement.lang` → `"en"`
- [x] 2.7 Portar los constructores DOM: `buildAvatarWrap`, `buildPlaceholder`, `buildFacetedText`
- [x] 2.8 Portar `buildAppPopover`, `buildAppButton`, `buildAppAction` (popover nativo + fallback)
- [x] 2.9 Portar `renderReply` (filtrado de blockedPost, hiddenReplies, labels) y `renderError`
- [x] 2.10 Portar `sortedReplies`, `hiddenUris`, `isHiddenByLabel`
- [x] 2.11 Implementar `load()` como método privado: fetch → renderiza lista o estado vacío + botón comentar
- [x] 2.12 Auto-registrar el elemento al final del módulo: `customElements.define('atproto-comments', AtprotoComments)` con guard para doble import
- [x] 2.13 Exportar nombrado `export { AtprotoComments }` para registro con nombre alternativo

## 3. CSS base

- [x] 3.1 Crear `src/atproto-comments.css` con las variables `--atproto-*` y sus defaults (ver spec D3)
- [x] 3.2 Reemplazar todas las referencias a variables del site (`--font-ui`, `--color-text-muted`, `--wada-blue`, `--cy-80`, etc.) por variables `--atproto-*` o valores literales
- [x] 3.3 Sustituir `font-family: var(--font-ui)` por `font-family: var(--atproto-font-family, system-ui, -apple-system, sans-serif)`
- [x] 3.4 Sustituir colores de placeholder (`--wada-blue`, `--cy-80`) por `--atproto-avatar-bg` y `--atproto-color-border`
- [x] 3.5 Verificar que el CSS no usa selectores de elemento sin clase (para evitar colisiones con el site del adopter)
- [x] 3.6 Copiar el CSS compilado a `dist/atproto-comments.css` en el step de build

## 4. Declaraciones TypeScript

- [x] 4.1 Añadir tipos para los datos de la API de Bluesky: `ThreadViewPost`, `PostView`, `ProfileViewBasic`, `Label`, `Facet`
- [x] 4.2 Verificar que `tsc --noEmit` pasa sin errores en source estricto (`strict: true`)
- [x] 4.3 Verificar que el bundle UMD se autoregistra al cargarse con `<script src>` (prueba manual en HTML vacío)

## 5. README

- [x] 5.1 Escribir sección de instalación: CDN (UMD + CSS), ESM import, uso en Lume/Astro/Next.js
- [x] 5.2 Documentar todos los atributos de configuración con tabla (thread-uri, appview, lang, max-depth)
- [x] 5.3 Documentar el contrato de theming: tabla de variables `--atproto-*` con sus defaults
- [x] 5.4 Añadir ejemplo de mapping de design tokens del site a variables `--atproto-*`
- [x] 5.5 Añadir nota sobre Next.js/SSR: necesita wrapper `'use client'` o carga del script en cliente

## 6. CI y publicación

- [x] 6.1 Añadir workflow de CI (`.github/workflows/ci.yml`): typecheck + build en cada PR y push a main
- [x] 6.2 Añadir workflow de release (`.github/workflows/release.yml`): se dispara en push de tag `v*`
- [x] 6.3 En el workflow de release: publicar en npm (`npm publish`) con `NPM_TOKEN` de secrets
- [x] 6.4 En el workflow de release: publicar en JSR (`deno publish`) con `DENO_DEPLOY_TOKEN` o OIDC
- [x] 6.5 En el workflow de release: crear GitHub Release automático con notas del tag

## 7. Migración en uso-ritual

- [x] 7.1 Eliminar `src/assets/js/atproto-comments.js`
- [x] 7.2 Convertir `src/assets/css/_atproto-comments.css` en fichero de mapping de tokens: asigna variables del site a `--atproto-*`
- [x] 7.3 Actualizar `src/_includes/layouts/post.vto`: sustituir `<section class="post-comments ...">` por `<atproto-comments thread-uri="...">`
- [x] 7.4 Añadir `<link rel="stylesheet">` y `<script type="module">` apuntando al CDN del paquete publicado (jsDelivr o esm.sh)
- [x] 7.5 Verificar en local que los comentarios cargan con el paquete externo
- [x] 7.6 Verificar que el CSS de mapping reproduce la integración visual actual del site
