## 1. Inicialização do projeto

- [x] 1.1 Criar repositório git e estrutura de diretórios raiz (`src/`, `src/pt/`, `src/en/`, `src/_data/pt/`, `src/_data/en/`, `src/_includes/layouts/`, `src/_includes/partials/`)
- [x] 1.2 Criar `deno.json` com task `build` (`lume`) e `serve` (`lume --serve`)
- [x] 1.3 Instalar Lume e plugins necessários (`multilanguage`, `feed`, `date`) via import map ou `deno.json`
- [x] 1.4 Criar `_config.ts` com configuração base do Lume: `site.use(multilanguage({ languages: ["pt", "en"], defaultLang: "pt" }))` e demais plugins

## 2. Sistema multilingue

- [x] 2.1 Criar `src/_data/pt/i18n.yml` com strings de UI em português (nav, labels, textos do comutador de idioma)
- [x] 2.2 Criar `src/_data/en/i18n.yml` com as mesmas strings em inglês
- [x] 2.3 Verificar que o plugin multilanguage resolve corretamente URLs PT sem prefixo e EN com `/en/`
- [x] 2.4 Criar post de teste em PT e EN com `translationKey` comum e validar que o build gera as URLs corretas

## 3. Layout base e CSS

- [x] 3.1 Criar `src/_includes/layouts/base.njk` (ou `.vto`) com `<html>`, `<head>`, `<body>`, slot de conteúdo, e `<link rel="alternate">` para a feed RSS do idioma ativo
- [x] 3.2 Criar `src/_includes/partials/header.njk` com nome do blogue, navegação principal (Sobre, Contacto) e comutador de idioma
- [x] 3.3 Implementar lógica do comutador de idioma no partial: mostrar só os idiomas em que a página atual tem tradução (via `alternates` do plugin multilanguage); marcar visualmente o idioma ativo
- [x] 3.4 Criar `src/_includes/partials/footer.njk` com conteúdo do rodapé
- [x] 3.5 Criar `src/assets/css/main.css` com variáveis CSS (`--color-*`, `--space-*`, `--font-*`), reset mínimo, tipografia, e layout responsivo (coluna única em mobile, largura máxima centrada em desktop)
- [x] 3.6 Garantir que nenhum CSS externo é carregado em runtime (sem `@import` de CDN, sem Google Fonts remoto)

## 4. Template de post e listagem

- [x] 4.1 Criar `src/_includes/layouts/post.njk` com layout de post: título, data formatada no idioma da página, conteúdo, e comutador de idioma
- [x] 4.2 Criar `src/_includes/layouts/home.njk` (ou página index por idioma) com listagem de posts do idioma ativo, ordenada por data decrescente, mostrando título e data formatada
- [x] 4.3 Criar `src/pt/index.md` (home PT) e `src/en/index.md` (home EN) a usar o layout de listagem
- [x] 4.4 Validar que posts sem tradução no idioma ativo não aparecem na listagem desse idioma

## 5. Páginas estáticas

- [x] 5.1 Criar `src/pt/sobre.md` com frontmatter (`title`, `lang: pt`, `slug: sobre`) e conteúdo em português
- [x] 5.2 Criar `src/en/about.md` com frontmatter (`title`, `lang: en`, `slug: about`) e conteúdo em inglês
- [x] 5.3 Criar `src/pt/contacto.md` com link `mailto:` e sem formulário de servidor
- [x] 5.4 Criar `src/en/contact.md` com link `mailto:` em inglês
- [x] 5.5 Validar que Sobre e Contacto aparecem na navegação em ambos os idiomas com textos corretos do `i18n.yml`

## 6. Feeds RSS

- [x] 6.1 Configurar o plugin `feed` no `_config.ts` para gerar `/pt/feed.xml` com posts `lang: pt`
- [x] 6.2 Configurar feed `/en/feed.xml` com posts `lang: en`
- [x] 6.3 Validar que cada feed contém título do site, URL base e itens com URL canónico absoluto, data e título corretos
- [x] 6.4 Validar que o `<head>` de cada página inclui `<link rel="alternate" type="application/rss+xml">` apontando para a feed do idioma ativo

## 7. Deploy em Netlify

- [x] 7.1 Criar `netlify.toml` na raiz com `[build] command = "deno task build"`, `publish = "_site"`, e versão de Deno declarada (via `[build.environment] DENO_VERSION = "..."`)
- [x] 7.2 Confirmar que não existem redirects de deteção de idioma (`Accept-Language`) no `netlify.toml`
- [x] 7.3 Ligar o repositório ao Netlify e fazer o primeiro deploy
- [x] 7.4 Verificar que o site está acessível em produção: `/`, `/en/`, posts PT e EN, Sobre/About, Contacto/Contact, e feeds RSS

## 8. Conteúdo inicial e validação final

- [x] 8.1 Criar 1-2 posts reais em PT para validar o fluxo editorial completo
- [x] 8.2 Criar versão EN de pelo menos um post (com `translationKey`) e validar o comutador de idioma
- [x] 8.3 Testar responsividade em mobile (320px) e desktop
- [x] 8.4 Confirmar que nenhum recurso externo (CSS, fontes) é carregado em runtime
