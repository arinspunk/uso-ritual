## Purpose

Capa AT Protocol del blog: identidad vinculada al dominio, publicación de cada post como documento Standard.site (`site.standard.document`) verificable desde el propio sitio, un post ancla en Bluesky (`app.bsky.feed.post`) por post e idioma, y visualización client-side de los replies a ese post ancla como comentarios.

## ADDED Requirements

### Requirement: Identificadores AT Protocol deterministas

El sistema SHALL asignar a cada par post-idioma un `rkey` con formato TID válido, calculado en tiempo de build de forma determinista a partir de `slug`, `lang` y el día UTC de `date`, según el algoritmo definido en design.md (D2). El mismo `rkey` SHALL usarse para el documento Standard.site y para el post ancla de ese par. El sistema SHALL NOT almacenar identificadores AT Protocol en el frontmatter ni en ningún almacenamiento externo al PDS.

#### Scenario: Mismos datos producen el mismo rkey

- **WHEN** se ejecutan dos builds con un post `slug=primeiro-post`, `lang=pt`, `date=2026-09-28`
- **THEN** ambos builds asignan el `rkey` `3mwmg4egpd2mi`

#### Scenario: Cada idioma tiene su propio rkey

- **WHEN** un post `primeiro-post` con `date=2026-09-28` existe en PT y en EN
- **THEN** la versión PT tiene `rkey=3mwmg4egpd2mi` y la versión EN tiene `rkey=3mwmajpazxbxw`

#### Scenario: La hora de la fecha no afecta al rkey

- **WHEN** el `date` de un post pasa de `2025-01-15` a `2025-01-15T18:30:00Z`
- **THEN** el `rkey` no cambia

#### Scenario: El rkey es un TID válido

- **WHEN** se calcula el `rkey` de cualquier post publicado
- **THEN** el valor tiene 13 caracteres del alfabeto base32-sortable y es aceptado como TID por la validación estándar de AT Protocol

#### Scenario: AT URIs derivados en build

- **WHEN** Lume genera la página de un post con `rkey=3mwmg4egpd2mi`
- **THEN** el AT URI del documento es `at://<DID>/site.standard.document/3mwmg4egpd2mi` y el del post ancla es `at://<DID>/app.bsky.feed.post/3mwmg4egpd2mi`

---

### Requirement: Manifiesto de sindicación

El sistema SHALL generar en cada build un fichero `/atproto/manifest.json` con el DID, los datos de la publicación y una entrada por cada post publicado y cada idioma. Cada entrada SHALL contener `rkey`, `slug`, `lang`, `title`, `description`, `path`, `url`, `publishedAt`, `updatedAt`, `tags`, `textContent` (texto plano sin Markdown) y `anchor` (booleano).

#### Scenario: Solo se incluyen posts publicados

- **WHEN** un post no tiene `date` o está marcado como borrador
- **THEN** el manifiesto no contiene ninguna entrada para ese post

#### Scenario: Marca de ancla según anchorSince

- **WHEN** `anchorSince` es `2026-10-01` y un post tiene `date=2026-09-15`
- **THEN** su entrada tiene `anchor: false`
- **AND** un post con `date=2026-10-02` tiene `anchor: true`

---

### Requirement: Verificación de identidad del dominio

El sistema SHALL servir en `/.well-known/atproto-did` el DID de la cuenta del blog como texto plano, para permitir que el dominio se use como handle de esa cuenta.

#### Scenario: Cliente AT Protocol resuelve el dominio

- **WHEN** un cliente hace GET a `https://usoritual.com/.well-known/atproto-did`
- **THEN** recibe HTTP 200, `Content-Type: text/plain` y el cuerpo `did:plc:t3q3ylsnsser3o74xz42sdqk`, sin redirecciones

---

### Requirement: Publicación Standard.site verificable

El sistema SHALL mantener en el PDS un registro `site.standard.publication` cuyo `url` es el origen del blog, y SHALL servir en `/.well-known/site.standard.publication` el AT URI de ese registro. Cada página de post SHALL incluir en su `<head>` una etiqueta `<link rel="site.standard.document">` con el AT URI de su documento.

#### Scenario: Verificación de la publicación

- **WHEN** un cliente hace GET a `https://usoritual.com/.well-known/site.standard.publication`
- **THEN** recibe HTTP 200, `Content-Type: text/plain` y el AT URI `at://<DID>/site.standard.publication/<publication.rkey>`

#### Scenario: Verificación del documento

- **WHEN** un cliente descarga la página de un post con `rkey=3mwmg4egpd2mi`
- **THEN** el `<head>` contiene `<link rel="site.standard.document" href="at://<DID>/site.standard.document/3mwmg4egpd2mi">`

---

### Requirement: Sincronización de documentos al PDS

Tras cada deploy de producción, el sistema SHALL asegurar que el PDS contiene un `site.standard.document` por cada entrada del manifiesto, con el `rkey` de la entrada, `site` apuntando a la publicación, y `title`, `path`, `description`, `publishedAt`, `tags` y `textContent` coincidentes con el manifiesto. El sistema SHALL escribir un documento solo si no existe o si sus campos gestionados difieren.

#### Scenario: Post nuevo

- **WHEN** termina un deploy de producción y el manifiesto contiene una entrada sin documento en el PDS
- **THEN** se crea el documento con el `rkey` de esa entrada

#### Scenario: Post sin cambios

- **WHEN** termina un deploy de producción y el documento de una entrada coincide con el manifiesto
- **THEN** no se realiza ninguna escritura para ese documento

#### Scenario: Post modificado

- **WHEN** el título o el contenido de un post publicado cambia y termina un deploy de producción
- **THEN** el documento existente se actualiza en el mismo `rkey` y no se crea ningún registro adicional

#### Scenario: Post bilingüe

- **WHEN** un post existe en PT y en EN
- **THEN** el PDS contiene dos documentos independientes, cada uno con el `rkey` de su idioma

---

### Requirement: Post ancla en Bluesky

Para cada entrada con `anchor: true`, el sistema SHALL crear un `app.bsky.feed.post` con el `rkey` de la entrada, cuyo texto es el título del post, con `langs` igual al idioma, un embed `app.bsky.embed.external` con la URL canónica, y `createdAt` igual al momento de creación. El sistema SHALL NOT modificar un post ancla existente. El documento de la entrada SHALL incluir `bskyPostRef` con el `uri` y el `cid` del post ancla.

#### Scenario: Creación del post ancla

- **WHEN** la sindicación procesa una entrada con `anchor: true` sin post ancla en el PDS
- **THEN** se crea el post ancla con el `rkey` de la entrada y el documento de esa entrada referencia su `uri` y `cid` en `bskyPostRef`

#### Scenario: El post ancla existente no se reescribe

- **WHEN** la sindicación procesa una entrada cuyo post ancla ya existe, aunque el título del post haya cambiado
- **THEN** el post ancla no se modifica y su CID se mantiene

#### Scenario: Posts anteriores a anchorSince

- **WHEN** la sindicación procesa una entrada con `anchor: false`
- **THEN** no se crea post ancla y el documento no incluye `bskyPostRef`

#### Scenario: El post ancla no aparece como retrofechado

- **WHEN** se crea el post ancla de un post cuyo `date` es de hace más de 24 horas
- **THEN** su `createdAt` es el momento de creación y no la fecha del post

---

### Requirement: Ejecución robusta de la sindicación

La sindicación SHALL ejecutarse solo tras deploys de producción, SHALL leer el manifiesto del propio deploy que la dispara, y SHALL ser idempotente ante reintentos y fallos parciales.

#### Scenario: Deploy preview o branch deploy

- **WHEN** termina un deploy que no es de producción
- **THEN** la función termina sin escribir en el PDS

#### Scenario: Fallo en una entrada

- **WHEN** falla la escritura de una entrada
- **THEN** el error se registra en los logs de la función y las demás entradas se procesan igualmente

#### Scenario: Fallo de autenticación

- **WHEN** falla `createSession` o el PDS no responde en el tiempo límite
- **THEN** la función registra el error y termina sin escrituras; el sitio desplegado no se ve afectado

#### Scenario: Reintento tras una ejecución interrumpida

- **WHEN** una ejecución anterior creó el post ancla de una entrada pero no llegó a escribir su documento
- **THEN** la siguiente ejecución reutiliza el post ancla existente, escribe el documento con su `bskyPostRef` y no crea un segundo post ancla

---

### Requirement: Bloque de comentarios desde el thread del post ancla

Cada página de post con post ancla SHALL mostrar un bloque que carga client-side, sin autenticación del visitante, los replies al post ancla desde la AppView configurada. Las páginas de posts sin post ancla SHALL NOT mostrar el bloque.

#### Scenario: Post con replies

- **WHEN** un visitante abre la página de un post cuyo post ancla tiene replies
- **THEN** los replies aparecen en orden cronológico, con autor, fecha y texto, sin que el visitante tenga cuenta AT Protocol

#### Scenario: Post sin replies o aún no indexado

- **WHEN** el thread no tiene replies o la AppView responde que el post no existe
- **THEN** el bloque muestra un estado vacío con el enlace para comentar

#### Scenario: Enlace para comentar

- **WHEN** el visitante hace clic en el enlace para comentar
- **THEN** llega a `https://bsky.app/profile/<DID>/post/<rkey>`, donde puede responder con cualquier cuenta compatible (Bluesky, Mu, etc.)

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
