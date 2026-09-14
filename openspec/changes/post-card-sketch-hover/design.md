## Context

El proyecto no tiene ningún JavaScript activo: no hay bundler, no hay módulos JS en `src/assets/`. El stack es Lume (Deno), Vento para templates, y LightningCSS. Ver proposal.md para la motivación del cambio.

La estructura de la post card es:

```
<article class="post-card">          ← position: relative
  <div class="post-card__media">    ← overflow: hidden (zoom effect)
    <img class="post-card__thumbnail">
  </div>
  <a class="post-card__link">       ← ::after cubre toda la card
```

El `overflow: hidden` en `.post-card__media` es intencional: recorta la imagen al hacer zoom en hover. El SVG del trazo debe vivir fuera de ese contenedor.

## Goals / Non-Goals

**Goals:**
- Añadir un SVG por card con un trazo irregular que rodea la thumbnail, visible solo en hover
- Que el trazo sea distinto cada hover (selección aleatoria entre paths dibujados a mano)
- Grosor uniforme (no caligráfico)
- Animación de dibujo progresivo (stroke-dashoffset)
- Color y grosor controlables con CSS custom properties
- Sin afectar el comportamiento de zoom existente ni el layout

**Non-Goals:**
- Soporte para cards sin thumbnail
- Efectos de salida (el trazo desaparece sin animación al quitar el hover)
- Múltiples trazos simultáneos por card
- Animación de entrada en la primera carga de página

## Decisions

### 1. Fuente de los paths: dibujados a mano por el autor

**Decisión**: el autor dibuja los trazos en una herramienta vectorial (Figma, Illustrator, etc.), exporta los SVG, y extrae los atributos `d` de cada `<path>`. Esos strings se almacenan como array en `post-card-sketch.js`.

Sin dependencias externas, sin red. El autor controla completamente el estilo, la rugosidad y el carácter del trazo. El array debe contener al menos 6–8 paths para que la variación percibida sea suficiente.

**Alternativa descartada (anterior)**: Rough.js vía ESM import desde esm.sh. Generaba paths distintos en cada hover pero sin control estético. Se descarta porque el autor quiere definir exactamente cómo quedan los trazos.

### 2. Posición del SVG: hermano de `.post-card__media`

**Decisión**: insertar un `<svg class="post-card__sketch">` como hermano inmediatamente posterior a `.post-card__media`.

```
<article class="post-card">
  <div class="post-card__media"> ... </div>
  <svg class="post-card__sketch" aria-hidden="true"> ... </svg>  ← nuevo
  <a class="post-card__link"> ... </a>
```

El SVG se posiciona `absolute` relativo a `.post-card` (ya `position: relative`), alineado sobre `.post-card__media`. Su `overflow` es `visible`, por lo que el trazo puede desbordar sin ser recortado.

**Alternativa descartada**: colocar el SVG dentro de `.post-card__media`. El `overflow: hidden` de ese contenedor recortaría el trazo en los bordes.

### 3. Escalado del path: viewBox relativo al bounding box original

**Decisión**: cada path se dibuja en un espacio de coordenadas arbitrario (el del canvas de la herramienta vectorial). El SVG se renderiza con un `viewBox` que corresponde al bounding box del path original, y con `preserveAspectRatio="xMidYMid meet"`. El SVG se dimensiona en CSS para cubrir el área de `.post-card__media` más el padding de desborde.

Esto permite que los paths originales se escalen proporcionalmente al tamaño de la card sin recalcular coordenadas. El padding de desborde se controla ajustando el tamaño del SVG en CSS (por ejemplo `width: calc(100% + 28px); margin: -14px`).

### 4. Animación: stroke-dashoffset via Web Animations API

**Decisión**: calcular `getTotalLength()` del path y animar `stroke-dashoffset` de su valor total a 0.

```js
path.style.strokeDasharray = length;
path.style.strokeDashoffset = length;
path.animate(
  [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
  { duration: 500, easing: "ease-out", fill: "forwards" }
);
```

La Web Animations API es síncrona con el layout, disponible en todos los browsers modernos, y no requiere librerías adicionales.

### 5. Parámetros del trazo: CSS custom properties

**Decisión**: el módulo JS lee `--sketch-color` y `--sketch-stroke-width` del computed style del elemento antes de pintar.

```js
const style = getComputedStyle(card);
const color = style.getPropertyValue("--sketch-color").trim() || "currentColor";
const width = parseFloat(style.getPropertyValue("--sketch-stroke-width")) || 2;
```

Valores por defecto hardcoded en JS como fallback; los valores operativos van en CSS.

### 6. Selección aleatoria: sin repetición consecutiva del path; transform independiente

**Decisión**: cada `mouseenter` selecciona un índice aleatorio del array de paths, evitando repetir el índice anterior. El transform CSS se elige siempre al azar de forma independiente, sin restricción de repetición.

```js
const TRANSFORMS = [
  "",
  "scaleX(-1)",
  "scaleY(-1)",
  "rotate(90deg)",
  "rotate(180deg)",
  "rotate(270deg)",
];

let lastIndex = -1;
card.addEventListener("mouseenter", () => {
  let i;
  do { i = Math.floor(Math.random() * paths.length); } while (i === lastIndex && paths.length > 1);
  lastIndex = i;
  const t = TRANSFORMS[Math.floor(Math.random() * TRANSFORMS.length)];
  svg.style.transform = t;
  svg.style.transformOrigin = "center";
  // renderizar paths[i]
});
```

Con 7 paths × 6 transforms = 42 combinaciones posibles, la probabilidad de repetir el par exacto en hovers consecutivos es ~2.4% — suficientemente baja sin lógica adicional.

**Alternativa descartada**: no repetir ni path ni transform (Opción B). Añade complejidad de estado sin beneficio perceptible dado el espacio de 42 combinaciones.

### 7. Event handling: listener por card, inicialización en DOMContentLoaded

**Decisión**: un listener `mouseenter` por `.post-card` que contiene un `<svg class="post-card__sketch">`. El SVG se inserta una sola vez en `DOMContentLoaded`; en cada hover solo se actualiza el path interior.

El script se incluye en `home.vto` (no en `base.vto`) para no añadir JS en posts o páginas estáticas.

## Risks / Trade-offs

- **Variación limitada por número de paths**: resuelto con transforms CSS — 7 paths × 6 transforms dan 42 combinaciones; la repetición exacta es estadísticamente rara.
- **Escalado proporcional puede dejar márgenes**: si el aspect ratio del path original difiere mucho del de la card, `meet` introduce espacio en blanco. Mitigación: dibujar los paths en un canvas con ratio 3:2 (mismo que `.post-card__media`).
- **`getTotalLength()` requiere que el SVG esté en el DOM**: el path debe añadirse al DOM antes de leer la longitud. El flujo propuesto lo garantiza.
