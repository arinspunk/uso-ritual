## Purpose

Sistema visual do blogue construído de raiz — layouts, tipografia, CSS e componentes de interface — sem dependência de temas externos, adequado a um blogue editorial de música.

## ADDED Requirements

### Requirement: Layout base com navegação e rodapé
O sistema SHALL apresentar em todas as páginas um layout consistente com: cabeçalho com nome do blogue e navegação principal, área de conteúdo principal, e rodapé com informação secundária (links, créditos).

#### Scenario: Todas as páginas partilham o mesmo layout base
- **WHEN** o utilizador navega entre a home, um post e a página Sobre
- **THEN** o cabeçalho e o rodapé são visualmente consistentes em todas as páginas

### Requirement: Comutador de idioma visível em todas as páginas
O sistema SHALL apresentar em todas as páginas um comutador de idioma que mostre apenas os idiomas nos quais a página atual tem uma versão disponível.

#### Scenario: Comutador mostra idiomas disponíveis
- **WHEN** um post tem versão PT e EN mas não EU
- **THEN** o comutador mostra PT e EN como opções, não EU

#### Scenario: Idioma ativo distinguível visualmente
- **WHEN** o utilizador está numa página PT
- **THEN** o idioma PT aparece distinguido dos restantes (ex: sublinhado, peso diferente, sem link)

### Requirement: Listagem de posts com título, data e idioma
A listagem de posts SHALL mostrar para cada post: título, data de publicação formatada no idioma da página, e indicação visual de idioma (quando relevante em contextos mistos).

#### Scenario: Data formatada no idioma da página
- **WHEN** um post PT com `date: 2025-08-18` aparece na listagem
- **THEN** a data é apresentada em formato português (ex: "18 de agosto de 2025")

### Requirement: Design responsivo — mobile e desktop
O layout SHALL ser funcional e legível em ecrãs de largura mínima de 320px (mobile) e máxima sem limite definido (desktop), sem dependência de frameworks CSS externas.

#### Scenario: Layout mobile usa coluna única
- **WHEN** o utilizador acede ao blogue num ecrã com largura inferior a 640px
- **THEN** o conteúdo é apresentado numa coluna única sem overflow horizontal

### Requirement: CSS sem dependências externas em runtime
O sistema SHALL gerar CSS estático sem dependência de ficheiros CSS externos carregados em runtime (sem CDN, sem Google Fonts em runtime); fontes e estilos SHALL ser servidos a partir do próprio site ou embutidos.

#### Scenario: Página carrega sem pedidos a domínios externos para CSS
- **WHEN** a página é carregada com a rede cortada após o HTML inicial
- **THEN** o estilo visual é preservado sem erros de recursos em falta
