## Context

A listagem de posts usa `.post-list` (un `<ol>`) con clase `.col--wide` dentro do `.page-body`. A card actual (`.post-card`) ten un layout lateral con thumbnail de 72×72 px á dereita cando existe o campo `thumbnail`. O CSS relevante está en `src/assets/css/_post-list.css`. O template da home está en `src/_includes/layouts/home.vto`.

## Goals / Non-Goals

**Goals:**
- Grid de 2 columnas no `.post-list` en viewport ≥ 640 px
- Card con imaxe 3:2 arriba, texto abaixo, sen contedor propio
- Eliminar o layout lateral existente

**Non-Goals:**
- Cambios no layout `.col--wide` ou no sistema de columnas de `_page-body.css`
- Cambios no template de post individual
- Engadir animacións ou transicións

## Decisions

### `.post-list` pasa a `display: grid` con 2 columnas

`grid-template-columns: repeat(2, 1fr)` en pantallas ≥ 640 px, `1fr` en móvil. Alternativa considerada: `flex-wrap`, descartada porque o grid garante que as dúas columnas son sempre iguais en ancho sen calcular.

### `aspect-ratio: 3 / 2` sobre a thumbnail

`aspect-ratio: 3 / 2` con `width: 100%` e `object-fit: cover` na `.post-card__thumbnail`. Alternativa: `padding-top: 66.67%` con posicionamento absoluto — máis complexo e sen vantaxe.

### Eliminar `.post-card--with-thumb` e o condicional en `home.vto`

Con todos os posts tendo thumbnail, o modificador non engade valor. A card asume sempre o layout vertical. O condicional en `home.vto` elimínase para simplificar o markup.

### Separación entre cards mediante `gap` no grid

O grid herda o `gap` do sistema de espaciado. Non se engade bordo nin superficie á card para manter a composición solta sobre o fondo.

## Risks / Trade-offs

- **Posts sen thumbnail** → A card renderizará sen imaxe pero o layout vertical seguirá aplicando; visualmente quedará un oco no alto. Aceptable segundo os requisitos definidos.
- **Títulos longos en columna estreita** → En 2 columnas o ancho de cada card é ~50% de `col--wide`. Títulos moi longos poderían romper en moitas liñas. Mitigación: o CSS xa ten `line-height` e `font-size` axeitados; non se necesita acción adicional.
