## Why

O comutador de idiomas e os links de navegação carecem de indicação visual do estado ativo: o idioma atual não está sublinhado, os itens de menu não marcam a página atual, e a home page apresenta um bug onde o comutador mostra apenas o idioma ativo em vez de todos os idiomas disponíveis.

## What Changes

- O idioma ativo no comutador de idiomas passa a ter sublinhado permanente (indicador visual de estado ativo).
- Os links de navegação (Sobre, Contacto, e quaisquer futuros) passam a ter sublinhado quando correspondem à página atual.
- A home page (`/` e `/en/`) passa a incluir `translationKey: home` no frontmatter para que o plugin multilíngue gere os `alternates` corretos e o comutador mostre todos os idiomas disponíveis.

## Capabilities

### New Capabilities

- `blog/nav-active-state`: Indicação visual do item ativo na navegação principal e no comutador de idiomas.

### Modified Capabilities

- `blog/multilanguage`: A home page deve participar na ligação entre traduções via `translationKey` para que o comutador de idioma funcione corretamente em todas as páginas.

## Impact

- `src/_includes/partials/header.vto` — lógica de classe ativa para nav e lang switcher.
- `src/assets/css/_header.css` — estilos para `.site-nav__link--active` e `.lang-switcher__item--active` com sublinhado.
- `src/index.md` e `src/en/index.md` — adição de `translationKey: home`.
- `openspec/specs/blog/multilanguage/spec.md` — delta sobre home page e comutador.
