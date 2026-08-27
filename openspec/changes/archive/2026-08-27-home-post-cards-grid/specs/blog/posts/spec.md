## MODIFIED Requirements

### Requirement: Campo thumbnail expected en el frontmatter de un post
Un post SHALL declarar el campo `thumbnail` (string, path relativo a `src/assets/images/`) no frontmatter para indicar qué imagem se usa na card da listagem. O sistema SHALL usar esa imaxen na card. A ausencia de `thumbnail` non impide a publicación, pero os posts sen thumbnail non seguirán o layout de card con imaxe.

#### Scenario: Post con thumbnail aparece con imaxe na listagem
- **WHEN** un post declara `thumbnail: disco/cover.jpg` no frontmatter
- **THEN** o cartão do post na listagem mostra esa imaxen no alto da card, en proporción 3:2 e ancho completo da columna

#### Scenario: Post sin thumbnail non rederiza imaxen
- **WHEN** un post non declara `thumbnail`
- **THEN** o cartão do post na listagem non mostra imaxen, sen erro

## ADDED Requirements

### Requirement: Listagem de posts na home en grid de 2 columnas
O sistema SHALL presentar a listagem de posts na home en un grid de 2 columnas en pantallas de 640 px ou máis. En pantallas menores, SHALL presentar 1 columna.

#### Scenario: Home en pantalla grande mostra 2 columnas
- **WHEN** o utilizador accede á home nun viewport >= 640 px
- **THEN** os posts aparecen en 2 columnas de igual ancho

#### Scenario: Home en pantalla pequena mostra 1 columna
- **WHEN** o utilizador accede á home nun viewport < 640 px
- **THEN** os posts aparecen en 1 soa columna

### Requirement: Layout da card con imaxe arriba e texto abaixo
Cando un post ten `thumbnail`, a card da listagem SHALL mostrar a imaxen en posición superior, seguida de data, título e descrición en sentido vertical. A imaxen SHALL renderizarse en proporción 3:2 con `object-fit: cover`. A card non SHALL ter borde nin superficie de fondo propios.

#### Scenario: Card con thumbnail mostra composición vertical
- **WHEN** un post ten `thumbnail` e se renderiza na listagem
- **THEN** a imaxen aparece enriba, e debaixo en orde: data, título, descrición
