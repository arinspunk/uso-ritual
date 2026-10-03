## MODIFIED Requirements

### Requirement: Bloque de comentarios desde el thread del post ancla

Cada página de post con post ancla SHALL mostrar un bloque que carga client-side, sin autenticación del visitante, los replies al post ancla desde la AppView configurada. Las páginas de posts sin post ancla SHALL NOT mostrar el bloque.

El bloque SHALL renderizar cada reply con marcado semántico: la lista raíz y las listas de sub-replies SHALL ser elementos `<ol>`, cada reply SHALL ser un elemento `<article>` dentro de un `<li>`, y los metadatos del autor SHALL estar dentro de un elemento `<header>`. El DOM generado SHALL NOT contener atributos `style` inline para la indentación.

Cada reply SHALL mostrar el avatar del autor como un elemento `<img>` con el atributo `loading="lazy"`. Cuando el autor no tenga avatar, el bloque SHALL mostrar un elemento placeholder con las iniciales del `displayName` (primera letra de cada palabra, máximo dos, usando iterador de grafemas), con fondo `--atproto-avatar-bg` y color de texto `--atproto-avatar-color`. Si `displayName` está vacío o ausente, SHALL usarse la primera letra del `handle`.

La fecha de cada reply SHALL mostrarse como tiempo relativo compacto según la tabla siguiente, usando el idioma del documento (`document.documentElement.lang`):

| Delta desde publicación | PT     | EN    |
|-------------------------|--------|-------|
| < 60 s                  | `agora`| `now` |
| < 3 600 s               | `{n} m`| `{n} m` |
| < 86 400 s              | `{n} h`| `{n} h` |
| < 2 592 000 s (30 d)    | `{n} d`| `{n} d` |
| < 31 536 000 s (365 d)  | `{n} me`| `{n} mo` |
| ≥ 31 536 000 s          | `dd/mm/aaaa` | `dd/mm/aaaa` |

El elemento `<time>` SHALL mantener el atributo `datetime` con la fecha ISO original y SHALL incluir el atributo `title` con la fecha absoluta formateada según el locale del documento.

El bloque SHALL implementarse mediante el custom element `<atproto-comments>` del paquete `@xulio/atproto-comments`. El template del post SHALL incluir el elemento con el atributo `thread-uri` calculado a partir del DID y el rkey del post ancla. El CSS del site SHALL mapear sus design tokens a las variables `--atproto-*` del paquete para mantener coherencia visual.

#### Scenario: Post con replies

- **WHEN** un visitante abre la página de un post cuyo post ancla tiene replies
- **THEN** los replies aparecen en orden cronológico con avatar, autor, tiempo relativo y texto, sin que el visitante tenga cuenta AT Protocol

#### Scenario: Avatar presente

- **WHEN** el autor de un reply tiene `author.avatar` definido
- **THEN** el reply muestra un elemento `<img>` con esa URL y el atributo `loading="lazy"`

#### Scenario: Avatar ausente

- **WHEN** el autor de un reply no tiene `author.avatar`
- **THEN** el reply muestra un placeholder con las iniciales del `displayName` con fondo `--atproto-avatar-bg` y texto `--atproto-avatar-color`

#### Scenario: Iniciales de displayName multipalabra

- **WHEN** el `displayName` del autor es `"Xúlio Zé"`
- **THEN** el placeholder muestra las iniciales `"XZ"`

#### Scenario: Iniciales de displayName una sola palabra

- **WHEN** el `displayName` del autor es `"Claude"`
- **THEN** el placeholder muestra la inicial `"C"`

#### Scenario: Tiempo relativo — minutos

- **WHEN** un reply fue publicado hace 5 minutos y el idioma del documento es PT
- **THEN** el elemento `<time>` muestra `5 m` y su atributo `title` contiene la fecha absoluta

#### Scenario: Tiempo relativo — meses en EN

- **WHEN** un reply fue publicado hace 3 meses y el idioma del documento es EN
- **THEN** el elemento `<time>` muestra `3 mo`

#### Scenario: Fecha absoluta para replies antiguos

- **WHEN** un reply fue publicado hace más de 365 días
- **THEN** el elemento `<time>` muestra la fecha en formato `dd/mm/aaaa`

#### Scenario: Marcado sin inline styles

- **WHEN** se renderizan replies con distintos niveles de anidado
- **THEN** ningún elemento del bloque contiene el atributo `style`

#### Scenario: Post sin replies o aún no indexado

- **WHEN** el thread no tiene replies o la AppView responde que el post no existe
- **THEN** el bloque muestra un estado vacío con el botón para comentar

#### Scenario: Botón "Comenta en" visible

- **WHEN** el bloque de comentarios está visible (con o sin replies)
- **THEN** se muestra un botón "Comenta en" que al activarse abre un popover con enlaces a Bluesky (`bsky.app`), Mu (`mu.social`) y Deer (`deer.social`), más una opción de dominio libre

#### Scenario: Botón "Responder" por reply

- **WHEN** el bloque renderiza uno o más replies
- **THEN** cada `<article>` de reply incluye un botón "Responder" que al activarse abre un popover con los mismos enlaces de app, apuntando al comentario específico (`/profile/<author-DID>/post/<reply-rkey>`)

#### Scenario: Popover abre la app correcta — post raíz

- **WHEN** el visitante abre el popover de "Comenta en" y hace clic en una app conocida
- **THEN** se abre `https://<dominio>/profile/<DID>/post/<rkey>` del post ancla en una pestaña nueva

#### Scenario: Popover abre la app correcta — reply

- **WHEN** el visitante abre el popover de "Responder" en un reply y hace clic en una app
- **THEN** se abre `https://<dominio>/profile/<author-DID>/post/<reply-rkey>` en una pestaña nueva

#### Scenario: Dominio personalizado

- **WHEN** el visitante escribe un dominio en el input "Otra app" de cualquier popover y confirma
- **THEN** se abre `https://<dominio-introducido>/profile/<…>/post/<…>` en una pestaña nueva

#### Scenario: Preferencia recordada entre visitas

- **WHEN** el visitante selecciona una app (conocida o dominio personalizado) en cualquier popover
- **THEN** esa preferencia se persiste en `localStorage` bajo la clave `atproto-preferred-app` y aparece resaltada en todos los popovers en visitas posteriores

#### Scenario: Replies ocultos o moderados

- **WHEN** un reply figura en `hiddenReplies` del threadgate o lleva un label de ocultación o de contenido adulto/gráfico
- **THEN** ese reply no se muestra

#### Scenario: El texto del reply no se interpreta como HTML

- **WHEN** un reply contiene texto con etiquetas HTML o scripts
- **THEN** el texto se muestra literalmente y no se ejecuta ni se interpreta

#### Scenario: Error de red

- **WHEN** la AppView no responde o devuelve un error
- **THEN** el bloque muestra un mensaje discreto y el resto de la página funciona con normalidad

#### Scenario: Post sin post ancla

- **WHEN** un visitante abre la página de un post con `anchor: false`
- **THEN** la página no incluye el bloque de comentarios
