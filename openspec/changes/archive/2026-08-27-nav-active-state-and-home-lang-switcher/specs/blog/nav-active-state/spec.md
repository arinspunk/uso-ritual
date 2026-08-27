## Purpose

Define o comportamento visual do estado ativo na navegação principal e no comutador de idiomas: o item correspondente à página atual ou ao idioma atual é apresentado com sublinhado permanente para indicar onde o utilizador se encontra.

## ADDED Requirements

### Requirement: Idioma ativo sublinhado no comutador de idiomas
O comutador de idiomas SHALL apresentar o idioma atual com sublinhado permanente para o distinguir dos outros idiomas disponíveis.

#### Scenario: Idioma ativo tem sublinhado
- **WHEN** o utilizador está numa página em português
- **THEN** o item `pt` no comutador aparece sublinhado e os outros idiomas não têm sublinhado

#### Scenario: Idioma ativo tem sublinhado em inglês
- **WHEN** o utilizador está numa página em inglês
- **THEN** o item `en` no comutador aparece sublinhado e os outros idiomas não têm sublinhado

### Requirement: Item de navegação ativo sublinhado
Os links de navegação principal SHALL apresentar sublinhado permanente no link correspondente à página atual.

#### Scenario: Link Sobre ativo quando na página Sobre
- **WHEN** o utilizador está na página Sobre (`/sobre/` ou `/en/about/`)
- **THEN** o link de navegação Sobre aparece sublinhado

#### Scenario: Link Contacto ativo quando na página Contacto
- **WHEN** o utilizador está na página Contacto (`/contacto/` ou `/en/contact/`)
- **THEN** o link de navegação Contacto aparece sublinhado

#### Scenario: Nenhum link ativo na home ou em posts
- **WHEN** o utilizador está na home ou a ler um post
- **THEN** nenhum link de navegação aparece sublinhado como ativo
