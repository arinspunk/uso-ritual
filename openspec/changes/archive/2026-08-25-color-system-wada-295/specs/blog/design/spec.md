## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: CSS sem dependências externas em runtime
O sistema SHALL gerar CSS estático sem dependência de ficheiros CSS externos carregados em runtime (sem CDN, sem Google Fonts em runtime); fontes e estilos SHALL ser servidos a partir do próprio site ou embutidos. O sistema de cor SHALL implementar-se exclusivamente com custom properties CSS nativas, sem preprocessadores nem dependências de build adicionais.

#### Scenario: Página carrega sem pedidos a domínios externos para CSS
- **WHEN** a página é carregada com a rede cortada após o HTML inicial
- **THEN** o estilo visual é preservado sem erros de recursos em falta

#### Scenario: Variables de color resolvibles sin build step
- **WHEN** el CSS es inspeccionado en el navegador
- **THEN** todas las custom properties de color están definidas en `:root` y son resolvibles por el navegador sin transformación previa

## ADDED Requirements

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
