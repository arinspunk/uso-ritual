## Purpose

Sistema de columnas compartido que define el grid de anchos (texto / wide / full) aplicable a todos los tipos de página del sitio (home, posts y páginas estáticas), usando clases BEM agnósticas al tipo de contenido.

## ADDED Requirements

### Requirement: Contenedor de columnas compartido entre todos los layouts
El sistema SHALL proveer una clase contenedora `.page-body` que define el grid de tres columnas (texto, wide, full) y es aplicable de forma idéntica en los layouts de home, post y página estática. Ningún layout SHALL reimplementar su propio grid de columnas fuera de `.page-body`.

#### Scenario: home usa .page-body
- **WHEN** el usuario accede a la home de cualquier idioma
- **THEN** el contenido de la home está envuelto en un elemento con clase `.page-body`

#### Scenario: post usa .page-body
- **WHEN** el usuario accede a un post
- **THEN** el contenido del post está envuelto en un elemento con clase `.page-body`

#### Scenario: página estática usa .page-body
- **WHEN** el usuario accede a una página estática (Sobre, Contacto)
- **THEN** el contenido de la página está envuelto en un elemento con clase `.page-body`

### Requirement: Clases de breakout BEM estrictas
El sistema SHALL proveer clases de breakout siguiendo BEM estricto: el bloque es `.col`, y los modificadores son `.col--wide`, `.col--full` y `.col--text`. Todo elemento que lleve un modificador SHALL llevar también la clase de bloque `.col`. Los anchos de cada zona SHALL ser los mismos que los del grid de posts actual, sin cambios.

#### Scenario: elemento con breakout wide lleva ambas clases
- **WHEN** se inspecciona el DOM de un post con una imagen wide
- **THEN** la figura tiene exactamente las clases `col` y `col--wide`, sin `.post-media--wide`

#### Scenario: elemento con breakout full lleva ambas clases
- **WHEN** se inspecciona el DOM de un post con una imagen full
- **THEN** la figura tiene exactamente las clases `col` y `col--full`, sin `.post-media--full`

#### Scenario: elemento sin modificador va a columna texto por defecto
- **WHEN** se inspecciona el DOM de un párrafo dentro de `.page-body`
- **THEN** el párrafo ocupa el ancho de la columna de texto sin necesitar ninguna clase `.col`

### Requirement: Bloque de encabezado compartido entre todos los layouts
El sistema SHALL proveer el bloque `.page-header` para envolver los elementos de encabezado de página (título, fecha, subtítulo) en los layouts de home, post y página estática. Los elementos internos SHALL usar BEM estricto: `.page-header__title`, `.page-header__date`, `.page-header__subtitle`. El modificador `.page-header--center` SHALL centrar el texto del bloque. Ningún layout SHALL usar clases de encabezado ligadas al tipo de contenido (`.post__header`, `.post__title`, `.page__title`, etc.).

#### Scenario: post usa .page-header para su encabezado
- **WHEN** el usuario accede a un post
- **THEN** el encabezado contiene un elemento con clase `.page-header` y su título tiene clase `.page-header__title`

#### Scenario: home usa .page-header con modificador center
- **WHEN** el usuario accede a la home
- **THEN** el bloque de título y subtítulo tiene clases `.page-header` y `.page-header--center`, y el subtítulo tiene clase `.page-header__subtitle`

#### Scenario: página estática usa .page-header
- **WHEN** el usuario accede a una página estática
- **THEN** el h1 de la página tiene clase `.page-header__title` dentro de un elemento `.page-header`

#### Scenario: no existen clases de encabezado ligadas al tipo de contenido
- **WHEN** se inspecciona el DOM de cualquier página del sitio
- **THEN** no aparecen clases `.post__header`, `.post__title`, `.post__date`, `.page__title` ni similares

### Requirement: Clases de breakout aplicables en home y página estática
Los mismos modificadores `.col--wide` y `.col--full` SHALL ser funcionales cuando se aplican a hijos directos de `.page-body` en los layouts de home y página estática, con el mismo comportamiento visual que en posts.

#### Scenario: lista de posts en home puede ir a ancho wide
- **WHEN** el elemento de la lista de posts en home lleva `col col--wide`
- **THEN** la lista se extiende visualmente al ancho wide, más allá de los 48ch de texto

#### Scenario: lista de posts en home puede ir a ancho full
- **WHEN** el elemento de la lista de posts en home lleva `col col--full`
- **THEN** la lista ocupa el ancho completo disponible del contenedor
