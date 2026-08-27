## MODIFIED Requirements

### Requirement: Comutador de idioma por página
O sistema SHALL apresentar um comutador de idioma em cada página, incluindo a home page, que indique todos os idiomas disponíveis no site; se não existir tradução num idioma para uma página de conteúdo específica, esse idioma não SHALL aparecer como opção navegável nessa página. As páginas estruturais (home, sobre, contacto) MUST ter `translationKey` definido no frontmatter para que o comutador mostre sempre todos os idiomas disponíveis.

#### Scenario: Post com tradução EN mostra link EN
- **WHEN** o utilizador está num post PT que tem `translationKey` com correspondência EN
- **THEN** o comutador de idioma mostra um link para a versão EN

#### Scenario: Post sem tradução EN não mostra link EN
- **WHEN** o utilizador está num post PT que não tem correspondência EN
- **THEN** o comutador de idioma não mostra a opção EN

#### Scenario: Home PT mostra link para home EN
- **WHEN** o utilizador está na home em português (`/`)
- **THEN** o comutador de idioma mostra tanto `pt` (ativo) como `en` (link para `/en/`)

#### Scenario: Home EN mostra link para home PT
- **WHEN** o utilizador está na home em inglês (`/en/`)
- **THEN** o comutador de idioma mostra tanto `en` (ativo) como `pt` (link para `/`)
