## 1. Plantilla de la página

- [x] 1.1 Crear `src/paleta.vto` con frontmatter (`title`, `layout: layouts/base.vto`, `url: /paleta/`) y estructura HTML base
- [x] 1.2 Añadir bloque `<style>` en la plantilla con las variables CSS de los 10 tintes de Sulphur Yellow y las 6 sombras de Vandar Poel's Blue, comentadas con su paso y hex

## 2. Escala de tintes del fondo

- [x] 2.1 Crear sección "Tintes del fondo — Sulphur Yellow" con 10 swatches (0%–90%) mostrando cada hex
- [x] 2.2 Verificar que los 10 valores hex están correctamente calculados contra la fórmula de tinte lineal

## 3. Escala de sombras del texto

- [x] 3.1 Crear sección "Sombras del texto — Vandar Poel's Blue" con 6 swatches (0%–50%) mostrando cada hex
- [x] 3.2 Verificar que los 6 valores hex están correctamente calculados contra la fórmula de sombra lineal

## 4. Combinaciones nombradas

- [x] 4.1 Crear sección "Combinaciones" con los 5 bloques nombrados: Wada puro, Piel de papel, Balance (B), Petróleo profundo, Lectura larga
- [x] 4.2 Cada bloque muestra: fondo real, texto de muestra (encabezado, párrafo, caption), ratio de contraste `X.X:1` y etiqueta WCAG
- [x] 4.3 Incluir en cada bloque un link de muestra con `color: inherit` y `text-decoration: underline`

## 5. Color de acción y verificación final

- [x] 5.1 Crear sección "Color de acción" con muestra del Yellow Orange `#f99d1b` como elemento tipo botón
- [x] 5.2 Levantar el servidor local y verificar que `/paleta/` carga correctamente y todas las secciones renderizan sin errores de CSS
