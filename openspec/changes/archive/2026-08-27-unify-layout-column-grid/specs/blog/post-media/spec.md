## MODIFIED Requirements

### Requirement: Shortcode postImage para imagen inline
El sistema SHALL proporcionar un shortcode `postImage` usable en el cuerpo markdown de un post. El shortcode SHALL aceptarse vía filtro Vento con el `src` a la izquierda del pipe y argumentos posicionales: `alt` (string, obligatorio), `caption` (string, opcional), `size` (string `"wide"`, `"full"` o `"text"`, opcional, por defecto `"wide"`). El sistema SHALL renderizar un `<figure>` con la imagen y, si se provee caption, un `<figcaption>`.

#### Scenario: postImage sin caption renderiza solo imagen
- **WHEN** un post incluye `{{ "disco/cover.jpg" |> postImage("Portada del disco") }}`
- **THEN** el sistema renderiza un `<figure class="media col col--wide">` con la imagen y sin `<figcaption>`

#### Scenario: postImage con caption renderiza figura con pie
- **WHEN** un post incluye `{{ "disco/cover.jpg" |> postImage("Portada", "Editado en Lisboa, 2025") }}`
- **THEN** el sistema renderiza un `<figure>` con la imagen seguida de `<figcaption>Editado en Lisboa, 2025</figcaption>`

#### Scenario: postImage con size full ocupa ancho completo
- **WHEN** un post incluye `{{ "disco/hero.jpg" |> postImage("Hero", "", "full") }}`
- **THEN** el sistema renderiza la figura con clases `media col col--full` que ocupa el 100% del ancho del viewport disponible

### Requirement: Shortcode postAudio para audio inline multi-proveedor
El sistema SHALL proporcionar un shortcode `postAudio` usable en el cuerpo markdown. SHALL aceptar `url` vía pipe y `caption` (string, opcional). El sistema SHALL detectar el proveedor por URL y generar el embed correspondiente. Proveedores soportados: SoundCloud (URLs con `soundcloud.com`), Bandcamp (URLs embed-capable con `bandcamp.com`), Spotify (URLs con `open.spotify.com`). Para URLs no reconocidas SHALL renderizar un enlace externo. El audio se renderiza siempre al ancho `wide` (no tiene opción `full`).

#### Scenario: postAudio con URL de SoundCloud renderiza embed
- **WHEN** un post incluye `{{ "https://soundcloud.com/artista/track" |> postAudio("Pista en directo") }}`
- **THEN** el sistema renderiza un `<div class="media col col--wide">` con un `<iframe>` de SoundCloud

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
- **THEN** el sistema renderiza un `<div class="media col col--wide post-gallery">` con dos `<figure>` en cuadrícula de dos columnas

#### Scenario: postGallery con número impar de imágenes no rompe el layout
- **WHEN** un post incluye tres imágenes en `postGallery`
- **THEN** el sistema renderiza una cuadrícula 2+1 sin celdas vacías ni overflow

#### Scenario: postGallery con caption por imagen renderiza pie individual
- **WHEN** un ítem del gallery tiene caption en el tercer segmento del string
- **THEN** el sistema renderiza `<figcaption>` bajo esa imagen dentro de su celda
