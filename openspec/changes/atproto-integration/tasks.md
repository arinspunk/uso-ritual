## 0. Spike de viabilidad (bloqueante)

- [x] 0.1 Crear una app password en Mu o Bluesky (Ajustes → Privacidad y seguridad → App passwords) y probar `POST https://eurosky.social/xrpc/com.atproto.server.createSession` con `identifier=did:plc:t3q3ylsnsser3o74xz42sdqk`. Debe responder con `accessJwt` en pocos segundos. Si da timeout (ver `eurosky-social/tech-support#20`), detener el change y comentar en ese issue. Resultado (2026-09-30): sesión creada en 0,79 s; el problema del issue no afecta a esta cuenta.
- [x] 0.2 Con la sesión anterior, crear con `com.atproto.repo.createRecord` un `app.bsky.feed.post` de prueba con `rkey=3lfqjhcifbbqb` (TID del 2025-01-15, vector de design.md D2). Comprobar que el PDS lo acepta y que `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://did:plc:t3q3ylsnsser3o74xz42sdqk/app.bsky.feed.post/3lfqjhcifbbqb` lo devuelve en unos minutos. Después, borrarlo con `deleteRecord`. Si falla, reabrir D2. Resultado (2026-09-30): ejecutada con el rkey exclusivo de prueba `3lfreegi652sl` (TID del 2025-01-15) en lugar del vector de D2, para no reservar el identificador de un post real. PDS: `validationStatus: valid`; AppView: indexado a los pocos minutos. Registro borrado tras la prueba.
- [x] 0.3 Repetir 0.2 con un `site.standard.document` de prueba y borrarlo. Resultado (2026-09-30): aceptado con el mismo rkey que el post (`validationStatus: unknown`, esperado porque el PDS no conoce el Lexicon).
- [x] 0.4 Revisar el tipo `DeploySucceededEvent` de `@netlify/functions` y anotar el campo exacto del contexto del deploy (producción/preview) y el de su URL permanente. Resultado (`@netlify/functions@6.0.1`): `event.deploy.context` y `event.deploy.permalinkUrl`; el handler `deploySucceeded` existe en el tipo `NetlifyFunction`.

## 1. Configuración e identificadores

- [x] 1.0 Cambiar la opción `location` de Lume en `_config.ts` de `https://uso-ritual.netlify.app/` a `https://usoritual.com/` y comprobar tras el deploy que los enlaces de `/pt/feed.xml` y `/en/feed.xml` usan el dominio nuevo.
- [x] 1.1 Crear `_data/atproto.yml` con `did`, `publication` (`rkey: 3mwquheqy7222`, `url: https://usoritual.com`, `name: "Uso Ritual"`, `description: "Música e outros relatos"`), `appview: https://public.api.bsky.app` y `anchorSince` en una fecha futura (se ajusta en 6.4).
- [x] 1.2 Implementar `src/_lib/atproto-tid.ts` con el algoritmo de D2, usando Web Crypto (`crypto.subtle.digest`) y `BigInt`.
- [x] 1.3 Añadir tests (`deno test`) con los tres vectores de D2 y una comprobación de formato (13 caracteres del alfabeto base32-sortable, primer carácter en `234567abcdefghij`).
- [x] 1.4 Registrar en `_config.ts` filtros o helpers para los templates: `atprotoRkey(slug, lang, date)`, `atprotoDocUri(rkey)`, `atprotoPostUri(rkey)` y `bskyPostUrl(rkey)` (con el DID, no con el handle).

## 2. Verificación

- [x] 2.1 Crear `src/.well-known/atproto-did` con el DID y añadir `site.copy(".well-known")` en `_config.ts` (Lume ignora los directorios que empiezan por punto).
- [x] 2.2 Generar `/.well-known/site.standard.publication` desde `_data` (página de Lume con `url` explícita) con el AT URI de la publicación.
- [x] 2.3 Añadir en `netlify.toml` cabeceras `Content-Type: text/plain; charset=utf-8` para `/.well-known/atproto-did` y `/.well-known/site.standard.publication`.
- [x] 2.4 Añadir `<link rel="site.standard.publication">` al layout base y `<link rel="site.standard.document">` al layout de post (`src/_includes/layouts/post.vto`).
- [ ] 2.5 Tras el deploy, comprobar con `curl -i` que ambos endpoints responden 200, `text/plain` y el valor correcto, sin redirecciones.

## 3. Manifiesto

- [x] 3.1 Crear la página del manifiesto (p. ej. `src/atproto-manifest.page.ts` con `url: "/atproto/manifest.json"`) que recorre los posts publicados y emite la estructura de D3.
- [x] 3.2 Generar `textContent` convirtiendo el cuerpo a texto plano (sin Markdown ni HTML).
- [x] 3.3 Excluir posts sin `date` o marcados como borrador.
- [x] 3.4 Calcular `anchor` comparando `publishedAt` con `anchorSince`.
- [x] 3.5 Verificar en un build local que el manifiesto contiene los `rkey` esperados para posts conocidos.

## 4. Netlify Function de sindicación

- [x] 4.1 Añadir `@netlify/functions` como dependencia de desarrollo y crear `netlify/functions/atproto-syndicate.mts` con `export default { deploySucceeded(event) { … } }`. Plan B si el handler tipado no está disponible: renombrar el fichero a `deploy-succeeded-background.mts`.
- [x] 4.2 Terminar sin escribir si `event.deploy.context !== "production"`. Registrar el valor de `context` en cada ejecución para confirmar el literal.
- [x] 4.3 Descargar el manifiesto desde `${event.deploy.permalinkUrl}/atproto/manifest.json` (no desde `URL`).
- [x] 4.4 Resolver el PDS desde `https://plc.directory/<did>` (`serviceEndpoint` de `#atproto_pds`), con override opcional `ATPROTO_PDS_URL`.
- [x] 4.5 Autenticar con `createSession` (`identifier` = DID, `password` = `Netlify.env.get("ATPROTO_APP_PASSWORD")`) con timeout de 15 s mediante `AbortSignal.timeout`.
- [x] 4.6 Sincronizar el registro de publicación: `getRecord` y `putRecord` solo si difiere.
- [x] 4.7 Para entradas con `anchor: true`: `getRecord` del post ancla y, si no existe, `createRecord` con el `rkey` de la entrada y el contenido de D6. Nunca actualizar un ancla existente.
- [x] 4.8 Construir el documento deseado (con `bskyPostRef` si hay ancla), compararlo con `getRecord` en los campos gestionados y hacer `putRecord` solo si difiere.
- [x] 4.9 Capturar errores por entrada (registrar y continuar) y emitir al final un resumen: creados, actualizados, sin cambios y errores.
- [x] 4.10 Implementar `ATPROTO_DRY_RUN=true` (registra las escrituras previstas sin ejecutarlas).
- [ ] 4.11 Añadir `ATPROTO_APP_PASSWORD` en Netlify con scope Functions (no Builds).
- [ ] 4.12 Probar localmente con `netlify dev` y un evento simulado, primero en dry run.

## 5. Bloque de comentarios

- [x] 5.1 En `post.vto`, renderizar el contenedor solo si `anchor` es verdadero, con `data-thread-uri`, `data-post-url` y `data-appview`, y cargar el script con `defer`.
- [x] 5.2 Crear `src/assets/js/atproto-comments.js`: llamada a `getPostThread` (`depth=6`, `parentHeight=0`) contra `data-appview`.
- [x] 5.3 Manejar los tipos de nodo `threadViewPost`, `notFoundPost` (estado vacío) y `blockedPost` (omitir).
- [x] 5.4 Renderizar los replies como árbol, en orden cronológico, con autor (`displayName` y `@handle`), fecha localizada y texto insertado con `textContent`. Convertir en enlace solo las facets de tipo link con esquema `http`/`https`.
- [x] 5.5 Omitir replies en `threadgate.record.hiddenReplies` y replies con labels de ocultación o de contenido adulto/gráfico.
- [x] 5.6 Estado vacío con enlace "Comentar en Bluesky" (`data-post-url`) y estado de error discreto que no rompe el layout.
- [x] 5.7 Probar con un reply que contenga `<script>` y comprobar que se muestra literalmente.

## 6. Despliegue por fases y validación

- [x] 6.0 Precondición: eliminar o marcar como borrador el contenido de ejemplo (posts de bienvenida con texto ficticio) y confirmar que el manifiesto solo contiene posts reales. No continuar hasta cumplirla.
- [ ] 6.1 Desplegar con `anchorSince` en el futuro. Comprobar en los logs que la función se ejecuta y en el PDS (`com.atproto.repo.listRecords` o pdsls.dev) que existen la publicación y un documento por post e idioma, sin posts ancla.
- [ ] 6.2 Hacer un segundo deploy sin cambios y comprobar que el resumen indica cero escrituras.
- [ ] 6.3 Abrir un deploy preview y comprobar que la función no escribe.
- [ ] 6.4 Fijar `anchorSince` en la fecha deseada y desplegar. Comprobar en `bsky.app` que los posts ancla aparecen con tarjeta de enlace y sin indicador de retrofechado, y que los documentos tienen `bskyPostRef`.
- [ ] 6.5 Responder a un post ancla desde Bluesky y desde Mu y comprobar que ambos replies aparecen en el blog.
- [ ] 6.6 Modificar el título de un post, desplegar y comprobar que se actualiza el documento y no el post ancla.
- [ ] 6.7 (Opcional) Cambiar el handle de la cuenta al dominio desde los ajustes de la app y comprobar que se resuelve y que los enlaces del blog siguen funcionando.
