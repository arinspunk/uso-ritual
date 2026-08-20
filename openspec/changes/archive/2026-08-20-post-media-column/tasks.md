## 1. Build e assets

- [x] 1.1 Adicionar o plugin `transform_images` ao `_config.ts`; substituir `site.copy("assets")` por `site.copy("assets/css")` e `site.loadAssets([".svg"])`
- [x] 1.2 Criar a directoria `src/assets/images/` e `src/assets/images/_data.yml` com `format: webp` para conversão automática
- [x] 1.3 Verificar que o build corre sem erros, sem `node_modules` no projecto

## 2. Partial de media-item

- [x] 2.1 Criar `src/_includes/partials/media-item.vto` com ramificação por `item.type` (`image` / `video` / `audio` / `quote` / `gallery`)
- [x] 2.2 Implementar tipo `image`: `<figure>` com `<img alt>` e `<figcaption>` condicional para `item.caption`
- [x] 2.3 Implementar tipo `video` YouTube (`youtu.be` / `youtube.com`): `<figure>` com `<iframe>` + `<figcaption>` condicional
- [x] 2.4 Implementar tipo `video` Bandcamp (`bandcamp.com`): `<figure>` com `<iframe>` + `<figcaption>` condicional
- [x] 2.5 Implementar tipo `audio` SoundCloud (`soundcloud.com`) com `<iframe>`
- [x] 2.6 Implementar fallback para URLs externas não reconhecidas como `<a href>`
- [x] 2.7 Implementar tipo `quote`: `<blockquote>` com `<p>` para `text` e `<cite>` condicional para `attribution`
- [x] 2.8 Implementar tipo `gallery`: loop sobre `items` num `<div class="gallery">`; cada item renderiza `<figure>` com `<img>` e `<figcaption>` condicional

## 3. Layout do post

- [x] 3.1 Actualizar `post.vto` para layout de duas colunas quando `media` está presente
- [x] 3.2 Incluir o partial `media-item.vto` em loop sobre `media` na coluna direita
- [x] 3.3 Garantir que sem campo `media` o post renderiza com layout de coluna única (sem alteração visual para posts existentes)

## 4. CSS da coluna de media

- [x] 4.1 Adicionar estilos para o layout de duas colunas no post (grid ou flexbox)
- [x] 4.2 Definir largura da coluna de media e responsividade (colapsa para coluna única em mobile)
- [x] 4.3 Estilizar `<figure>` / `<img>` / `<iframe>` / `<figcaption>` e `<blockquote>` / `<cite>`
- [x] 4.4 Estilizar `.gallery` com `display: grid; grid-template-columns: 1fr 1fr` e colapso para coluna única em mobile

## 5. Thumbnail na listagem

- [x] 5.1 Actualizar `home.vto` para extrair o thumbnail: primeiro `image` directo em `media`; se ausente, primeira imagem de `gallery.items`
- [x] 5.2 Renderizar o thumbnail no cartão do post com `<img>` e tamanho fixo
- [x] 5.3 Garantir que posts sem imagem nem gallery renderizam o cartão sem thumbnail nem erros

## 6. Validação editorial com post de exemplo

- [x] 6.1 Criar directoria `src/assets/images/welcome-post/` e adicionar imagens de exemplo (mínimo 3 para testar gallery ímpar)
- [x] 6.2 Adicionar campo `media` ao post `primeiro-post.md` e `first-post.md` com: uma `image` com caption, um `quote` com attribution, uma URL de vídeo com caption, e um `gallery` com 3 imagens
- [x] 6.3 Correr o servidor local e verificar visualmente: layout duas colunas, caption, blockquote, embed de vídeo, gallery em grelha, thumbnail na home
- [x] 6.4 Verificar que um post sem `media` continua a renderizar correctamente
