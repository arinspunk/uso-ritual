## 1. Fix da home page no comutador de idiomas

- [x] 1.1 Adicionar `translationKey: home` ao frontmatter de `src/index.md`
- [x] 1.2 Adicionar `translationKey: home` ao frontmatter de `src/en/index.md`

## 2. Sublinhado do idioma ativo no comutador

- [x] 2.1 Adicionar `text-decoration: underline` e `text-underline-offset` à classe `.lang-switcher__item--active` em `src/assets/css/_header.css`

## 3. Estado ativo nos links de navegação

- [x] 3.1 No template `src/_includes/partials/header.vto`, adicionar lógica de comparação de URL para marcar o link de navegação ativo com a classe `site-nav__link--active`
- [x] 3.2 Adicionar estilos para `.site-nav__link--active` (sublinhado) em `src/assets/css/_header.css`, consistente com o estilo hover existente
