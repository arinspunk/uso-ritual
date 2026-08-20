## Context

O site usa Lume + Vento (`.vto`) com `site.copy("assets")` já configurado. Não há imagens no projecto ainda. O plugin `transform_images` do Lume usa Sharp internamente e pode ser adicionado ao `_config.ts`. O layout `post.vto` renderiza apenas `content` — sem suporte a media. A página de listagem `home.vto` não mostra thumbnails. Ver `proposal.md - Why` para a motivação.

## Goals / Non-Goals

**Goals:**
- Modelar `media` como array tipado no frontmatter, suportando `image`, `video`, `audio`, `quote` e `gallery`
- `caption` opcional em `image` e `video`; `quote` com `text` e `attribution` opcional; `gallery` com grelha de 2 colunas
- Armazenar imagens em `src/assets/images/<translationKey>/` — neutral face ao idioma
- Optimização automática de imagens no build (WebP via `transform_images`)
- Layout de duas colunas em `post.vto` — texto à esquerda, media à direita
- Thumbnail da primeira imagem (directa ou dentro de `gallery`) nos cartões da home

**Non-Goals:**
- Hosting de vídeo ou áudio próprio (sempre URLs externas)
- Upload ou gestão de imagens via CMS ou UI de administração
- Galeria inline dentro do corpo do post (media fica na coluna direita)
- Suporte a `srcset` responsive nesta iteração (pode ser adicionado via `transform_images` depois)

## Decisions

### 1. Array `media` no frontmatter em vez de campos escalares (ex: `cover`)

Um campo `cover` único não suporta a sequência editorial pretendida (portada + vídeo + áudio). Um array tipado deixa espaço para ordens editoriais arbitrárias sem alterar o schema quando se adicionam novos posts.

**Alternativa considerada:** múltiplos campos escalares (`cover`, `video`, `audio`). Rejeitado porque não suporta múltiplas imagens por post e forçaria mudanças de schema para casos comuns.

### 2. Imagens em `src/assets/images/<translationKey>/`

O `translationKey` é a chave de ligação entre traduções e é estável — não muda se o `slug` ou título do post mudar. Usar o `translationKey` como nome de pasta garante que PT e EN referenciam exactamente os mesmos paths sem duplicação.

**Alternativa considerada:** co-localização (imagens na mesma pasta que o `.md`). Rejeitado porque Lume com posts de múltiplos idiomas em directórios separados (`src/posts/` vs `src/en/posts/`) criaria acoplamento entre a estrutura de pastas PT e os paths referenciados pelo EN.

### 3. Plugin `transform_images` do Lume para optimização

Já incluído no ecossistema Lume. Usa Sharp internamente, mas Deno cacheia pacotes npm globalmente em `DENO_DIR` — não cria `node_modules` no projecto. A conversão WebP é configurada via `src/assets/images/_data.yml` com `format: webp`, aplicada a todos os ficheiros da pasta. O `_config.ts` substitui `site.copy("assets")` por `site.copy("assets/css")` e `site.loadAssets([".svg"])` para que as imagens fluam pelo pipeline em vez de serem copiadas directamente.

**Alternativa considerada:** optimização manual pré-build. Rejeitado — adiciona fricção editorial para cada novo post.

### 4. Embeds para vídeo e áudio externos via URL no campo `src`

O template deteta o domínio da URL e renderiza o embed correspondente (YouTube `<iframe>`, Bandcamp `<iframe>`, SoundCloud widget). Esta lógica fica num partial `_includes/partials/media-item.vto`.

**Alternativa considerada:** campo separado `embed_code` com HTML bruto. Rejeitado por razões de segurança (HTML arbitrário injectado) e porque complica o frontmatter.

### 5. Ramificação por tipo no partial de media

O partial `media-item.vto` usa condicionais sobre `item.type` para gerar o markup correcto:
- `image` → `<figure>` com `<img>` e `<figcaption>` opcional (se `item.caption`)
- `video` (youtu.be / youtube.com) → `<figure>` com `<iframe>` YouTube + `<figcaption>` opcional
- `video` (bandcamp.com) → `<figure>` com `<iframe>` Bandcamp + `<figcaption>` opcional
- `audio` (soundcloud.com) → widget SoundCloud via `<iframe>`
- `audio` / `video` fallback → `<a href>` externo
- `quote` → `<blockquote>` com `<p>` para `text` e `<cite>` opcional para `attribution`
- `gallery` → loop sobre `items` num `<div class="gallery">` com CSS grid de 2 colunas; cada item renderiza `<figure>` com `<img>` e `<figcaption>` opcional

### 6. Gallery como grelha CSS de 2 colunas

O tipo `gallery` usa `display: grid; grid-template-columns: 1fr 1fr` para o wrap automático, sem lógica no template. Qualquer número de imagens distribui-se pela grelha — N ímpar deixa a última célula vazia. Em mobile colapsa para coluna única com a mesma regra que a coluna de media principal.

**Alternativa considerada:** grelha gerada por JS. Rejeitado — CSS puro é suficiente e sem dependências.

## Risks / Trade-offs

- **Plataformas externas mudam os seus embed URLs** → mitigação: o partial de embeds está isolado, fácil de actualizar sem tocar no frontmatter dos posts.
- **`transform_images` aumenta o tempo de build** com muitas imagens → aceitável a esta escala (dezenas de posts); pode ser mitigado com cache de build no Netlify.
- **Duplicação do bloco `media` em PT e EN** → inevitável dado que cada post é um ficheiro independente; a escala (dezenas de posts) torna-o manejável. Se a escala crescer muito, pode-se resolver com data files partilhados.

## Open Questions

- Qual o tamanho máximo de largura a usar no `transform_images` para as imagens da coluna de media? (decidido empiricamente ao implementar o CSS — a coluna tem `minmax(260px, 320px)`)
