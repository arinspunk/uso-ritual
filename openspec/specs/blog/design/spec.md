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
La jerarquía entre niveles de texto SHALL establecerse mediante familia tipográfica y estilo, no mediante diferencias de tamaño entre h2, h3 y el cuerpo. h1 y h2 SHALL usar la fuente Isaac Sans con peso 400 y estilo normal. h3 SHALL usar Isaac Sans con peso 400 y estilo italic. El cuerpo de texto y las captions SHALL usar la fuente Novela con peso 400. Ningún elemento SHALL usar un peso tipográfico distinto de 400 — el contraste visual se establece exclusivamente mediante familia, tamaño y estilo.

#### Scenario: h2 se distingue del cuerpo solo por la familia
- **WHEN** un h2 y un párrafo adyacente se renderizan
- **THEN** ambos tienen el mismo tamaño pero el h2 usa Isaac Sans y el párrafo usa Novela

#### Scenario: h3 se distingue del h2 por el estilo italic
- **WHEN** un h3 y un h2 adyacente se renderizan
- **THEN** ambos usan Isaac Sans al mismo tamaño, pero el h3 aparece en italic

#### Scenario: No hay diferencias de peso en ningún elemento
- **WHEN** se inspecciona el CSS renderizado en cualquier elemento del sitio
- **THEN** todos los elementos muestran font-weight 400, sin excepción

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
O sistema SHALL gerar CSS estático sem dependência de ficheiros CSS externos carregados em runtime (sem CDN, sem Google Fonts em runtime); fontes e estilos SHALL ser servidos a partir do próprio site ou embutidos. O sistema de cor SHALL implementar-se exclusivamente com custom properties CSS nativas, sem preprocessadores nem dependências de build adicionais. As fontes tipográficas SHALL ser servidas desde `src/assets/fonts/` como ficheiros estáticos copiados pelo build.

#### Scenario: Página carrega sem pedidos a domínios externos para CSS
- **WHEN** a página é carregada com a rede cortada após o HTML inicial
- **THEN** o estilo visual é preservado sem erros de recursos em falta

#### Scenario: Variables de color resolvibles sin build step
- **WHEN** el CSS es inspeccionado en el navegador
- **THEN** todas las custom properties de color están definidas en `:root` y son resolvibles por el navegador sin transformación previa

#### Scenario: Fuentes tipográficas sin petición a dominios externos
- **WHEN** se inspecciona el tráfico de red al cargar cualquier página
- **THEN** los archivos de fuente se sirven desde el mismo dominio, sin peticiones a CDN ni servicios de tipografía externos

### Requirement: Sistema de color de dos capas — escala primitiva y tokens semánticos
El CSS SHALL declarar en `:root` una escala primitiva completa de tintes y sombras de los colores base de la paleta Sanzo Wada Classic #295, y tokens semánticos que referencian esa escala mediante `var()`. Ningún valor de color SHALL aparecer hardcodeado fuera de la escala primitiva.

#### Scenario: Escala primitiva de Cream Yellow declarada completa
- **WHEN** se inspecciona el `:root` del CSS
- **THEN** existen las variables `--cy-0` a `--cy-90` en pasos del 10%, con valores calculados como tintes lineales de `#fdbf68` hacia blanco

#### Scenario: Escala primitiva de Dull Violet Black declarada completa
- **WHEN** se inspecciona el `:root` del CSS
- **THEN** existen las variables `--dvb-0` a `--dvb-50` en pasos del 10%, con valores calculados como sombras lineales de `#1e0e3f` hacia negro

#### Scenario: Colores fijos de paleta declarados
- **WHEN** se inspecciona el `:root` del CSS
- **THEN** existen `--wada-yellow: #fff200` y `--wada-blue: #006eb8`

#### Scenario: Tokens semánticos referencian la escala
- **WHEN** se inspecciona el `:root` del CSS
- **THEN** los tokens `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-accent` usan `var(--cy-*)` o `var(--dvb-*)` en lugar de valores hex directos

### Requirement: Links inline sin color de acento
Los links dentro del contenido de texto (posts, páginas estáticas) SHALL heredar el color del texto circundante y ser distinguibles únicamente por subrayado. El color `--color-accent` SHALL NOT aplicarse como `color` en elementos `<a>` dentro de `.post__content` ni `.page__content`.

#### Scenario: Link inline en cuerpo de post
- **WHEN** un post contiene un `<a>` en el cuerpo de texto
- **THEN** el link tiene el mismo color que el texto circundante y muestra subrayado

### Requirement: Blockquote con borde en color Blue
El borde izquierdo de los blockquotes SHALL usar el color Blue de la paleta (`--wada-blue`, `#006eb8`), no el color de acento general. Este requisito aplica tanto a `.post__content blockquote` como a `.media-item--quote`.

#### Scenario: Blockquote en post
- **WHEN** un post contiene un blockquote
- **THEN** el borde izquierdo del blockquote es `#006eb8`, no el color de acento

### Requirement: Botón de acción con dos variantes de paleta
El sitio SHALL disponer de dos variantes de botón de acción en la paleta Wada Classic #295: variante primaria (Dull Violet Black `#1e0e3f` como fondo, Cream Yellow 80% como texto) y variante alternativa (Yellow `#fff200` como fondo, Dull Violet Black como texto). Ambas variantes SHALL tener ratio de contraste ≥ 4.5:1 entre fondo y texto del botón.

#### Scenario: Botón primario legible
- **WHEN** se renderiza un botón con clase de variante primaria
- **THEN** el texto del botón tiene ratio de contraste ≥ 4.5:1 sobre su fondo

#### Scenario: Botón alternativo legible
- **WHEN** se renderiza un botón con clase de variante alternativa
- **THEN** el texto del botón tiene ratio de contraste ≥ 4.5:1 sobre su fondo

### Requirement: Ritmo vertical basado en baseline
Todo el espaciado vertical entre elementos de contenido editorial SHALL derivarse de un único token `--baseline`, calculado como el producto del tamaño de fuente base del breakpoint activo y el interlineado del cuerpo. Un espacio de un baseline equivale a una línea vacía visible entre bloques de texto. Los tokens de espacio genéricos (`--space-*`) SHALL NOT usarse para márgenes entre elementos de texto dentro de `.post__content` ni `.page__content`.

#### Scenario: Espacio entre párrafos es exactamente un baseline
- **WHEN** se renderizan dos párrafos consecutivos en un post
- **THEN** el espacio vertical entre el final del primero y el inicio del segundo es igual a un baseline (font-size-base × line-height)

#### Scenario: Espacio antes y después de un heading es un baseline
- **WHEN** un h2 o h3 aparece entre párrafos en un post
- **THEN** el espacio visual antes del heading y el espacio visual después son cada uno igual a un baseline

#### Scenario: El baseline escala con el breakpoint
- **WHEN** el viewport cambia de tamaño y el font-size-base aumenta
- **THEN** el baseline aumenta proporcionalmente y los espacios entre elementos de texto se actualizan sin cambios adicionales en el CSS
