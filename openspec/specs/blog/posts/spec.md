## Purpose

Estrutura, metadados e comportamento dos posts editoriais de música — reviews de discos, entrevistas e outros formatos — incluindo listagem cronológica e frontmatter normalizado.

## Requirements

### Requirement: Frontmatter obrigatório de um post
Cada post SHALL declarar no frontmatter: `title` (string), `date` (data ISO 8601), `lang` (código de idioma BCP 47, ex: `pt`, `en`, `eu`), e `slug` (string kebab-case única dentro do idioma).

#### Scenario: Post válido é publicado
- **WHEN** um ficheiro Markdown tem `title`, `date`, `lang` e `slug` no frontmatter
- **THEN** o sistema gera a página do post no URL correspondente ao idioma e slug

#### Scenario: Post sem campos obrigatórios não é publicado
- **WHEN** um ficheiro Markdown não tem `date` no frontmatter
- **THEN** o sistema não gera a página ou emite erro de build

### Requirement: translationKey para ligar traduções
Um post PODE declarar `translationKey` (string arbitrária) para indicar que é a tradução de um post noutro idioma; este campo é opcional — a sua ausência não impede a publicação.

#### Scenario: Post sem translationKey é publicado normalmente
- **WHEN** um post não tem `translationKey`
- **THEN** o post é publicado e não aparece no comutador de idioma de nenhum outro post

#### Scenario: Posts com mesmo translationKey são ligados
- **WHEN** dois posts em idiomas diferentes partilham o mesmo `translationKey`
- **THEN** o comutador de idioma em cada um aponta para o outro

### Requirement: Listagem de posts por idioma em ordem cronológica inversa
O sistema SHALL apresentar nas páginas de listagem (home de cada idioma) os posts ordenados do mais recente para o mais antigo, filtrados pelo idioma da página.

#### Scenario: Home PT mostra posts PT do mais recente para o mais antigo
- **WHEN** o utilizador acede a `/`
- **THEN** vê os posts com `lang: pt` ordenados por `date` decrescente

#### Scenario: Home EN mostra apenas posts EN
- **WHEN** o utilizador acede a `/en/`
- **THEN** vê apenas posts com `lang: en`, sem posts de outros idiomas

### Requirement: URL canónica gerada a partir do slug e do idioma
O sistema SHALL gerar o URL de cada post como `/<slug>` para PT e `/<lang>/<slug>` para outros idiomas, usando exclusivamente o valor do campo `slug` do frontmatter.

#### Scenario: Post PT com slug usa URL raiz
- **WHEN** um post tem `lang: pt` e `slug: novo-disco-porto`
- **THEN** o URL gerado é `/novo-disco-porto/`

#### Scenario: Post EN com slug usa prefixo /en/
- **WHEN** um post tem `lang: en` e `slug: new-porto-record`
- **THEN** o URL gerado é `/en/new-porto-record/`

### Requirement: Campo thumbnail expected en el frontmatter de un post
Un post SHALL declarar el campo `thumbnail` (string, path relativo a `src/assets/images/`) no frontmatter para indicar qué imagem se usa na card da listagem. O sistema SHALL usar esa imaxen na card. A ausencia de `thumbnail` non impide a publicación, pero os posts sen thumbnail non seguirán o layout de card con imaxe.

#### Scenario: Post con thumbnail aparece con imaxe na listagem
- **WHEN** un post declara `thumbnail: disco/cover.jpg` no frontmatter
- **THEN** o cartão do post na listagem mostra esa imaxen no alto da card, en proporción 3:2 e ancho completo da columna

#### Scenario: Post sin thumbnail non rederiza imaxen
- **WHEN** un post non declara `thumbnail`
- **THEN** o cartão do post na listagem non mostra imaxen, sen erro

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
