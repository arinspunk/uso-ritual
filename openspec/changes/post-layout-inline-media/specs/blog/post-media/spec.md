## REMOVED Requirements

### Requirement: Estrutura do campo media
**Reason**: El modelo de media en frontmatter se reemplaza por shortcodes inline en el cuerpo del post. El campo `media` ya no existe como mecanismo de inserción de contenido multimedia.
**Migration**: Mover los ítems del array `media` al cuerpo del post usando los shortcodes `postImage`, `postVideo`, `postAudio`, `postGallery` y `postQuote`.

### Requirement: Campos dos itens de tipo image
**Reason**: Sustituido por el shortcode `postImage`.
**Migration**: Usar `{{ postImage "src" "alt" "caption" }}` en el cuerpo del post.

### Requirement: Campos dos itens de tipo video e audio
**Reason**: Sustituido por los shortcodes `postVideo` y `postAudio`.
**Migration**: Usar `{{ postVideo "url" "caption" }}` o `{{ postAudio "url" "caption" }}`.

### Requirement: Citação como item de media independente
**Reason**: Sustituido por el shortcode `postQuote`.
**Migration**: Usar `{{ postQuote "texto" "atribución" }}` en el cuerpo del post.

### Requirement: Galeria de imagens em grelha de duas colunas
**Reason**: Sustituido por el shortcode `postGallery`.
**Migration**: Usar `{{ postGallery "src1|alt1|cap1" "src2|alt2|cap2" }}` en el cuerpo del post.

### Requirement: Thumbnail de imagem na listagem de posts
**Reason**: El thumbnail ya no se deriva del array `media`. El autor lo declara explícitamente mediante el campo `thumbnail` en el frontmatter del post.
**Migration**: Ver spec `blog/posts` — añadir `thumbnail: <src>` al frontmatter del post.

## ADDED Requirements

### Requirement: Shortcode postImage para imagen inline
El sistema SHALL proporcionar un shortcode `postImage` usable en el cuerpo markdown de un post. El shortcode SHALL aceptar los argumentos posicionales: `src` (string, path relativo a `src/assets/images/`, obligatorio), `alt` (string, obligatorio), `caption` (string, opcional), `size` (string `"wide"` o `"full"`, opcional, por defecto `"wide"`). El sistema SHALL renderizar un `<figure>` con la imagen y, si se provee caption, un `<figcaption>`.

#### Scenario: postImage sin caption renderiza solo imagen
- **WHEN** un post incluye `{{ postImage "disco/cover.jpg" "Portada del disco" }}`
- **THEN** el sistema renderiza un `<figure class="post-media post-media--wide">` con la imagen y sin `<figcaption>`

#### Scenario: postImage con caption renderiza figura con pie
- **WHEN** un post incluye `{{ postImage "disco/cover.jpg" "Portada" "Editado en Lisboa, 2025" }}`
- **THEN** el sistema renderiza un `<figure>` con la imagen seguida de `<figcaption>Editado en Lisboa, 2025</figcaption>`

#### Scenario: postImage con size full ocupa ancho completo
- **WHEN** un post incluye `{{ postImage "disco/hero.jpg" "Hero" "" "full" }}`
- **THEN** el sistema renderiza la figura con clase `post-media--full` que ocupa el 100% del ancho del viewport disponible

### Requirement: Shortcode postVideo para vídeo inline
El sistema SHALL proporcionar un shortcode `postVideo` usable en el cuerpo markdown. SHALL aceptar: `url` (string, URL de plataforma externa, obligatorio), `caption` (string, opcional), `size` (string `"wide"` o `"full"`, opcional, por defecto `"wide"`). El sistema SHALL detectar el proveedor por URL y generar el embed correspondiente. Proveedores soportados: YouTube (`youtu.be/` o `youtube.com/watch`), Bandcamp (URLs con `bandcamp.com`).

#### Scenario: postVideo con URL de YouTube renderiza embed
- **WHEN** un post incluye `{{ postVideo "https://youtu.be/dQw4w9WgXcQ" "Grabado en Lisboa" }}`
- **THEN** el sistema renderiza un `<figure>` con un `<div class="media-embed">` que contiene un `<iframe>` de YouTube con ratio 16:9

#### Scenario: postVideo sin caption renderiza solo embed
- **WHEN** un post incluye `{{ postVideo "https://youtu.be/abc" }}`
- **THEN** el sistema renderiza la figura sin `<figcaption>`

### Requirement: Shortcode postAudio para audio inline multi-proveedor
El sistema SHALL proporcionar un shortcode `postAudio` usable en el cuerpo markdown. SHALL aceptar: `url` (string, URL de plataforma externa, obligatorio), `caption` (string, opcional). El sistema SHALL detectar el proveedor por URL y generar el embed correspondiente. Proveedores soportados: SoundCloud (URLs con `soundcloud.com`), Bandcamp (URLs con `bandcamp.com`), Spotify (URLs con `open.spotify.com`). Para URLs no reconocidas SHALL renderizar un enlace externo. El audio se renderiza siempre al ancho `wide` (no tiene opción `full`).

#### Scenario: postAudio con URL de SoundCloud renderiza embed
- **WHEN** un post incluye `{{ postAudio "https://soundcloud.com/artista/track" "Pista en directo" }}`
- **THEN** el sistema renderiza un `<div class="post-media post-media--wide">` con un `<iframe>` de SoundCloud

#### Scenario: postAudio con URL de Spotify renderiza embed
- **WHEN** un post incluye `{{ postAudio "https://open.spotify.com/track/abc" "Canción" }}`
- **THEN** el sistema renderiza un iframe embed de Spotify con dimensiones estándar

#### Scenario: postAudio con URL no reconocida renderiza enlace
- **WHEN** un post incluye `{{ postAudio "https://otro-servicio.com/track" "Escuchar" }}`
- **THEN** el sistema renderiza un enlace `<a>` que abre en pestaña nueva

### Requirement: Shortcode postGallery para galería en dos columnas inline
El sistema SHALL proporcionar un shortcode `postGallery` usable en el cuerpo markdown. SHALL aceptar un número variable de argumentos de tipo string con formato `"src|alt|caption"` (caption opcional). El sistema SHALL renderizar las imágenes en una cuadrícula de dos columnas dentro del bloque `wide`. El número de imágenes no tiene límite; con número impar la última ocupa la primera celda de la última fila.

#### Scenario: postGallery con dos imágenes renderiza cuadrícula 1×2
- **WHEN** un post incluye `{{ postGallery "est-1.jpg|Estudio 1|Mañana" "est-2.jpg|Estudio 2|Tarde" }}`
- **THEN** el sistema renderiza un `<div class="post-media post-media--wide post-gallery">` con dos `<figure>` en cuadrícula de dos columnas

#### Scenario: postGallery con número impar de imágenes no rompe el layout
- **WHEN** un post incluye tres imágenes en `postGallery`
- **THEN** el sistema renderiza una cuadrícula 2+1 sin celdas vacías ni overflow

#### Scenario: postGallery con caption por imagen renderiza pie individual
- **WHEN** un ítem del gallery tiene caption en el tercer segmento del string
- **THEN** el sistema renderiza `<figcaption>` bajo esa imagen dentro de su celda

### Requirement: Shortcode postQuote para cita inline
El sistema SHALL proporcionar un shortcode `postQuote` usable en el cuerpo markdown. SHALL aceptar: `text` (string, obligatorio), `attribution` (string, opcional). El sistema SHALL renderizar un `<blockquote>` dentro del flujo de texto. La cita se renderiza al ancho de texto (48ch), no al ancho `wide`.

#### Scenario: postQuote con atribución renderiza cite
- **WHEN** un post incluye `{{ postQuote "Sin métrica, sin algoritmo." "Uso Ritual" }}`
- **THEN** el sistema renderiza `<blockquote>` con `<p>` para el texto y `<cite>` para la atribución

#### Scenario: postQuote sin atribución renderiza solo blockquote
- **WHEN** un post incluye `{{ postQuote "Texto de la cita" }}`
- **THEN** el sistema renderiza `<blockquote><p>Texto de la cita</p></blockquote>` sin `<cite>`

### Requirement: Convención de paths de imagen sin cambios
El path de `src` en `postImage` y en los ítems de `postGallery` SHALL seguir la misma convención que antes: path relativo a `src/assets/images/`. El sistema SHALL resolver los recursos desde esa ruta.

#### Scenario: Imagen referenciada con path convencional
- **WHEN** un post incluye `{{ postImage "welcome-post/cover.jpg" "Portada" }}`
- **THEN** el sistema resuelve el recurso desde `src/assets/images/welcome-post/cover.jpg`

### Requirement: Optimización de imágenes se aplica a imágenes de shortcodes
El sistema SHALL aplicar la misma optimización WebP automática del build a las imágenes referenciadas por `postImage` y `postGallery`.

#### Scenario: Imagen de shortcode convertida a WebP en el build
- **WHEN** el build se ejecuta con una imagen JPEG en `src/assets/images/`
- **THEN** el output en `_site/` contiene la versión WebP de esa imagen, sea cual sea el shortcode que la referencie
