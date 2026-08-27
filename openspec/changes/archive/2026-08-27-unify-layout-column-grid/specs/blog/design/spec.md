## MODIFIED Requirements

### Requirement: Layout de post en columna única con sistema de anchos de media
El layout del post SHALL usar una única columna de lectura centrada. Los elementos de media insertados con shortcodes SHALL poder ocupar un ancho mayor que el texto mediante un sistema de tres anchos:

- `text` (48ch): ancho del cuerpo de texto, usado por `postQuote`
- `wide` (~72ch): ancho por defecto de media (imágenes, vídeos, audios, galerías)
- `full` (100% del viewport disponible): opcional para imágenes y vídeos que lo requieran

El sistema SHALL implementar el breakout mediante CSS grid en el contenedor `.page-body`, de modo que elementos con clases `col col--wide` y `col col--full` puedan extenderse más allá del ancho de texto sin romper el flujo del documento.

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
