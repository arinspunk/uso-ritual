## 1. Variables CSS

- [x] 1.1 Mover `--font-size-base` de `body` a `html` y convertirlo en el valor absoluto del breakpoint activo
- [x] 1.2 Añadir `--font-size-h1: calc(1rem * 1.2)` y `--font-size-caption: calc(1rem / 1.2)` en `:root`
- [x] 1.3 Añadir media queries sobre `:root` para los cinco breakpoints (768px → 17px, 1024px → 18px, 1280px → 19px, 1440px → 20px)

## 2. Jerarquía tipográfica

- [x] 2.1 Aplicar `font-family: var(--font-ui); font-size: var(--font-size-h1); font-weight: 400; line-height: 1.2` a `.post__title` y cualquier h1 del cuerpo
- [x] 2.2 Aplicar `font-family: var(--font-ui); font-size: var(--font-size-body); font-weight: 400; line-height: 1.4` a `.post__content h2`
- [x] 2.3 Aplicar `font-family: var(--font-ui); font-style: italic; font-size: var(--font-size-body); font-weight: 400; line-height: 1.4` a `.post__content h3`
- [x] 2.4 Aplicar `font-family: var(--font-body); font-size: var(--font-size-caption); line-height: 1.5` a `.media-item__caption` y cualquier clase de nota al pie

## 3. Medida de línea

- [x] 3.1 Establecer `max-width: 65ch; width: 100%` en `.post__content`
- [x] 3.2 Eliminar la regla `max-width: none` del selector `.post__body--with-media .post__content`
- [x] 3.3 Hacer lo mismo en `.page__content p` — sustituir `max-width: 65ch` en el `p` por `max-width: 65ch` en el contenedor `.page__content`

## 4. Alineación y guionado

- [x] 4.1 Añadir `text-align: left; hyphens: none` a `.post__content` y `.page__content`

## 5. Verificación visual

- [x] 5.1 Revisar un post sin media en mobile (375px), tablet (768px), laptop (1280px) y large (1440px)
- [x] 5.2 Revisar un post con columna de media en ≥1100px — confirmar texto 48ch, media 32ch, gap 1.5rem; y en <1100px ver que apila correctamente
- [x] 5.3 Confirmar que h1, h2, h3, body y caption se distinguen visualmente con la escala ×1.2 y sin diferencia de peso
