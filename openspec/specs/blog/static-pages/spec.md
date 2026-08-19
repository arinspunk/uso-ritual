## Purpose

Páginas estáticas do blogue (Sobre e Contacto) disponíveis em todos os idiomas ativos, com conteúdo independente por idioma e link de contacto via `mailto:`.

## Requirements

### Requirement: Página Sobre em cada idioma ativo
O sistema SHALL publicar uma página Sobre em cada idioma configurado como ativo, acessível sob a URL canónica do idioma.

#### Scenario: Sobre em português
- **WHEN** o utilizador acede a `/sobre/`
- **THEN** o sistema serve a página Sobre em português

#### Scenario: Sobre em inglês
- **WHEN** o utilizador acede a `/en/about/`
- **THEN** o sistema serve a página Sobre em inglês

### Requirement: Página Contacto com link mailto: em cada idioma ativo
O sistema SHALL publicar uma página Contacto em cada idioma ativo com um link `mailto:` para contacto direto; não SHALL existir nenhum formulário processado pelo servidor.

#### Scenario: Contacto em português tem link mailto:
- **WHEN** o utilizador acede a `/contacto/`
- **THEN** a página contém um link `mailto:` funcional e não contém nenhum elemento `<form>` com ação de servidor

#### Scenario: Contacto em inglês
- **WHEN** o utilizador acede a `/en/contact/`
- **THEN** a página Contacto é servida em inglês com link `mailto:`

### Requirement: Páginas estáticas incluídas na navegação principal
As páginas Sobre e Contacto SHALL aparecer na navegação principal de cada idioma, com textos de menu no idioma correspondente.

#### Scenario: Nav em português usa textos PT
- **WHEN** o utilizador está em qualquer página com `lang: pt`
- **THEN** os links de navegação para Sobre e Contacto usam os textos em português

#### Scenario: Nav em inglês usa textos EN
- **WHEN** o utilizador está em qualquer página com `lang: en`
- **THEN** os links de navegação para About e Contact usam os textos em inglês
