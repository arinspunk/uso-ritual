## Why

Criar um blogue editorial de música com suporte multilingue desde o início — português como língua principal, inglês como secundária e Euskera como terceira língua planeada — usando Lume (SSG em Deno) como base. O projeto parte do zero, sem codebase existente.

## What Changes

- Novo projeto Lume + Deno inicializado e configurado
- Plugin `multilanguage` com PT como língua por defeito (sem prefixo de URL), EN em `/en/`, Euskera futuro em `/eu/`
- Sistema de posts sem tradução obrigatória: um post pode existir só num idioma; posts sem versão no idioma ativo são ocultados nesse idioma
- Slugs independentes por idioma, ligados via `translationKey` no frontmatter
- Páginas estáticas Sobre e Contacto (link `mailto:`) em cada idioma ativo
- RSS feed separada por idioma: `/pt/feed.xml`, `/en/feed.xml`, `/eu/feed.xml` (futuro)
- Design construído de raiz (sem tema base)
- Deploy em Netlify a partir do output estático do Lume

## Capabilities

### New Capabilities

- `blog/multilanguage`: Sistema de i18n — configuração de idiomas, URLs, plugin multilanguage, translationKey, ocultação de posts sem tradução
- `blog/posts`: Estrutura e frontmatter de posts — slugs independentes, metadados (título, data, lang, translationKey), listagem por idioma
- `blog/static-pages`: Páginas estáticas (Sobre, Contacto) em todos os idiomas ativos
- `blog/rss`: Feeds RSS separadas por idioma
- `blog/design`: Sistema de design de raiz — layouts, CSS, partials, language switcher
- `blog/deployment`: Configuração de deploy em Netlify

### Modified Capabilities

## Impact

- Novo projeto: nenhum código existente é afetado
- Dependências introduzidas: Deno, Lume e plugins oficiais (`multilanguage`, `feed`, `date`)
- Deploy: Netlify (build command: `deno task build`, publish directory: `_site`)
