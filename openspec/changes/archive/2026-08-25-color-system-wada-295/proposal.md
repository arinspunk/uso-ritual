## Why

La paleta actual del sitio (fondo off-white neutro, texto casi-negro, acento rojo) no refleja la identidad editorial de Uso Ritual — un blog de música con vocación nocturna y ritual. Aplicar la paleta Sanzo Wada Classic #295 da al sitio un carácter propio: papel cálido, tinta de grabado violeta y detalles en azul discreto.

## What Changes

- **BREAKING** Reemplazar las 6 variables CSS de color existentes por un sistema de dos capas: escala primitiva completa (tintes y sombras al 10%) + tokens semánticos que referencian la escala
- Nuevo fondo: Cream Yellow 80% (`#fff2e1`) en lugar del off-white neutro
- Nuevo texto: Dull Violet Black (`#1e0e3f`) en lugar del casi-negro
- Nuevo texto muted: derivado del Dull Violet Black aclarado 30% hacia el fondo (`#625270`)
- Nuevo surface y border: tintes 60% y 70% del Cream Yellow
- Links de texto: eliminado el color de acento en links inline; pasan a color heredado + subrayado
- Nuevo color de acento: Blue (`#006eb8`) para blockquotes y detalles discretos — reemplaza el rojo
- Color de acción: Yellow (`#fff200`) como fondo de botón alternativo; Dull Violet Black como botón primario en modo claro
- Dark mode: fuera del alcance de este change

## Capabilities

### New Capabilities

### Modified Capabilities
- `blog/design`: los requisitos de color cambian — nuevas variables, nueva semántica de links y botones, nuevo tratamiento del acento

## Impact

- `src/assets/css/main.css`: único archivo afectado — variables `:root`, reglas `a`, `blockquote`, estilos de botón
- Sin cambios en templates, layouts ni contenido
- Sin nuevas dependencias
