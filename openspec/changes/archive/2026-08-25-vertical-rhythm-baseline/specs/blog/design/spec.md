## ADDED Requirements

### Requirement: Ritmo vertical basado en baseline
Todo el espaciado vertical entre elementos de contenido editorial SHALL derivarse de un único token `--baseline`, calculado como el producto del tamaño de fuente base del breakpoint activo y el interlineado del cuerpo. Un espacio de un baseline equivale a una línea vacía visible entre bloques de texto. Los tokens de espacio genéricos (`--space-*`) SHALL NOT usarse para márgenes entre elementos de texto dentro de `.post__content` ni `.page__content`.

#### Scenario: Espacio entre párrafos es exactamente un baseline
- **WHEN** se renderizan dos párrafos consecutivos en un post
- **THEN** el espacio vertical entre el final del primero y el inicio del segundo es igual a un baseline (font-size-base × line-height)

#### Scenario: Espacio antes y después de un heading es un baseline
- **WHEN** un h2 o h3 aparece entre párrafos en un post
- **THEN** el espacio visual antes del heading y el espacio visual después son cada uno igual a un baseline

#### Scenario: El baseline escala con el breakpoint
- **WHEN** el viewport cambia de tamaño y el font-size-base aumenta
- **THEN** el baseline aumenta proporcionalmente y los espacios entre elementos de texto se actualizan sin cambios adicionales en el CSS
