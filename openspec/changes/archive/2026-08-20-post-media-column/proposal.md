## Why

Os posts não têm forma de associar imagens, vídeo ou áudio ao seu conteúdo — o layout de duas colunas (texto | media) que o design editorial prevê não pode ser implementado sem um modelo de dados para os recursos multimedia. Estabelecer este modelo agora permite publicar as primeiras reviews de discos com a sua identidade visual completa.

## What Changes

- Novo campo `media` (array opcional) no frontmatter dos posts, com itens tipados `image` / `video` / `audio`.
- Convenção de armazenamento de imagens em `src/assets/images/<translationKey>/` — partilhadas entre versões PT e EN do mesmo post.
- Plugin `transform_images` do Lume integrado no build para otimização automática (WebP, resize).
- Template `post.vto` actualizado para renderizar a coluna de media à direita do conteúdo.
- Listagem de posts (`home.vto`) actualizada para mostrar a primeira imagem como thumbnail quando disponível.

## Capabilities

### New Capabilities

- `blog/post-media`: Estrutura e comportamento do campo `media` nos posts — tipos de item, convenção de paths de imagens, regras de herança entre traduções.

### Modified Capabilities

- `blog/posts`: Adição do campo `media` como frontmatter opcional de cada post.

## Impact

- `_config.ts`: integração do plugin `transform_images`.
- `src/_includes/layouts/post.vto`: novo layout de duas colunas.
- `src/_includes/layouts/home.vto`: thumbnail nos cartões de listagem.
- `src/assets/images/`: nova directoria convencional para imagens de posts.
- Posts existentes não são afectados (campo `media` é opcional).
- Sem breaking changes — posts sem `media` continuam a funcionar com layout de uma coluna.
