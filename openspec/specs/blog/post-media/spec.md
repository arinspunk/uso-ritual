## Purpose

Define a estrutura do campo `media` nos posts — itens multimedia tipados (imagem, vídeo, áudio, citação, galeria) que alimentam a coluna de media do layout editorial de dois painéis.

## Requirements

### Requirement: Shortcode postImage para imagen inline
El sistema SHALL proporcionar un shortcode `postImage` usable en el cuerpo markdown de un post. El shortcode SHALL aceptarse vía filtro Vento con el `src` a la izquierda del pipe y argumentos posicionales: `alt` (string, obligatorio), `caption` (string, opcional), `size` (string `"wide"`, `"full"` o `"text"`, opcional, por defecto `"wide"`). El sistema SHALL renderizar un `<figure>` con la imagen y, si se provee caption, un `<figcaption>`.

#### Scenario: postImage sin caption renderiza solo imagen
- **WHEN** un post incluye `{{ "disco/cover.jpg" |> postImage("Portada del disco") }}`
- **THEN** el sistema renderiza un `<figure class="post-media post-media--wide">` con la imagen y sin `<figcaption>`

#### Scenario: postImage con caption renderiza figura con pie
- **WHEN** un post incluye `{{ "disco/cover.jpg" |> postImage("Portada", "Editado en Lisboa, 2025") }}`
- **THEN** el sistema renderiza un `<figure>` con la imagen seguida de `<figcaption>Editado en Lisboa, 2025</figcaption>`

#### Scenario: postImage con size full ocupa ancho completo
- **WHEN** un post incluye `{{ "disco/hero.jpg" |> postImage("Hero", "", "full") }}`
- **THEN** el sistema renderiza la figura con clase `post-media--full` que ocupa el 100% del ancho del viewport disponible

### Requirement: Shortcode postVideo para vídeo inline
El sistema SHALL proporcionar un shortcode `postVideo` usable en el cuerpo markdown. SHALL aceptar `url` vía pipe y: `caption` (string, opcional), `size` (string `"wide"`, `"full"` o `"text"`, opcional, por defecto `"wide"`). El sistema SHALL detectar el proveedor por URL y generar el embed correspondiente. Proveedores soportados: YouTube (`youtu.be/` o `youtube.com/watch`), Bandcamp (URLs embed-capable con `bandcamp.com`).

#### Scenario: postVideo con URL de YouTube renderiza embed
- **WHEN** un post incluye `{{ "https://youtu.be/dQw4w9WgXcQ" |> postVideo("Grabado en Lisboa") }}`
- **THEN** el sistema renderiza un `<figure>` con un `<div class="media-embed">` que contiene un `<iframe>` de YouTube con ratio 16:9

#### Scenario: postVideo sin caption renderiza solo embed
- **WHEN** un post incluye `{{ "https://youtu.be/abc" |> postVideo }}`
- **THEN** el sistema renderiza la figura sin `<figcaption>`

### Requirement: Shortcode postAudio para audio inline multi-proveedor
El sistema SHALL proporcionar un shortcode `postAudio` usable en el cuerpo markdown. SHALL aceptar `url` vía pipe y `caption` (string, opcional). El sistema SHALL detectar el proveedor por URL y generar el embed correspondiente. Proveedores soportados: SoundCloud (URLs con `soundcloud.com`), Bandcamp (URLs embed-capable con `bandcamp.com`), Spotify (URLs con `open.spotify.com`). Para URLs no reconocidas SHALL renderizar un enlace externo. El audio se renderiza siempre al ancho `wide` (no tiene opción `full`).

#### Scenario: postAudio con URL de SoundCloud renderiza embed
- **WHEN** un post incluye `{{ "https://soundcloud.com/artista/track" |> postAudio("Pista en directo") }}`
- **THEN** el sistema renderiza un `<div class="post-media post-media--wide">` con un `<iframe>` de SoundCloud

#### Scenario: postAudio con URL de Spotify renderiza embed
- **WHEN** un post incluye `{{ "https://open.spotify.com/track/abc" |> postAudio("Canción") }}`
- **THEN** el sistema renderiza un iframe embed de Spotify con dimensiones estándar

#### Scenario: postAudio con URL no reconocida renderiza enlace
- **WHEN** un post incluye `{{ "https://otro-servicio.com/track" |> postAudio("Escuchar") }}`
- **THEN** el sistema renderiza un enlace `<a>` que abre en pestaña nueva

### Requirement: Shortcode postGallery para galería en dos columnas inline
El sistema SHALL proporcionar un shortcode `postGallery` usable en el cuerpo markdown. SHALL aceptar el primer ítem vía pipe y un número variable de argumentos adicionales, cada uno string con formato `"src|alt|caption"` (caption opcional). El sistema SHALL renderizar las imágenes en una cuadrícula de dos columnas dentro del bloque `wide`. El número de imágenes no tiene límite; con número impar la última ocupa la primera celda de la última fila.

#### Scenario: postGallery con dos imágenes renderiza cuadrícula 1×2
- **WHEN** un post incluye `{{ "est-1.jpg|Estudio 1|Mañana" |> postGallery("est-2.jpg|Estudio 2|Tarde") }}`
- **THEN** el sistema renderiza un `<div class="post-media post-media--wide post-gallery">` con dos `<figure>` en cuadrícula de dos columnas

#### Scenario: postGallery con número impar de imágenes no rompe el layout
- **WHEN** un post incluye tres imágenes en `postGallery`
- **THEN** el sistema renderiza una cuadrícula 2+1 sin celdas vacías ni overflow

#### Scenario: postGallery con caption por imagen renderiza pie individual
- **WHEN** un ítem del gallery tiene caption en el tercer segmento del string
- **THEN** el sistema renderiza `<figcaption>` bajo esa imagen dentro de su celda

### Requirement: Shortcode postQuote para cita inline
El sistema SHALL proporcionar un shortcode `postQuote` usable en el cuerpo markdown. SHALL aceptar `text` vía pipe y `attribution` (string, opcional). El sistema SHALL renderizar un `<blockquote>` dentro del flujo de texto. La cita se renderiza al ancho de texto (48ch), no al ancho `wide`.

#### Scenario: postQuote con atribución renderiza cite
- **WHEN** un post incluye `{{ "Sin métrica, sin algoritmo." |> postQuote("Uso Ritual") }}`
- **THEN** el sistema renderiza `<blockquote>` con `<p>` para el texto y `<cite>` para la atribuición

#### Scenario: postQuote sin atribución renderiza solo blockquote
- **WHEN** un post incluye `{{ "Texto de la cita" |> postQuote }}`
- **THEN** el sistema renderiza `<blockquote><p>Texto de la cita</p></blockquote>` sin `<cite>`

### Requirement: Convención de paths de imagen sin cambios
El path de `src` en `postImage` y en los ítems de `postGallery` SHALL seguir la misma convención que antes: path relativo a `src/assets/images/`. El sistema SHALL resolver los recursos desde esa ruta. Para JPG/JPEG/PNG el build SHALL emitir la URL `.webp` generada por `transform_images`; SVG permanece con su extensión.

#### Scenario: Imagen referenciada con path convencional
- **WHEN** un post incluye `{{ "welcome-post/cover.jpg" |> postImage("Portada") }}`
- **THEN** el sistema resuelve el recurso desde `src/assets/images/welcome-post/cover.jpg` (URL de salida `.webp`)

### Requirement: Optimización de imágenes se aplica a imágenes de shortcodes
El sistema SHALL aplicar la misma optimización WebP automática del build a las imágenes referenciadas por `postImage` y `postGallery`.

#### Scenario: Imagen de shortcode convertida a WebP en el build
- **WHEN** el build se ejecuta con una imagen JPEG en `src/assets/images/`
- **THEN** el output en `_site/` contiene la versión WebP de esa imagen, sea cual sea el shortcode que la referencie

### Requirement: Convenção de paths para imagens de posts
As imagens associadas a um post SHALL ser armazenadas em `src/assets/images/<translationKey>/`, onde `<translationKey>` é o valor do campo `translationKey` do post. O campo `src` de um item `image` ou de um item dentro de `gallery.items` referencia o ficheiro relativo a `src/assets/images/`.

#### Scenario: Imagem referenciada com path convencional
- **WHEN** um item `image` tem `src: welcome-post/cover.jpg`
- **THEN** o sistema resolve o recurso a partir de `src/assets/images/welcome-post/cover.jpg`

#### Scenario: Post sem translationKey usa slug PT como chave de pasta
- **WHEN** um post não tem `translationKey`
- **THEN** a pasta de imagens PODE usar o `slug` do post PT como nome, por convenção editorial

### Requirement: Partilha de imagens entre traduções
As imagens de um post SHALL ser partilhadas entre todas as traduções com o mesmo `translationKey`. O campo `media` de cada versão linguística declara os mesmos paths de imagem — o sistema não duplica os ficheiros.

#### Scenario: Post PT e EN com mesmo media
- **WHEN** dois posts com o mesmo `translationKey` declaram o mesmo array `media`
- **THEN** ambos renderizam as mesmas imagens sem erros de paths ausentes

### Requirement: Optimização automática de imagens no build
O sistema SHALL converter as imagens em `src/assets/images/` para formato WebP durante o build, incluindo as imagens dentro de itens `gallery`.

#### Scenario: Imagem original convertida para WebP
- **WHEN** o build é executado com uma imagem JPEG ou PNG em `src/assets/images/`
- **THEN** o output em `_site/` contém a versão WebP optimizada

