## 1. Token baseline

- [x] 1.1 Añadir `--baseline: calc(var(--font-size-base) * var(--line-height))` en el bloque `:root` de `src/assets/css/main.css`, junto a los demás tokens tipográficos

## 2. Espaciado en .post__content

- [x] 2.1 Cambiar `margin-bottom` de `.post__content p` de `var(--space-md)` a `var(--baseline)`
- [x] 2.2 Cambiar `margin-top` de `.post__content h2` de `var(--space-xl)` a `var(--baseline)`
- [x] 2.3 Cambiar `margin-bottom` de `.post__content h2` de `var(--space-sm)` a `var(--baseline)`
- [x] 2.4 Cambiar `margin-top` de `.post__content h3` de `var(--space-lg)` a `var(--baseline)`
- [x] 2.5 Cambiar `margin-bottom` de `.post__content h3` de `var(--space-sm)` a `var(--baseline)`
- [x] 2.6 Cambiar `margin` de `.post__content blockquote` de `var(--space-lg) 0` a `var(--baseline) 0`

## 3. Espaciado en .page__content

- [x] 3.1 Cambiar `margin-bottom` de `.page__content p` de `var(--space-md)` a `var(--baseline)`

## 4. Verificación

- [x] 4.1 Levantar el servidor local y revisar un post con h2, h3, párrafos y blockquote: verificar que todos los huecos verticales son visualmente iguales (una línea vacía)
- [x] 4.2 Verificar en DevTools que `--baseline` resuelve al valor correcto en cada breakpoint
