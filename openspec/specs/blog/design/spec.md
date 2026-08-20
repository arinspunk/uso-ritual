## Purpose

Sistema visual do blogue construído de raiz — layouts, tipografia, CSS e componentes de interface — sem dependência de temas externos, adequado a um blogue editorial de música.

## Requirements

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
O layout SHALL ser funcional e legível em ecrãs de largura mínima de 320px (mobile) e máxima sem limite definido (desktop), sem dependência de frameworks CSS externas. O tamanho base da fonte SHALL variar por breakpoint: 16px em mobile (<768px), 17px em tablet (≥768px), 18px em laptop (≥1024px), 19px em desktop (≥1280px), 20px em large (≥1440px).

#### Scenario: Layout mobile usa coluna única
- **WHEN** o utilizador acede ao blogue num ecrã com largura inferior a 768px
- **THEN** o conteúdo é apresentado numa coluna única sem overflow horizontal

#### Scenario: Tamanho base da fonte cresce com o viewport
- **WHEN** o utilizador acede ao blogue num ecrã com largura ≥1440px
- **THEN** o tamanho base da fonte é 20px e todos os tamanhos derivados escalam proporcionalmente

### Requirement: Escala tipográfica basada en minor third
El sistema de tipografía SHALL seguir una escala ×1.2 (minor third) anclada al tamaño base del breakpoint activo: h1 = base×1.2, cuerpo/h2/h3 = base, caption/notas = base÷1.2. Todos los tamaños de fuente derivados SHALL expresarse en `rem` relativos al `font-size` del elemento `html`.

#### Scenario: h1 escala con el breakpoint
- **WHEN** el viewport es ≥1440px (base 20px)
- **THEN** el h1 se renderiza a 24px (20×1.2) y la caption a ≈16.7px (20÷1.2)

#### Scenario: Escala coherente en todos los breakpoints
- **WHEN** el viewport es ≥768px (base 17px)
- **THEN** el h1 se renderiza a ≈20.4px y la caption a ≈14.2px

### Requirement: Jerarquía tipográfica por familia y estilo
La jerarquía entre niveles de texto SHALL establecerse mediante familia tipográfica y estilo, no mediante diferencias de tamaño entre h2, h3 y el cuerpo. h1 y h2 SHALL usar fuente sans-serif (system-ui) con peso 400 y estilo normal. h3 SHALL usar fuente sans-serif con peso 400 y estilo italic. El cuerpo de texto y las captions SHALL usar fuente serif (Georgia).

#### Scenario: h2 se distingue del cuerpo solo por la familia
- **WHEN** un h2 y un párrafo adyacente se renderizan
- **THEN** ambos tienen el mismo tamaño pero el h2 usa sans-serif y el párrafo usa serif

#### Scenario: h3 se distingue del h2 por el estilo italic
- **WHEN** un h3 y un h2 adyacente se renderizan
- **THEN** ambos usan sans-serif al mismo tamaño, pero el h3 aparece en italic

### Requirement: Medida de línea calibrada en 48ch
La columna de lectura SHALL tener siempre `max-width: 48ch`. Este valor equivale a aproximadamente 66 caracteres por línea en Georgia (el "0" de Georgia es más ancho que el carácter promedio: 65ch = ~88 chars, 48ch = ~66 chars). Este valor SHALL mantenerse tanto en layout de una columna como en layout de dos columnas (texto + media). En viewports donde 48ch supere el ancho disponible, la columna SHALL ser fluida (`width: 100%`) sin forzar scroll horizontal.

#### Scenario: Medida fija en layout de dos columnas
- **WHEN** un post tiene columna de media y el viewport es ≥1100px
- **THEN** la columna de texto tiene max-width de 48ch, no el ancho libre del grid

#### Scenario: Columna fluida en mobile
- **WHEN** el viewport es <768px
- **THEN** la columna de texto ocupa el 100% del ancho disponible (la línea resultante será inferior a 48ch)

### Requirement: Alineación izquierda sin guionado
Todo el texto de la columna de lectura SHALL tener `text-align: left`. El guionado automático SHALL estar desactivado (`hyphens: none`) en toda la columna. Esto aplica a todos los idiomas del sitio (ES, GL, PT).

#### Scenario: Texto sin justificación ni guiones en cualquier idioma
- **WHEN** se renderiza un post en gallego, español o portugués
- **THEN** el texto aparece alineado a la izquierda sin guiones automáticos en ninguna línea

### Requirement: CSS sem dependências externas em runtime
O sistema SHALL gerar CSS estático sem dependência de ficheiros CSS externos carregados em runtime (sem CDN, sem Google Fonts em runtime); fontes e estilos SHALL ser servidos a partir do próprio site ou embutidos.

#### Scenario: Página carrega sem pedidos a domínios externos para CSS
- **WHEN** a página é carregada com a rede cortada após o HTML inicial
- **THEN** o estilo visual é preservado sem erros de recursos em falta
