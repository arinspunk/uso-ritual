## Purpose

Define a estrutura do campo `media` nos posts — itens multimedia tipados (imagem, vídeo, áudio, citação, galeria) que alimentam a coluna de media do layout editorial de dois painéis.

## ADDED Requirements

### Requirement: Estrutura do campo media
O campo `media` de um post, quando presente, SHALL ser uma lista ordenada de itens. Cada item SHALL ter o campo `type` (string: `image`, `video`, `audio`, `quote`, ou `gallery`) e os campos específicos do seu tipo. A lista não tem limite de número de itens nem de repetição de tipos.

#### Scenario: Post com campo media válido
- **WHEN** um post declara `media` com itens que têm `type` válido e os campos obrigatórios do seu tipo
- **THEN** o sistema renderiza a coluna de media com os itens pela ordem declarada

#### Scenario: Post sem campo media
- **WHEN** um post não declara o campo `media`
- **THEN** o sistema renderiza o post sem coluna de media, sem erro de build

### Requirement: Campos dos itens de tipo image
Um item `image` SHALL ter `src` (string, path relativo a `src/assets/images/`). PODE incluir `alt` (string) para texto alternativo e `caption` (string) para pé de imagem.

#### Scenario: Imagem com todos os campos opcionais
- **WHEN** um item `image` tem `src`, `alt` e `caption`
- **THEN** o sistema renderiza a imagem com o texto alternativo e o pé de imagem visível sob a imagem

#### Scenario: Imagem sem caption
- **WHEN** um item `image` não tem `caption`
- **THEN** o sistema renderiza a imagem sem pé de imagem, sem markup adicional

### Requirement: Campos dos itens de tipo video e audio
Um item `video` ou `audio` SHALL ter `src` (URL completa de plataforma externa). PODE incluir `caption` (string) para pé de embed.

#### Scenario: Vídeo com caption
- **WHEN** um item `video` tem `src` e `caption`
- **THEN** o sistema renderiza o embed do vídeo seguido do pé de embed visível

#### Scenario: Vídeo sem caption
- **WHEN** um item `video` não tem `caption`
- **THEN** o sistema renderiza apenas o embed, sem markup adicional

#### Scenario: Item de vídeo com URL externa
- **WHEN** um item tem `type: video` e `src: https://youtu.be/abc123`
- **THEN** o sistema renderiza um embed do vídeo na coluna de media

#### Scenario: Item de áudio com URL externa
- **WHEN** um item tem `type: audio` e `src: https://bandcamp.com/track/xyz`
- **THEN** o sistema renderiza um embed de áudio na coluna de media

### Requirement: Citação como item de media independente
Um item `quote` SHALL ter `text` (string obrigatória). PODE incluir `attribution` (string) com o nome do autor ou fonte.

#### Scenario: Citação com atribuição
- **WHEN** um item tem `type: quote`, `text` e `attribution`
- **THEN** o sistema renderiza um `<blockquote>` com o texto e a atribuição em `<cite>`

#### Scenario: Citação sem atribuição
- **WHEN** um item tem `type: quote` e `text` mas não tem `attribution`
- **THEN** o sistema renderiza apenas o `<blockquote>` sem `<cite>`

### Requirement: Galeria de imagens em grelha de duas colunas
Um item `gallery` SHALL ter `items` (lista não vazia de imagens). Cada imagem em `items` SHALL ter `src` e PODE incluir `alt` e `caption`. O sistema SHALL renderizar as imagens em grelha de duas colunas que faz wrap automaticamente independentemente do número de imagens.

#### Scenario: Gallery com número par de imagens
- **WHEN** um item `gallery` tem 4 imagens em `items`
- **THEN** o sistema renderiza uma grelha 2×2

#### Scenario: Gallery com número ímpar de imagens
- **WHEN** um item `gallery` tem 3 imagens em `items`
- **THEN** o sistema renderiza uma grelha com 2 imagens na primeira linha e 1 na segunda, alinhada à esquerda

#### Scenario: Imagens do gallery com caption
- **WHEN** uma imagem em `gallery.items` tem `caption`
- **THEN** o sistema renderiza o pé de imagem sob essa imagem dentro da célula da grelha

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

### Requirement: Thumbnail de imagem na listagem de posts
Quando um post declara `media`, o sistema SHALL apresentar como thumbnail no cartão de listagem a primeira imagem encontrada — procurando primeiro em itens `image` directos e depois no primeiro item de `gallery.items`.

#### Scenario: Post com item image directo aparece com thumbnail
- **WHEN** um post tem `media` com pelo menos um item `image`
- **THEN** o cartão do post na listagem mostra essa imagem como thumbnail

#### Scenario: Post apenas com gallery aparece com thumbnail
- **WHEN** um post tem `media` com um `gallery` mas sem itens `image` directos
- **THEN** o cartão do post na listagem mostra a primeira imagem de `gallery.items` como thumbnail

#### Scenario: Post sem imagem aparece sem thumbnail
- **WHEN** um post não tem `media` ou não tem itens `image` nem `gallery`
- **THEN** o cartão do post na listagem não mostra thumbnail, sem erro
