## ADDED Requirements

### Requirement: Campo media opcional no frontmatter de um post
Um post PODE declarar o campo `media` (lista de itens multimedia) no frontmatter; a sua ausência não impede a publicação nem altera o comportamento dos restantes campos obrigatórios.

#### Scenario: Post com media é publicado normalmente
- **WHEN** um post tem `title`, `date`, `lang`, `slug` e `media` válido no frontmatter
- **THEN** o sistema gera a página do post sem erros, renderizando a coluna de media

#### Scenario: Post sem media é publicado sem alterações
- **WHEN** um post não declara o campo `media`
- **THEN** o sistema gera a página do post com layout de coluna única, sem erros
