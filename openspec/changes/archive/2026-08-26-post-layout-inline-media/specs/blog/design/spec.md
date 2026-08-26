## MODIFIED Requirements

### Requirement: Medida de línea calibrada en 48ch
La columna de lectura SHALL tener siempre `max-width: 48ch`. Este valor equivale a aproximadamente 66 caracteres por línea en Novela. La columna SHALL estar centrada horizontalmente en la página. En viewports donde 48ch supere el ancho disponible, la columna SHALL ser fluida (`width: 100%`) sin forzar scroll horizontal.

#### Scenario: Columna de texto centrada en desktop
- **WHEN** el viewport es ≥768px y el contenido de texto tiene menos de 48ch de ancho disponible
- **THEN** la columna de texto aparece centrada horizontalmente en el área de contenido principal

#### Scenario: Columna fluida en mobile
- **WHEN** el viewport es <768px
- **THEN** la columna de texto ocupa el 100% del ancho disponible (la línea resultante será inferior a 48ch)

## ADDED Requirements

### Requirement: Layout de post en columna única con sistema de anchos de media
El layout del post SHALL usar una única columna de lectura centrada. Los elementos de media insertados con shortcodes SHALL poder ocupar un ancho mayor que el texto mediante un sistema de tres anchos:

- `text` (48ch): ancho del cuerpo de texto, usado por `postQuote`
- `wide` (~72ch): ancho por defecto de media (imágenes, vídeos, audios, galerías)
- `full` (100% del viewport disponible): opcional para imágenes y vídeos que lo requieran

El sistema SHALL implementar el breakout mediante CSS grid en el contenedor `.post__content`, de modo que elementos con clase `post-media--wide` y `post-media--full` puedan extenderse más allá del ancho de texto sin romper el flujo del documento.

#### Scenario: Imagen wide se extiende más allá del texto
- **WHEN** un post contiene `{{ "cover.jpg" |> postImage("Alt") }}` (size wide por defecto)
- **THEN** la figura renderizada tiene un ancho visual de ~72ch, mayor que los 48ch del texto adyacente, y está centrada respecto a la columna de texto

#### Scenario: Imagen full ocupa el ancho máximo disponible
- **WHEN** un post contiene `{{ "hero.jpg" |> postImage("Hero", "", "full") }}`
- **THEN** la figura renderizada ocupa el 100% del ancho del contenedor del artículo

#### Scenario: Texto adyacente a media mantiene 48ch
- **WHEN** un párrafo de texto precede o sigue a un elemento de media wide o full
- **THEN** el párrafo mantiene su ancho de 48ch centrado, sin ensancharse

#### Scenario: Layout de columna única en todos los viewports
- **WHEN** el usuario accede a un post en cualquier viewport
- **THEN** el texto y la media se apilan verticalmente en una sola columna, sin layout de dos paneles laterales
