## Context

El blog es un sitio estático generado con Lume (Deno) y desplegado en Netlify en `https://usoritual.com`. Los posts son bilingües: las versiones PT se sirven en la raíz (`/<slug>/`) y las EN bajo `/en/` (`/en/<slug>/`), con slugs propios en cada idioma (ej. `/bem-vinda/` y `/en/welcome/`). Declaran `title`, `date`, `lang` y `slug` en el frontmatter (spec `blog/posts`). Ver proposal.md para la motivación.

**Estado del sitio (2026-09-30):** la opción `location` de Lume apunta todavía a `https://uso-ritual.netlify.app/`, así que los enlaces de los feeds RSS usan ese dominio. Las URLs canónicas del manifiesto y la verificación de Standard.site exigen que apunte a `https://usoritual.com` (tarea 1.0). Además, el contenido publicado es de ejemplo, y no debe sindicarse (ver Migration Plan).

**Cuenta AT Protocol** (verificado el 2026-09-30 contra `plc.directory`):

| Dato | Valor |
|---|---|
| DID | `did:plc:t3q3ylsnsser3o74xz42sdqk` |
| Handle actual | `usoritual.eurosky.social` |
| PDS (`serviceEndpoint`) | `https://eurosky.social` (no `api.eurosky.social`) |

**Restricciones del protocolo que condicionan el diseño:**

- El PDS de referencia exige que el `rkey` de `app.bsky.feed.post` sea un TID; un `rkey` como `primeiro-post-pt` se rechaza con `400 InvalidRequest (Invalid TID string)`.
- Los Lexicons `site.standard.document` y `site.standard.publication` declaran también `"key": "tid"` (comprobado en los registros `com.atproto.lexicon.schema` publicados por `did:plc:re3ebnp5v7ffagz6rb6xfei4`).
- Bluesky marca como retrofechado ("archivado") un post cuyo `createdAt` es más de 24 h anterior al momento de indexación.
- Bluesky no soporta la edición de posts; los replies referencian a su raíz y a su padre mediante strongRef (URI + CID), así que reescribir un post cambia su CID y deja las referencias apuntando a una versión inexistente.

**Viabilidad verificada (2026-09-30):** en el repositorio de soporte de Eurosky hay un issue abierto desde el 2026-04-23 (`eurosky-social/tech-support#20`) que reporta timeouts en `com.atproto.server.createSession` con app passwords. Con esta cuenta, `createSession` respondió en 0,79 s (tarea 0.1).

## Goals / Non-Goals

**Goals:**
- Publicar cada post como documento Standard.site verificable (`.well-known` + etiqueta `<link>`).
- Identificadores deterministas calculados en build, sin estado fuera del PDS y sin escribir en el repositorio.
- Sindicación idempotente y tolerante a fallos parciales: reintentar nunca duplica registros.
- Escribir en el PDS solo cuando algo cambia.
- Comentarios leídos client-side sin autenticación del visitante.
- No modificar el flujo de build de Lume salvo para generar ficheros adicionales.

**Non-Goals:**
- Definir un Lexicon propio (`com.usoritual.*`).
- Publicar en WhiteWind (`com.whtwnd.blog.entry`) en esta iteración. Se podría añadir después reutilizando el mismo `rkey`.
- Sincronización bidireccional (AT Protocol → blog).
- Borrar automáticamente del PDS los registros de posts eliminados del blog (se hace a mano).
- Moderar comentarios en el propio blog, más allá de respetar `hiddenReplies` y los labels de Bluesky.
- Autenticación OAuth: la función es headless y usa app password.
- Proxy o caché propia de comentarios (ver Open Questions).

## Decisions

### D1: Standard.site como Lexicon de publicación

**Decisión:** Publicar un registro `site.standard.publication` para el blog y un `site.standard.document` por post e idioma.

**Razón:** Standard.site es hoy el conjunto de Lexicons de publicación de largo formato con más adopción en el ecosistema (Leaflet, pckt, Offprint, GreenGale, entre otros) y tiene un modelo de verificación basado en ficheros estáticos que encaja con un sitio generado. `site.standard.document` incluye `bskyPostRef` (strongRef a un post de Bluesky), pensado precisamente para enlazar el documento con su conversación.

Campos usados en el documento: `site` (AT URI de la publicación), `title`, `path`, `description`, `publishedAt`, `updatedAt` (si existe), `tags`, `textContent` (texto plano, sin Markdown) y `bskyPostRef`.

**Alternativa descartada:** `com.whtwnd.blog.entry` como formato principal. Varias plataformas ya lo tratan como formato legado de solo lectura, no tiene campo para enlazar con el thread de Bluesky y también declara `key: tid`, así que no simplifica nada.

**Alternativa descartada:** Lexicon propio. Supone coste de diseño y ninguna app que lo lea.

### D2: `rkey` = TID determinista derivado de `slug`, `lang` y `date`

**Decisión:** Cada par post-idioma tiene un único `rkey` con formato TID, calculado así:

1. `key = "<slug>-<lang>"` (ej. `primeiro-post-pt`).
2. `h = SHA-256(UTF-8(key))`.
3. `offsetUs = uint64_be(h[0..8]) mod 86_400_000_000` (microsegundos dentro del día).
4. `clockId = uint16_be(h[8..10]) & 0x3FF` (10 bits).
5. `dayStartUs` = inicio del día UTC de `date`, en microsegundos desde epoch.
6. `tid = base32sortable((dayStartUs + offsetUs) << 10 | clockId)`, con 13 caracteres, alfabeto `234567abcdefghijklmnopqrstuvwxyz` y relleno con `2` a la izquierda.

El mismo `rkey` se usa en `site.standard.document` y en `app.bsky.feed.post`. Es el patrón "sidecar" que el propio Bluesky usa entre `app.bsky.feed.post` y `app.bsky.feed.threadgate`.

**Vectores de prueba** (validados contra `TID.fromTime` de `@atproto/common-web` e `isValidTid` / `isValidRecordKey` de `@atproto/syntax`):

| slug | lang | date | rkey |
|---|---|---|---|
| `primeiro-post` | `pt` | `2026-09-28` | `3mwmg4egpd2mi` |
| `primeiro-post` | `en` | `2026-09-28` | `3mwmajpazxbxw` |
| `nuevo-disco` | `pt` | `2025-01-15T18:30:00Z` | `3lfqjhcifbbqb` |

**Razón:** El resultado es un TID sintácticamente válido, que cumple el `key: tid` de todos los Lexicons implicados. Es reproducible en build sin estado, y la versión de cada post y cada idioma obtiene un identificador distinto. Usar solo el día de `date` hace que el resultado no dependa de si el frontmatter incluye hora. La probabilidad de colisión es despreciable: hacen falta dos claves con el mismo día y los mismos 63 bits derivados del hash.

La implementación vive en un único módulo (`src/_lib/atproto-tid.ts`) basado en Web Crypto y `BigInt`, y solo se ejecuta en el build. La función no recalcula nada: lee los `rkey` del manifiesto (D3).

**Riesgos:** Si cambia el `slug`, el `lang` o el día de `date` de un post, cambia su identidad: aparece un documento y un post ancla nuevos, y los comentarios del anterior quedan en el thread viejo. Es aceptable porque por convención esos campos son inmutables una vez publicado. Verificado el 2026-09-30 (tareas 0.2 y 0.3): el PDS de Eurosky acepta TIDs con timestamp pasado en `app.bsky.feed.post` y en `site.standard.document`, con el mismo rkey en ambas colecciones, y la AppView de Bluesky indexa el post con normalidad.

**Alternativa descartada:** `rkey = <slug>-<lang>`. El PDS lo rechaza para posts y viola los Lexicons de Standard.site.

**Alternativa descartada:** TID aleatorio más mapeo persistido. Obliga a escribir estado en el repositorio (round-trip desde la función) o a resolverlo en runtime en cada visita.

### D3: Manifiesto generado por Lume como fuente de la función

**Decisión:** Lume genera `/atproto/manifest.json` con:

```json
{
  "did": "did:plc:t3q3ylsnsser3o74xz42sdqk",
  "publication": { "rkey": "3mwquheqy7222", "url": "https://usoritual.com", "name": "Uso Ritual", "description": "Música e outros relatos" },
  "entries": [
    {
      "rkey": "3mwmg4egpd2mi",
      "slug": "primeiro-post",
      "lang": "pt",
      "title": "…",
      "description": "…",
      "path": "/primeiro-post/",
      "url": "https://usoritual.com/primeiro-post/",
      "publishedAt": "2026-09-28T00:00:00.000Z",
      "updatedAt": null,
      "tags": [],
      "textContent": "…",
      "anchor": true
    }
  ]
}
```

`path` es la URL de la página generada por Lume (`page.data.url`): PT en la raíz y EN bajo `/en/`. `url` es `publication.url` + `path`.

Solo incluye posts publicados (con `date` y sin marca de borrador). `textContent` es el cuerpo convertido a texto plano. Los datos ya son públicos en el propio blog.

**Razón:** El RSS contiene HTML o extractos en lugar del cuerpo, puede estar limitado a los últimos N posts y obligaría a extraer `slug` y `lang` de las URLs. El manifiesto es una salida más del build: no requiere token de GitHub, concentra el cálculo de identificadores en un solo sitio y hace que la función sea un simple "aplicador" de estado deseado.

**Alternativa descartada:** RSS como fuente, por los motivos anteriores.

### D4: Netlify Function (Node) con handler `deploySucceeded`

**Decisión:** La función vive en `netlify/functions/atproto-syndicate.mts`, con un `export default` que declara el handler tipado `deploySucceeded(event: DeploySucceededEvent)` de `@netlify/functions`. Los handlers de eventos de plataforma se ejecutan siempre en background, con hasta 15 minutos de ejecución.

- **Runtime:** Node, no Deno. Los secretos se leen con `Netlify.env.get(...)`.
- **Contexto:** la función termina sin escribir si `event.deploy.context !== "production"`, porque `deploy-succeeded` también se dispara en deploy previews y branch deploys.
- **Fuente del manifiesto:** se lee de `event.deploy.permalinkUrl` (URL permanente del propio deploy), no de `URL`. Así se evitan carreras con la caché del CDN y deploys bloqueados que no llegan a publicarse.

Campos verificados en el tipo `DeploySucceededEvent` de `@netlify/functions@6.0.1` (`{ deploy: Deploy, site: DeploySite }`). El tipo declara `context` como `string` sin enumerar sus valores, así que la función registra `context` en cada ejecución para confirmar el literal en producción.
- **PDS:** se resuelve en cada ejecución desde el DID document (`https://plc.directory/<did>` → `serviceEndpoint` del servicio `#atproto_pds`). `ATPROTO_PDS_URL` permite forzarlo si hace falta.
- **Autenticación:** `com.atproto.server.createSession` con `identifier = DID` (estable aunque cambie el handle) y `password = ATPROTO_APP_PASSWORD`, con timeout explícito de 15 s.
- **Cliente HTTP:** `fetch` directo contra XRPC, sin SDK. El volumen de llamadas es pequeño y evita dependencias pesadas.

**Alternativa descartada:** registrar el evento en `netlify.toml`. Ese mecanismo no existe; los eventos se asocian por el handler tipado o por el nombre del fichero (`deploy-succeeded-background.mts`, que sigue siendo válido como plan B).

**Alternativa descartada:** Build plugin. Podría leer el manifiesto del disco, pero el post ancla debe crearse cuando la página ya está online, para que la tarjeta de enlace se resuelva.

### D5: Algoritmo de sincronización

Para cada deploy de producción:

1. **Publicación:** `getRecord(site.standard.publication, publication.rkey)`. Si no existe o difiere en los campos gestionados, `putRecord`.
2. **Por cada entrada** del manifiesto, de forma independiente:
   1. Si `anchor = true`: `getRecord(app.bsky.feed.post, rkey)`. Si no existe, `createRecord` con ese `rkey` (D6). En ambos casos se obtiene `{uri, cid}`. **Un post ancla existente nunca se modifica.**
   2. Se construye el documento deseado, con `bskyPostRef = {uri, cid}` si hay ancla. `getRecord(site.standard.document, rkey)`: si no existe o difiere en los campos gestionados, `putRecord`; si es igual, no se escribe.
3. Al terminar se registra un resumen: creados, actualizados, sin cambios y errores.

**Tolerancia a fallos:** El ancla se crea antes del documento. Si la ejecución se interrumpe entre ambos pasos, la siguiente encuentra el ancla existente y completa el documento, sin duplicados, porque el `rkey` es determinista y `createRecord` sobre un `rkey` existente falla en lugar de duplicar. Un error en una entrada se registra y no detiene las demás. Un error de autenticación aborta la ejecución con log; el deploy ya se ha publicado y no se ve afectado.

**Rate limits:** Como solo se escribe cuando hay cambios, un deploy típico hace lecturas y cero o pocas escrituras, muy por debajo de los límites de escritura del PDS. El primer deploy (backfill) es el único con volumen, acotado por D7.

### D6: Contenido del post ancla

```json
{
  "$type": "app.bsky.feed.post",
  "text": "<título, truncado a 300 grafemas>",
  "langs": ["<lang>"],
  "createdAt": "<momento de creación>",
  "embed": {
    "$type": "app.bsky.embed.external",
    "external": { "uri": "<url canónica>", "title": "<título>", "description": "<descripción>" }
  }
}
```

**Razón:** `createdAt` es el momento real de creación y no la fecha del post, para evitar el indicador de post retrofechado. La URL va en el embed y no en el texto, así que no hacen falta `facets` (que exigirían calcular offsets en bytes UTF-8). La miniatura de la tarjeta (blob) queda fuera de esta iteración.

### D7: Backfill controlado con `anchorSince`

**Decisión:** `_data/atproto.yml` define `anchorSince` (fecha ISO). Solo las entradas con `publishedAt >= anchorSince` llevan `anchor: true`. Las anteriores reciben documento Standard.site pero no post ancla, y su página no muestra bloque de comentarios.

**Razón:** Evita publicar de golpe dos posts por cada entrada del archivo en el timeline de los seguidores. Retroceder `anchorSince` es un backfill deliberado y reversible.

### D8: Verificación de identidad y de publicación

- `/.well-known/site.standard.publication` devuelve `at://<DID>/site.standard.publication/<publication.rkey>`. Lo genera Lume desde `_data`.
- Todas las páginas incluyen `<link rel="site.standard.publication" href="<AT URI publicación>">`. Las páginas de post incluyen además `<link rel="site.standard.document" href="at://<DID>/site.standard.document/<rkey>">`.
- `/.well-known/atproto-did` devuelve el DID en texto plano. **Solo tiene efecto si el handle de la cuenta se cambia al dominio**, y el cambio se hace explícitamente desde los ajustes de la app (`com.atproto.identity.updateHandle`). Todas las URLs que genera el blog usan el DID y no el handle, así que el cambio no rompe nada.
- Ambos ficheros `.well-known` se sirven con `Content-Type: text/plain` mediante cabeceras explícitas en `netlify.toml`. Lume ignora los directorios que empiezan por punto, así que se copian con `site.copy`.

Las etiquetas `<link>` se publican antes de que el registro exista en el PDS, porque la sindicación ocurre después del deploy. Es inocuo: el AT URI es determinista y los consumidores de Standard.site re-verifican periódicamente.

### D9: Comentarios client-side

El layout de post (solo cuando `anchor = true`) renderiza un contenedor con:

- `data-thread-uri="at://<DID>/app.bsky.feed.post/<rkey>"`
- `data-post-url="https://bsky.app/profile/<DID>/post/<rkey>"`
- `data-appview="<appview>"` (por defecto `https://public.api.bsky.app`)

El script llama a `<appview>/xrpc/app.bsky.feed.getPostThread?uri=<thread-uri>&depth=6&parentHeight=0` y:

- Renderiza los replies como árbol, en orden cronológico, con autor (`displayName`, `@handle`), fecha y texto.
- Inserta el texto siempre como nodos de texto (`textContent`), nunca como HTML. De las facets solo convierte en enlace las de tipo link con esquema `http`/`https`.
- Omite los replies listados en `threadgate.record.hiddenReplies` y los que llevan labels de ocultación o de contenido adulto/gráfico.
- Trata `notFoundPost` como estado vacío, porque suele ser latencia de indexación. `blockedPost` y los errores de red muestran un mensaje discreto sin romper el layout.

**Razón:** Los replies viven en los PDS de quien responde; reconstruir el thread requiere un indexador suscrito al relay, y la AppView de Bluesky es hoy la más completa. El endpoint es un dato de configuración: cualquier AppView que implemente `app.bsky.feed.getPostThread` sirve sin cambiar datos ni Lexicons.

### D10: Configuración

`_data/atproto.yml` (público, versionado):

```yaml
did: did:plc:t3q3ylsnsser3o74xz42sdqk
publication:
  rkey: 3mwquheqy7222   # TID generado una vez; no cambiar
  url: https://usoritual.com   # sin barra final
  name: "Uso Ritual"
  description: "Música e outros relatos"
appview: https://public.api.bsky.app
anchorSince: 2099-01-01   # fase 1: sin posts ancla; se fija la fecha real en la tarea 6.4
```

Variables de entorno en Netlify (scope **Functions**, no Builds):

- `ATPROTO_APP_PASSWORD` (secreto): app password dedicada a la sindicación.
- `ATPROTO_PDS_URL` (opcional): fuerza el endpoint del PDS.
- `ATPROTO_DRY_RUN` (opcional): si vale `true`, la función registra lo que haría sin escribir.

El DID no es secreto y vive en `_data`, así que no hace falta `ATPROTO_DID` como variable de entorno.

## Risks / Trade-offs

**[Riesgo] Autenticación con Eurosky** → El issue `tech-support#20` reporta timeouts en `createSession` para otras cuentas. Con esta cuenta funciona (tarea 0.1), pero una regresión en Eurosky dejaría la sindicación sin efecto hasta resolverse. Mitigación: timeout explícito y log de error; los documentos se completan en el siguiente deploy.

**[Riesgo] Disponibilidad del PDS** → Si el PDS falla, la sindicación se registra como fallida y se completa en el siguiente deploy de producción. El blog no se ve afectado.

**[Riesgo] Dependencia del relay y de la AppView de Bluesky** → Es estructural en AT Protocol para reconstruir threads entre PDS. Si fallan, el bloque de comentarios muestra error sin afectar al resto de la página. El endpoint es configurable.

**[Riesgo] Latencia de indexación** → Un post ancla recién creado puede tardar en aparecer en la AppView. El script trata `notFoundPost` como estado vacío.

**[Riesgo] Cambio de identidad de un post** → Cambiar `slug`, `lang` o el día de `date` genera registros nuevos y deja huérfanos los anteriores, con sus comentarios. Mitigación: convención de inmutabilidad; limpieza manual de huérfanos.

**[Trade-off] Un thread por idioma** → Las versiones PT y EN tienen conversaciones separadas. Es coherente con `langs` y con audiencias distintas, pero fragmenta los comentarios.

**[Trade-off] Comentar requiere cuenta AT Protocol** → Los lectores sin cuenta solo pueden leer.

**[Trade-off] Privacidad** → La carga client-side envía la IP del visitante a la AppView de Bluesky (EE. UU.). Ver Open Questions.

## Migration Plan

0. **Spike de viabilidad** (tareas 0.x). Completado el 2026-09-30 sin incidencias.
**Precondición:** antes del paso 3, el sitio debe tener `location` en `https://usoritual.com` y el contenido de ejemplo actual (post de bienvenida con texto ficticio) debe estar eliminado o marcado como borrador. Si no, la fase 1 publicaría esos posts como documentos públicos en el PDS.

1. Desplegar la configuración, el módulo de TID, el manifiesto, los ficheros `.well-known` y las etiquetas `<link>`. No tiene efectos visibles.
2. Añadir en Netlify, como `ATPROTO_APP_PASSWORD` (scope Functions), la app password creada en el spike (tarea 0.1).
3. Desplegar la función con `anchorSince` en el futuro: se crean la publicación y los documentos, sin posts ancla. Verificar los registros en el PDS.
4. Fijar `anchorSince` en la fecha deseada y desplegar: se crean los posts ancla y aparece el bloque de comentarios en esos posts.
5. Cambiar el handle al dominio, cuando se desee.

**Rollback:** Eliminar la función y el bloque de comentarios. Los registros del PDS son inocuos si la función deja de ejecutarse y se pueden borrar a mano. Para volver al handle anterior basta con cambiarlo de nuevo en los ajustes de la cuenta.

## Open Questions

- **Proxy de comentarios:** ¿servir los threads a través de una función o edge function propia con caché, para no exponer la IP del visitante a terceros y amortiguar caídas y rate limits? Queda fuera de esta iteración; el diseño lo permite cambiando `appview`.
- **WhiteWind:** ¿publicar también `com.whtwnd.blog.entry` con el mismo `rkey` para aparecer en su interfaz?
- **Thread único por post:** si la fragmentación por idioma resulta molesta, ¿un único post ancla bilingüe? Implicaría compartir `rkey` entre idiomas y cambiar D2.
