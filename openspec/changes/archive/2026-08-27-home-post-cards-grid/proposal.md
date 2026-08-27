## Why

As cards de posts na home são actualmente uma lista vertical de texto con miniatura de 72×72 px ao lado — sem protagonismo visual. O diseño non reflicte o carácter editorial do blog.

## What Changes

- A listagem de posts na home pasa a ser un grid de 2 columnas (1 columna en móvil)
- A thumbnail de cada post ocupa o ancho completo da card, en proporción 3:2, con `object-fit: cover`
- A imaxe queda encima do texto (título, data, descrición)
- Desaparece o layout lateral (thumb pequena á dereita) — a composición é vertical, sen caixa nin superficie propia
- Todos os posts declararán `thumbnail` no frontmatter — o requisito pasa de opcional a expected

## Capabilities

### New Capabilities

*(ninguna)*

### Modified Capabilities

- `blog/posts`: O requisito de `thumbnail` pasa a ser expected en todos os posts; a card da listagem ten un layout novo (imagen grande arriba, grid de 2 columnas na home)

## Impact

- `src/assets/css/_post-list.css`: refactor completo do layout da card e da lista
- `src/_includes/layouts/home.vto`: eliminar o modificador condicional `post-card--with-thumb`; a card asume sempre thumbnail
