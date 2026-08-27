## Context

O header é um partial Vento (`header.vto`) incluído em todas as páginas via `base.vto`. O template já tem acesso a `lang` (idioma atual) e `url` (URL da página atual) como variáveis de contexto do Lume. O comutador de idiomas usa a variável `alternates` injetada pelo plugin `multilanguage`; quando `alternates` está vazio (caso da home sem `translationKey`), o comutador não gera links para outros idiomas.

Os estilos da navegação e do comutador vivem em `src/assets/css/_header.css`.

## Goals / Non-Goals

**Goals:**
- Sublinhado no idioma ativo do comutador (estado visual, não apenas semântico via `aria-current`).
- Sublinhado no link de navegação correspondente à página atual.
- Comutador da home page a mostrar todos os idiomas disponíveis.

**Non-Goals:**
- Alterar a lógica de ocultação de posts sem tradução.
- Redesenhar o header ou o comutador de idiomas.
- Suporte a novos idiomas (extensível por design, mas fora do scope deste change).

## Decisions

### 1. Active state via comparação de URL no template

**Decisão**: Usar `url` (URL da página atual, disponível em contexto Lume) para comparar com os URLs dos links de navegação definidos no i18n e marcar o link ativo com a classe `site-nav__link--active`.

**Alternativas consideradas**:
- Frontmatter `activeNav: sobre` em cada página → requer manutenção manual em cada ficheiro de conteúdo; frágil ao renomear páginas.
- Usar `page.src.path` → menos fiável para páginas geradas dinamicamente.

A comparação por URL é automática e não exige nada dos ficheiros de conteúdo.

### 2. Sublinhado via CSS na classe `--active`

**Decisão**: Adicionar `text-decoration: underline` à classe existente `.lang-switcher__item--active` e à nova classe `.site-nav__link--active`. Não alterar a marcação semântica (`aria-current` permanece).

**Alternativas consideradas**:
- Usar `::after` pseudo-elemento com borda — mais complexo e inconsistente com o sublinhado ao hover já definido para outros estados.
- Usar `font-weight: bold` — muda o layout (reflow); sublinhado é preferível para texto de navegação compacto.

### 3. Fix da home page: `translationKey: home`

**Decisão**: Adicionar `translationKey: home` ao frontmatter de `src/index.md` e `src/en/index.md`. O plugin `multilanguage` do Lume usa este campo para ligar páginas entre si e popular `alternates`.

**Alternativas consideradas**:
- Injetar `alternates` manualmente via preprocessor — mais frágil e contraria o contrato do plugin.
- Hardcode no template da home — duplica lógica e não escala para novos idiomas.

`translationKey` é a forma canónica usada já para os posts; aplicar o mesmo padrão à home é consistente.

## Risks / Trade-offs

- [Comparação de URL para nav ativo] → A comparação de string exata pode falhar se os URLs tiverem trailing slash inconsistente. Mitigation: usar a função de normalização de URL do Lume ou garantir consistência nas URLs do i18n.
- [translationKey na home] → Valor `home` é arbitrário; se existir outro ficheiro com `translationKey: home` num terceiro idioma no futuro, o plugin irá ligá-lo automaticamente — comportamento desejado e correto.
