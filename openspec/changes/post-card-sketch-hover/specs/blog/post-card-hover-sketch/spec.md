## Purpose

Define el comportamiento del efecto de trazo dibujado a mano que aparece sobre la thumbnail de cada post card al hacer hover: generación, animación, y propiedades visuales configurables.

## ADDED Requirements

### Requirement: Trazo de garabato sobre thumbnail al hacer hover

El sistema SHALL mostrar un trazo de aspecto manual que rodea la thumbnail de la post card cuando el usuario hace hover sobre la card. El trazo SHALL ser invisible en reposo y visible únicamente durante el estado hover.

#### Scenario: Trazo aparece al hacer hover

- **WHEN** el usuario posiciona el cursor sobre una post card con thumbnail
- **THEN** aparece un trazo irregular que rodea la thumbnail, animándose progresivamente como si se estuviera dibujando en ese momento

#### Scenario: Trazo no aparece sin thumbnail

- **WHEN** la post card no tiene imagen de thumbnail
- **THEN** no se muestra ningún trazo ni elemento SVG adicional

### Requirement: Trazo distinto en cada hover

El sistema SHALL generar un trazo visualmente diferente cada vez que se activa el estado hover. Dos activaciones consecutivas sobre la misma card SHALL producir trazos distintos.

#### Scenario: Nuevo trazo en cada hover

- **WHEN** el usuario hace hover sobre una post card, retira el cursor, y vuelve a hacer hover
- **THEN** el segundo trazo tiene una forma perceptiblemente distinta al primero

### Requirement: Trazo puede desbordar los límites de la thumbnail

El trazo SHALL poder sobrepasar los bordes del contenedor de la imagen. El recorte aplicado a la imagen para el efecto de zoom SHALL no afectar al trazo.

#### Scenario: Trazo visible más allá del borde de la imagen

- **WHEN** el trazo generado se extiende más allá del borde de la thumbnail
- **THEN** la parte del trazo fuera del área de imagen es visible (no queda recortada)

### Requirement: Grosor de trazo uniforme

El trazo SHALL tener grosor constante en todo su recorrido, sin variaciones de presión. El aspecto SHALL ser el de un rotulador, no el de una pluma caligráfica.

#### Scenario: Grosor constante en el trazo

- **WHEN** se muestra el trazo de hover
- **THEN** el ancho de línea es el mismo en todas las partes del trazo, incluyendo curvas y extremos

### Requirement: Color y grosor configurables vía CSS

El color y el grosor del trazo SHALL ser controlables mediante propiedades CSS personalizadas (`--sketch-color`, `--sketch-stroke-width`) definidas en el selector de la post card o a nivel global.

#### Scenario: Cambio de color mediante propiedad CSS

- **WHEN** se modifica el valor de `--sketch-color` en la hoja de estilos
- **THEN** el trazo refleja el nuevo color sin cambios en JavaScript

#### Scenario: Cambio de grosor mediante propiedad CSS

- **WHEN** se modifica el valor de `--sketch-stroke-width` en la hoja de estilos
- **THEN** el trazo refleja el nuevo grosor sin cambios en JavaScript

### Requirement: Animación de dibujo progresivo

El trazo SHALL aparecer animado como si se estuviera dibujando en tiempo real, desde el inicio hasta el cierre del bucle. La animación SHALL completarse en menos de 700 ms.

#### Scenario: Trazo se dibuja progresivamente

- **WHEN** se activa el estado hover
- **THEN** el trazo avanza visiblemente desde un punto de inicio hasta completar el recorrido alrededor de la imagen, en una única pasada fluida

### Requirement: Respeto a prefers-reduced-motion

El sistema SHALL omitir la animación de dibujo cuando el usuario ha configurado preferencia de movimiento reducido. El trazo SHALL seguir apareciendo pero de forma instantánea.

#### Scenario: Sin animación con prefers-reduced-motion

- **WHEN** el sistema operativo reporta `prefers-reduced-motion: reduce`
- **THEN** el trazo aparece al instante al hacer hover, sin animación de trazado
