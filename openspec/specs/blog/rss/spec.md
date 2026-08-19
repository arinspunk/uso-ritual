## Purpose

Feeds RSS por idioma que permitem aos leitores subscrever o conteúdo no idioma da sua preferência, contendo apenas os posts publicados nesse idioma.

## Requirements

### Requirement: Feed RSS separada por idioma ativo
O sistema SHALL gerar uma feed RSS por cada idioma ativo, contendo exclusivamente os posts com `lang` correspondente a esse idioma, ordenados do mais recente para o mais antigo.

#### Scenario: Feed PT em /pt/feed.xml
- **WHEN** um agregador RSS acede a `/pt/feed.xml`
- **THEN** recebe uma feed válida com apenas os posts em português, ordenados por data decrescente

#### Scenario: Feed EN em /en/feed.xml
- **WHEN** um agregador RSS acede a `/en/feed.xml`
- **THEN** recebe uma feed válida com apenas os posts em inglês

#### Scenario: Feed Euskera em /eu/feed.xml (quando ativo)
- **WHEN** Euskera está configurado como idioma ativo e existem posts com `lang: eu`
- **THEN** a feed `/eu/feed.xml` contém esses posts

### Requirement: Feeds RSS com metadados do site por idioma
Cada feed SHALL incluir título do site, descrição e URL base no idioma correspondente, e cada item SHALL incluir título, URL canónico, data de publicação e excerto ou conteúdo completo do post.

#### Scenario: Item da feed tem URL canónico correto
- **WHEN** um post PT com slug `novo-disco-porto` aparece na feed `/pt/feed.xml`
- **THEN** o URL do item é o URL absoluto canónico do post em PT (ex: `https://exemplo.com/novo-disco-porto/`)

### Requirement: Referência às feeds no HTML do site
O sistema SHALL incluir elementos `<link rel="alternate" type="application/rss+xml">` no `<head>` de cada página, apontando para a feed do idioma ativo nessa página.

#### Scenario: Head de página PT aponta para feed PT
- **WHEN** o utilizador carrega qualquer página com `lang: pt`
- **THEN** o `<head>` contém um link para `/pt/feed.xml`
