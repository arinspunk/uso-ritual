## Purpose

Gestão de múltiplos idiomas no blogue — roteamento de URLs por idioma, deteção e comutação de idioma, ocultação de conteúdo não traduzido, e extensibilidade para idiomas futuros.

## ADDED Requirements

### Requirement: Portuguese como idioma por defeito sem prefixo de URL
O sistema SHALL servir o conteúdo em português na raiz do site, sem qualquer prefixo de idioma no URL.

#### Scenario: Home em português
- **WHEN** o utilizador acede a `/`
- **THEN** o sistema serve a página inicial em português

#### Scenario: Post em português
- **WHEN** o utilizador acede a `/slug-do-post`
- **THEN** o sistema serve o post em português com esse slug

### Requirement: Idiomas secundários com prefixo de URL
O sistema SHALL servir conteúdo em inglês sob o prefixo `/en/` e conteúdo em Euskera sob `/eu/` quando esse idioma for ativado.

#### Scenario: Home em inglês
- **WHEN** o utilizador acede a `/en/`
- **THEN** o sistema serve a página inicial em inglês

#### Scenario: Post em inglês
- **WHEN** o utilizador acede a `/en/slug-do-post-en`
- **THEN** o sistema serve o post em inglês com esse slug

### Requirement: Ocultação de conteúdo sem tradução
O sistema SHALL ocultar posts e páginas na listagem de um idioma quando não existe versão nesse idioma — sem redirecionar para outro idioma nem mostrar conteúdo parcial.

#### Scenario: Post sem versão EN não aparece em /en/
- **WHEN** um post existe apenas em português
- **THEN** esse post não aparece na listagem de `/en/` nem tem URL acessível em `/en/`

#### Scenario: Feed EN só contém posts EN
- **WHEN** a feed RSS de inglês é consultada
- **THEN** só contém posts que têm `lang: en` no frontmatter

### Requirement: Comutador de idioma por página
O sistema SHALL apresentar um comutador de idioma em cada página que indique as versões disponíveis; se não existir tradução num idioma, esse idioma não SHALL aparecer como opção navegável nessa página.

#### Scenario: Post com tradução EN mostra link EN
- **WHEN** o utilizador está num post PT que tem `translationKey` com correspondência EN
- **THEN** o comutador de idioma mostra um link para a versão EN

#### Scenario: Post sem tradução EN não mostra link EN
- **WHEN** o utilizador está num post PT que não tem correspondência EN
- **THEN** o comutador de idioma não mostra a opção EN

### Requirement: Ligação entre traduções via translationKey
O sistema SHALL ligar posts e páginas traduzidas entre si usando um campo `translationKey` no frontmatter; slugs em idiomas diferentes podem diferir e são independentes.

#### Scenario: Posts com mesmo translationKey são tratados como traduções
- **WHEN** dois posts em idiomas diferentes partilham o mesmo valor de `translationKey`
- **THEN** o sistema reconhece-os como traduções um do outro e liga-os no comutador de idioma

### Requirement: Extensibilidade para novos idiomas
O sistema SHALL permitir adicionar um novo idioma (ex: Euskera) apenas pela adição de um prefixo à configuração e pela criação de conteúdo com o `lang` correspondente, sem alterações estruturais ao código de roteamento.

#### Scenario: Adicionar Euskera
- **WHEN** `eu` é adicionado à lista de idiomas na configuração e existem ficheiros com `lang: eu`
- **THEN** esses ficheiros são servidos sob `/eu/` sem outras alterações de código
