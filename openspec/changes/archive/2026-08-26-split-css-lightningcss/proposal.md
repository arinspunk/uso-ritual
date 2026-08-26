## Why

El CSS del proyecto vive en un único archivo de ~560 líneas (`src/assets/css/main.css`) que Lume copia sin procesar. A medida que el blog incorpore nuevas secciones y shortcodes, el archivo se volverá difícil de mantener. Es buen momento para establecer una estructura modular antes de que crezca más.

## What Changes

- Se añade el plugin `lightningcss` de Lume en `_config.ts`, reemplazando `site.copy("assets/css")` por `site.use(lightningCss())`.
- `src/assets/css/main.css` pasa a ser un archivo de entrada con solo directivas `@import`.
- Los estilos se dividen en archivos parciales temáticos dentro de `src/assets/css/`.
- LightningCSS bundlea los `@import` en tiempo de build, produciendo un único `main.css` en el output — sin cambios para el navegador.
- Se aprovecha la oportunidad para habilitar CSS nesting moderno donde simplifique selectores compuestos.

## Capabilities

### New Capabilities

_(ninguna — cambio de tooling puro, sin comportamiento nuevo de cara al usuario)_

### Modified Capabilities

_(ninguna — el CSS generado es funcionalmente idéntico)_

## Impact

- **`_config.ts`**: sustituir `site.copy("assets/css")` por `site.use(lightningCss())` con la importación correspondiente.
- **`src/assets/css/`**: refactorizar `main.css` en ~7-8 archivos parciales.
- **`deno.json`**: sin cambios — LightningCSS es parte de Lume, no una dependencia externa.
- **Output final**: el navegador recibe exactamente el mismo `main.css` en la misma ruta; cero impacto en HTML o templates.
