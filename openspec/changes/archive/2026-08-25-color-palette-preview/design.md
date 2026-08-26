## Context

El sitio usa Lume (SSG en Deno) con plantillas Vento (`.vto`) y un único archivo CSS (`src/assets/css/main.css`). Las páginas de contenido simples usan frontmatter + Markdown con el layout `layouts/page.vto`. Ver `proposal.md` para la motivación.

Los colores a visualizar son valores fijos derivados de la exploración (no datos externos), por lo que no requieren ningún pipeline de datos.

## Goals / Non-Goals

**Goals:**
- Página accesible en `/paleta/` que renderiza todo el contenido de muestra de color sin tocar el CSS global
- Cero dependencias nuevas
- Fácil de eliminar una vez tomada la decisión de paleta

**Non-Goals:**
- Integración con el sistema de color del sitio (eso es otro change)
- Versión EN ni traducciones
- Persistencia de decisiones (la página es solo de lectura)
- Accesibilidad de la propia página de herramienta (no es contenido público)

## Decisions

### Plantilla Vento en lugar de Markdown
La página necesita HTML estructurado (swatches, grids, combinaciones) que no es expresable en Markdown limpio. Se usa un archivo `.vto` en `src/paleta.vto` con el layout `layouts/base.vto` directamente — no `layouts/page.vto` — para tener control total sobre la estructura sin heredar el `.page__content` ni el max-width de 48ch que limitaría el ancho de las muestras.

**Alternativa descartada:** Nuevo layout específico. Añadir complejidad de layout no está justificada para una página temporal de herramienta.

### Estilos en `<style>` scoped en la página
Los estilos de las muestras (swatches, grids, tablas de combinaciones) van en un bloque `<style>` dentro de la plantilla, no en `main.css`. Esto garantiza aislamiento total — la página de herramienta no afecta al resto del sitio y puede eliminarse sin dejar rastro en el CSS.

**Alternativa descartada:** Archivo CSS separado importado. Añade un request y complejidad de build para una página temporal.

### Valores hex hardcodeados en la plantilla
Los 10 tintes y 6 sombras son valores fijos calculados en la exploración. Se declaran como variables CSS al inicio del bloque `<style>` de la página, comentados con su paso (0%, 10%, etc.) y ratio de contraste donde corresponda.

### No incluir la página en la navegación
La página no se añade a los datos de nav (no es un array configurable en este proyecto — el header es estático en `partials/header.vto`). Al no añadir el enlace al header, la página queda accesible solo por URL directa.

## Risks / Trade-offs

- [La página existe en producción si se hace deploy] → No tiene meta `robots: noindex` pero tampoco está enlazada, por lo que no es descubrible en práctica. Riesgo bajo para un sitio personal.
- [Los ratios de contraste en la página son calculados manualmente] → Son aproximaciones. Si se necesita precisión, usar una herramienta como WebAIM Contrast Checker sobre los valores finales elegidos.
