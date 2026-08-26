## Context

El sitio tiene un único archivo CSS (`src/assets/css/main.css`) con un bloque `:root` que declara actualmente 6 variables de color hardcodeadas. Ver `proposal.md` para la motivación del cambio.

La paleta Sanzo Wada Classic #295 tiene cuatro colores base:
- `#fdbf68` Cream Yellow — fondo
- `#1e0e3f` Dull Violet Black — texto
- `#fff200` Yellow — acción
- `#006eb8` Blue — acento secundario

## Goals / Non-Goals

**Goals:**
- Reemplazar el bloque de variables `:root` con escala primitiva completa + tokens semánticos
- Actualizar todas las reglas CSS que referencian variables de color para que funcionen con los nuevos tokens
- Eliminar el uso de `--color-accent` como `color` en links inline
- Usar `--wada-blue` en lugar de `--color-accent` en borders de blockquote

**Non-Goals:**
- Dark mode (change separado)
- Cambios en tipografía, spacing o layout
- Nuevos componentes

## Decisions

### Nomenclatura de la escala primitiva
Prefijos cortos por color base: `--cy-N` (Cream Yellow), `--dvb-N` (Dull Violet Black). Los colores fijos usan `--wada-yellow` y `--wada-blue`.

**Alternativa descartada:** nombres largos tipo `--cream-yellow-tint-80`. Demasiado verboso para uso en `var()` encadenados.

### Token semántico `--color-text-muted`
Único token que no referencia la escala primitiva directamente: `#625270`, calculado como DVB aclarado 30% hacia el fondo (`#fff2e1`). No entra en la escala primitiva porque la fórmula mezcla dos colores distintos. Se documenta con un comentario en el CSS explicando su origen.

### Eliminación de `--color-accent` como color de link
El token `--color-accent` pasa a ser `var(--wada-blue)`. Las reglas `a { color: var(--color-accent) }` en `.post__content` y `.page__content` se eliminan — los links heredan el color del texto. Los links globales (footer, header) se revisan caso a caso.

### Botones: dos clases utilitarias
Se añaden `.btn-primary` (DVB como bg, Cream Yellow 80% como texto) y `.btn-alt` (Yellow como bg, DVB como texto) como clases reutilizables. No se modifica ningún botón existente en templates — las clases quedan disponibles para uso futuro.

**Alternativa descartada:** modificar botones existentes. No hay botones en el HTML actual, por lo que los estilos son puramente aditivos.

## Risks / Trade-offs

- [El Yellow `#fff200` sobre fondo `#fff2e1` tiene contraste ~1.1:1] → El Yellow solo se usa como fondo de botón `.btn-alt` con texto DVB encima (~13:1). Nunca como color de texto ni borde sobre fondo claro.
- [Cambio de `--color-accent` de rojo a azul afecta cualquier uso futuro que asuma rojo] → El rojo `#c8102e` desaparece completamente. Documentado como breaking change en la proposal.
- [`--color-text-muted: #625270` no tiene correspondencia exacta en la escala] → Aceptado. Comentado en el CSS con la fórmula de derivación.
