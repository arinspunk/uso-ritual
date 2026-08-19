## Context

Novo projeto sem codebase existente. Ver proposal.md — Why para a motivação. Stack: Lume (SSG) + Deno, deploy em Netlify. PT é o idioma por defeito (sem prefixo de URL); EN usa `/en/`; Euskera usará `/eu/` quando ativado.

## Goals / Non-Goals

**Goals:**
- Configurar o projeto Lume com plugin `multilanguage`, PT como `defaultLang`
- Estrutura de diretórios que suporte idiomas adicionais sem reestruturação
- Sistema de frontmatter com `translationKey` para ligar traduções sem obrigatoriedade
- RSS feeds por idioma usando o plugin `feed` do Lume
- CSS escrito de raiz, sem frameworks ou dependências externas em runtime
- `netlify.toml` com `deno task build` e publish `_site`

**Non-Goals:**
- CMS ou interface de edição visual
- Redirects automáticos baseados no idioma do browser
- Sistema de comentários
- Formulário de contacto com backend
- Tipos de conteúdo estruturados (reviews com rating, etc.) — emergem mais tarde

## Decisions

### 1. Lume `multilanguage` plugin com `defaultLang: "pt"`

**Decisão**: Usar o plugin oficial `multilanguage` do Lume com PT como língua por defeito.

**Porquê**: O plugin gera URLs sem prefixo para o `defaultLang` e com prefixo para os restantes (`/en/`, `/eu/`) — exatamente a URL structure decidida. Não requer lógica personalizada de roteamento.

**Alternativa considerada**: Roteamento manual com redirects Netlify. Rejeitado: mais frágil e não aproveita a integração nativa do Lume.

---

### 2. Conteúdo organizado por diretório de idioma

**Decisão**: Cada idioma tem o seu próprio diretório na raiz de `src/`:

```
src/
├── pt/
│   ├── posts/
│   ├── sobre.md
│   └── contacto.md
├── en/
│   ├── posts/
│   ├── about.md
│   └── contact.md
└── eu/           ← criado quando Euskera for ativado
    ├── posts/
    ├── buruz.md
    └── kontaktua.md
```

Cada ficheiro declara `lang: <codigo>` no frontmatter. O plugin multilanguage usa este campo para o roteamento.

**Porquê**: Separação clara por idioma, fácil de navegar para o autor. Adicionar Euskera é criar o diretório `eu/` e um campo na configuração — sem tocar nos outros idiomas.

**Alternativa considerada**: Ficheiro único por post com blocos por idioma no frontmatter. Rejeitado: ficheiros crescem, mistura idiomas, e o Lume favorece o modelo por ficheiro.

---

### 3. `translationKey` no frontmatter para ligar traduções

**Decisão**: Traduções são ligadas por um campo `translationKey` opcional no frontmatter. O plugin multilanguage do Lume usa este campo nativamente para construir o comutador de idioma.

```yaml
---
title: Novo disco do Porto
lang: pt
slug: novo-disco-porto
date: 2025-08-18
translationKey: porto-record-2025   # opcional
---
```

**Porquê**: Permite slugs independentes por idioma (melhor SEO, mais natural) sem perder a ligação entre traduções. A ausência do campo não impede a publicação — posts sem tradução publicam normalmente e não aparecem no comutador de outros posts.

---

### 4. Strings de UI em ficheiros `_data` por idioma

**Decisão**: Textos de interface (labels de nav, textos do comutador de idioma, etc.) são declarados em ficheiros de dados por idioma:

```
src/_data/
├── pt/
│   └── i18n.yml   ← { nav_sobre: "Sobre", nav_contacto: "Contacto", ... }
└── en/
    └── i18n.yml   ← { nav_sobre: "About", nav_contacto: "Contact", ... }
```

O Lume expõe estes dados automaticamente aos templates do idioma correspondente.

**Porquê**: Separa conteúdo editorial de strings de interface. Adicionar Euskera é criar `eu/i18n.yml`.

---

### 5. RSS via plugin `feed` do Lume, uma feed por idioma

**Decisão**: Usar o plugin `feed` oficial do Lume, configurado para gerar uma feed por idioma em:
- `/pt/feed.xml`
- `/en/feed.xml`
- `/eu/feed.xml` (quando ativo)

**Porquê**: O plugin integra-se com o sistema de páginas do Lume sem necessitar de templates manuais de XML. Feeds separadas permitem ao leitor subscrever só o idioma que quer.

---

### 6. CSS de raiz sem frameworks externas

**Decisão**: CSS escrito à mão, servido como ficheiro estático. Sem Tailwind, Bootstrap, ou qualquer CDN em runtime. Fontes self-hosted ou do sistema (font-stack sem @import externo).

**Porquê**: Decisão explícita do utilizador. Reduz dependências externas, melhora performance e privacidade (sem requests a terceiros).

**Risco**: Mais tempo de implementação inicial para o sistema de design. Mitigação: começar com variáveis CSS (`--color-*`, `--space-*`) para consistência sem complexidade.

---

### 7. Sem redirects de deteção de idioma

**Decisão**: Netlify não configura redirects baseados em `Accept-Language`. A seleção de idioma é feita exclusivamente pelo utilizador via comutador.

**Porquê**: Redirects automáticos criam URLs canónicas ambíguas, complicam o SEO e podem surpreender leitores que partilham links. A URL `/` é sempre PT — sem exceções.

## Risks / Trade-offs

- **Comutador de idioma requer lógica de template** — o plugin multilanguage expõe as traduções disponíveis, mas o template tem de filtrar idiomas sem tradução. Risco baixo: é lógica de template padrão em Lume.

- **Sem redirects de idioma → experiência inicial em PT para todos** — utilizadores EN que acedem diretamente a `/` veem PT. Mitigação: comutador de idioma proeminente no cabeçalho.

- **Slugs independentes requerem disciplina** — o autor tem de manter `translationKey` sincronizado manualmente quando cria uma tradução. Não há validação automática em build. Risco baixo dado que é autor único.

- **Deno em Netlify requer plugin específico** — o Netlify suporta Deno via `netlify.toml` com a versão declarada. A configuração é estável mas menos comum que Node.js.

## Migration Plan

Projeto novo — não existe estado anterior. Sequência de setup:

1. `deno init` + `deno.json` com task `build`
2. Instalar Lume e plugins (`multilanguage`, `feed`, `date`)
3. Criar `_config.ts` com configuração de idiomas
4. Criar estrutura de diretórios `src/pt/`, `src/en/`
5. Layout base + CSS de raiz
6. Páginas estáticas (Sobre, Contacto) em PT e EN
7. Template de post e listagem
8. Configurar feeds RSS
9. `netlify.toml` + primeiro deploy
