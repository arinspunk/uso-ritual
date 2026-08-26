## Purpose

Página estática interna que permite visualizar y comparar las combinaciones de fondo y texto derivadas de la paleta Sanzo Wada Classic #151, con texto real y ratios de contraste WCAG, para tomar decisiones de diseño antes de aplicar el nuevo sistema de color al sitio.

## ADDED Requirements

### Requirement: Página accesible en /paleta/
El sistema SHALL publicar la página de previsualización de paleta en la ruta `/paleta/` en el idioma por defecto (PT). No SHALL existir versión en inglés ni entrada en la navegación principal.

#### Scenario: Ruta disponible
- **WHEN** el usuario accede a `/paleta/`
- **THEN** el sistema sirve la página de previsualización con status 200

#### Scenario: Página no aparece en la navegación
- **WHEN** el usuario visualiza cualquier página del sitio
- **THEN** el enlace a `/paleta/` no aparece en el header ni en el footer

### Requirement: Escala de tintes del fondo
La página SHALL mostrar la escala completa de tintes de Sulphur Yellow (`#f5ecc2`) en pasos del 10%, del 0% al 90%, con el valor hex de cada paso visible.

#### Scenario: Escala de tintes visible
- **WHEN** el usuario accede a `/paleta/`
- **THEN** la página muestra 10 muestras de color con su hex, desde `#f5ecc2` hasta un tinte del 90%

### Requirement: Escala de sombras del texto
La página SHALL mostrar la escala de sombras de Vandar Poel's Blue (`#064f6e`) en pasos del 10%, del 0% al 50%, con el valor hex de cada paso visible.

#### Scenario: Escala de sombras visible
- **WHEN** el usuario accede a `/paleta/`
- **THEN** la página muestra 6 muestras de color con su hex, desde `#064f6e` hasta una sombra del 50%

### Requirement: Combinaciones nombradas con contraste
La página SHALL mostrar al menos cinco combinaciones nombradas de fondo y texto, cada una con un bloque de texto de muestra real (párrafo, encabezado, caption) y el ratio de contraste WCAG calculado.

#### Scenario: Combinaciones con texto real
- **WHEN** el usuario accede a `/paleta/`
- **THEN** cada combinación muestra texto de muestra sobre el fondo correspondiente, con el ratio de contraste expresado como `X.X:1` y la etiqueta WCAG (`AA` / `AAA`)

### Requirement: Muestra del color de acción
La página SHALL mostrar el Yellow Orange (`#f99d1b`) como color de acción con una muestra de elemento tipo botón.

#### Scenario: Botón de muestra visible
- **WHEN** el usuario accede a `/paleta/`
- **THEN** la página muestra un elemento visual que representa un botón usando `#f99d1b` como color de fondo

### Requirement: Muestra de links como texto con subrayado
La página SHALL mostrar un ejemplo de link usando el color de texto con subrayado, sin usar el color de acento, en cada combinación.

#### Scenario: Link sin color de acento
- **WHEN** el usuario visualiza las combinaciones en `/paleta/`
- **THEN** los links de muestra tienen el mismo color que el texto circundante y son distinguibles solo por el subrayado
