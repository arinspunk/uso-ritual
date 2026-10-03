## Purpose

Paquete distribuible que implementa un Web Component (`<atproto-comments>`) para mostrar comentarios de Bluesky/AT Protocol en cualquier sitio web, independientemente del stack. Define el contrato de API (atributos HTML, CSS custom properties de theming, exports JS) y los requisitos de comportamiento del bloque de comentarios.

## Requirements

### Requirement: Registro del custom element

Al importar el módulo ESM SHALL registrarse el custom element `atproto-comments` en el `CustomElementRegistry` global. El módulo SHALL exportar también la clase `AtprotoComments` para permitir el registro con un nombre alternativo mediante `customElements.define(name, AtprotoComments)`. Si el elemento ya está registrado, la importación SHALL NOT lanzar un error.

#### Scenario: Importación registra el elemento

- **WHEN** un documento importa `import 'atproto-comments'`
- **THEN** `customElements.get('atproto-comments')` devuelve la clase del elemento

#### Scenario: Registro con nombre alternativo

- **WHEN** se importa `{ AtprotoComments }` y se llama `customElements.define('my-comments', AtprotoComments)`
- **THEN** el elemento funciona con el tag `<my-comments>` con el mismo comportamiento

#### Scenario: Doble importación sin error

- **WHEN** el módulo se importa dos veces en el mismo documento
- **THEN** no se lanza ningún error

---

### Requirement: Atributos de configuración

El elemento SHALL aceptar los siguientes atributos:

| Atributo | Requerido | Valor por defecto | Descripción |
|---|---|---|---|
| `thread-uri` | Sí | — | AT URI del post ancla (`at://did/app.bsky.feed.post/rkey`) |
| `appview` | No | `https://public.api.bsky.app` | URL base de la AppView |
| `lang` | No | `document.documentElement.lang` ó `"en"` | Código de idioma para i18n |
| `max-depth` | No | `6` | Profundidad máxima de replies a cargar |

Si `thread-uri` no está presente o su valor no tiene el formato `at://`, el elemento SHALL NOT realizar ninguna petición de red y SHALL renderizar un estado de error discreto.

#### Scenario: Atributo mínimo

- **WHEN** el elemento se declara con solo `thread-uri="at://did/app.bsky.feed.post/rkey"`
- **THEN** carga comentarios desde `https://public.api.bsky.app` con el idioma del documento y profundidad 6

#### Scenario: thread-uri ausente

- **WHEN** el elemento se declara sin el atributo `thread-uri`
- **THEN** no se realiza ninguna petición de red y el elemento muestra un mensaje de error interno no intrusivo

#### Scenario: thread-uri con formato inválido

- **WHEN** `thread-uri` es `"https://bsky.app/profile/foo"` (no es un AT URI)
- **THEN** no se realiza ninguna petición de red y el elemento muestra el estado de error

#### Scenario: Herencia de idioma del documento

- **WHEN** el atributo `lang` no está presente y `<html lang="pt">` está en el documento
- **THEN** el elemento usa las cadenas en PT

---

### Requirement: Comportamiento de carga y renderizado

El elemento SHALL iniciar la carga de comentarios al conectarse al DOM (`connectedCallback`). La carga SHALL ser asíncrona y SHALL NOT bloquear el renderizado del resto de la página.

El elemento SHALL renderizar los replies del thread con marcado semántico: la lista raíz y las listas de sub-replies SHALL ser elementos `<ol>`, cada reply SHALL ser un `<article>` dentro de un `<li>`, y los metadatos del autor SHALL estar dentro de un `<header>`. El DOM generado SHALL NOT contener atributos `style` inline.

Cada reply SHALL mostrar: avatar del autor (elemento `<img loading="lazy">`), nombre, handle, tiempo relativo (elemento `<time>` con `datetime` e `title` absoluto) y texto con facetas (links, menciones, hashtags) resueltas como elementos `<a>`.

Cuando el autor no tenga avatar, SHALL mostrarse un placeholder con las iniciales del `displayName` (primera letra de cada palabra, máximo dos, usando iterador de grafemas). Si `displayName` está vacío o ausente, SHALL usarse la primera letra del `handle`.

Cada reply SHALL incluir un botón "Responder" que abre un selector de app. El elemento SHALL mostrar siempre un botón principal "Comentar" que abre el mismo selector.

#### Scenario: Carga de replies

- **WHEN** el elemento se conecta al DOM con un `thread-uri` válido con replies
- **THEN** los replies aparecen en orden cronológico con avatar (o placeholder), autor, tiempo relativo y texto

#### Scenario: Thread vacío

- **WHEN** el thread no tiene replies o el post no existe en la AppView
- **THEN** el elemento muestra el botón "Comentar" y ninguna lista

#### Scenario: Error de red

- **WHEN** la AppView no responde o devuelve un error HTTP
- **THEN** el elemento muestra un mensaje de error discreto y el resto de la página funciona con normalidad

#### Scenario: Facetas resueltas

- **WHEN** un reply contiene una mención, un hashtag o un link en sus facetas
- **THEN** la parte correspondiente del texto se renderiza como `<a>` con `href` adecuado y `rel="noopener noreferrer"`

#### Scenario: Texto como nodos de texto

- **WHEN** un reply contiene texto con caracteres especiales HTML (`<`, `>`, `&`)
- **THEN** el texto se muestra literalmente y no se interpreta como HTML

---

### Requirement: Filtrado de replies

El elemento SHALL omitir replies que cumplan cualquiera de estas condiciones: figuran en `hiddenReplies` del threadgate, llevan un label de ocultación (`!hide`, `!no-promote`) o de contenido adulto/gráfico (`porn`, `sexual`, `graphic-media`, `nudity`), o son de tipo `app.bsky.feed.defs#blockedPost`.

#### Scenario: Reply en hiddenReplies

- **WHEN** un reply figura en `thread.threadgate.record.hiddenReplies`
- **THEN** ese reply no aparece en el bloque

#### Scenario: Reply con label adulto

- **WHEN** un reply lleva el label `porn`
- **THEN** ese reply no aparece en el bloque

---

### Requirement: Selector de app (popover)

El elemento SHALL incluir un selector de app que permita abrir un post o reply en Bluesky (`bsky.app`), Mu (`mu.social`), Deer (`deer.social`) o en un dominio personalizado introducido por el usuario. El selector SHALL persistir la preferencia del usuario en `localStorage` bajo la clave `atproto-preferred-app`.

En navegadores que soporten la API Popover SHALL usarse `popover=""` nativo. En navegadores sin soporte SHALL usarse un enlace directo a `bsky.app` como fallback.

#### Scenario: Selección de app conocida

- **WHEN** el usuario abre el selector y hace clic en una app conocida
- **THEN** se abre `https://<dominio-app>/profile/<did>/post/<rkey>` en una pestaña nueva

#### Scenario: Dominio personalizado válido

- **WHEN** el usuario escribe `mi-app.social` en el input y confirma
- **THEN** se abre `https://mi-app.social/profile/<did>/post/<rkey>` en una pestaña nueva

#### Scenario: Dominio personalizado inválido

- **WHEN** el usuario escribe un valor que no es un dominio válido y confirma
- **THEN** no se abre ninguna pestaña y el input indica error con `aria-invalid="true"`

#### Scenario: Preferencia persistida

- **WHEN** el usuario selecciona una app en el selector
- **THEN** esa preferencia aparece resaltada en visitas posteriores

#### Scenario: Fallback sin soporte popover

- **WHEN** el navegador no soporta la API Popover
- **THEN** el botón "Comentar" es un enlace directo a `https://bsky.app/profile/<did>/post/<rkey>` en pestaña nueva

---

### Requirement: Contrato de theming CSS

El elemento SHALL aplicar sus estilos usando únicamente custom properties del namespace `--atproto-*` como variables de entrada. El CSS base distribuido con el paquete SHALL proveer los siguientes defaults funcionales:

| Variable | Default |
|---|---|
| `--atproto-font-family` | `system-ui, -apple-system, sans-serif` |
| `--atproto-font-size` | `0.875rem` |
| `--atproto-color-text` | `inherit` |
| `--atproto-color-muted` | `oklch(50% 0 0)` |
| `--atproto-color-border` | `oklch(85% 0 0)` |
| `--atproto-color-surface` | `oklch(97% 0 0)` |
| `--atproto-avatar-size` | `2rem` |
| `--atproto-avatar-bg` | `oklch(60% 0.1 250)` |
| `--atproto-avatar-color` | `white` |

El elemento SHALL NOT usar custom properties sin prefijo `--atproto-` en su CSS, para evitar colisiones con el site del adopter.

#### Scenario: Sin customización

- **WHEN** un adopter incluye el elemento sin definir ninguna variable `--atproto-*`
- **THEN** el bloque es legible y funcional con los defaults del paquete

#### Scenario: Customización parcial

- **WHEN** un adopter define `--atproto-color-muted: #888` en su CSS
- **THEN** esa variable se aplica en todos los elementos que la usan, sin afectar el resto

#### Scenario: Sin colisión con variables del site

- **WHEN** el site del adopter define variables propias como `--color-text` o `--font-ui`
- **THEN** el elemento no usa esas variables y no se ve afectado por ellas

---

### Requirement: Distribución del paquete

El paquete SHALL publicarse en JSR (`@arinspunk/atproto-comments`) y en npm (`atproto-comments`) con versiones sincronizadas. Cada release SHALL incluir:

- Módulo ESM como punto de entrada principal (campo `module` / `exports["."]`)
- Bundle UMD minificado para uso vía `<script src>` desde CDN
- Archivo CSS base (`atproto-comments.css`)
- Declaraciones TypeScript (`.d.ts`)

El bundle UMD SHALL registrar el custom element automáticamente al cargarse y SHALL autocontenerse sin dependencias externas en runtime.

#### Scenario: Uso vía CDN

- **WHEN** un documento incluye `<script src="https://cdn.example/atproto-comments.umd.js">` y `<link rel="stylesheet" href=".../atproto-comments.css">`
- **THEN** `<atproto-comments thread-uri="...">` funciona sin ningún paso de build

#### Scenario: Uso vía import ESM

- **WHEN** un módulo hace `import 'atproto-comments'`
- **THEN** el custom element queda registrado y disponible en el documento

#### Scenario: Tipos disponibles

- **WHEN** un proyecto TypeScript importa `{ AtprotoComments } from 'atproto-comments'`
- **THEN** el compilador resuelve los tipos sin configuración adicional
