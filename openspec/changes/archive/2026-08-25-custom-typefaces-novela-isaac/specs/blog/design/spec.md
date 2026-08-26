## MODIFIED Requirements

### Requirement: Jerarquía tipográfica por familia y estilo
La jerarquía entre niveles de texto SHALL establecerse mediante familia tipográfica y estilo, no mediante diferencias de tamaño entre h2, h3 y el cuerpo. h1 y h2 SHALL usar la fuente Isaac Sans con peso 400 y estilo normal. h3 SHALL usar Isaac Sans con peso 400 y estilo italic. El cuerpo de texto y las captions SHALL usar la fuente Novela con peso 400. Ningún elemento SHALL usar un peso tipográfico distinto de 400 — el contraste visual se establece exclusivamente mediante familia, tamaño y estilo.

#### Scenario: h2 se distingue del cuerpo solo por la familia
- **WHEN** un h2 y un párrafo adyacente se renderizan
- **THEN** ambos tienen el mismo tamaño pero el h2 usa Isaac Sans y el párrafo usa Novela

#### Scenario: h3 se distingue del h2 por el estilo italic
- **WHEN** un h3 y un h2 adyacente se renderizan
- **THEN** ambos usan Isaac Sans al mismo tamaño, pero el h3 aparece en italic

#### Scenario: No hay diferencias de peso en ningún elemento
- **WHEN** se inspecciona el CSS renderizado en cualquier elemento del sitio
- **THEN** todos los elementos muestran font-weight 400, sin excepción

### Requirement: CSS sem dependências externas em runtime
O sistema SHALL gerar CSS estático sem dependência de ficheiros CSS externos carregados em runtime (sem CDN, sem Google Fonts em runtime); fontes e estilos SHALL ser servidos a partir do próprio site ou embutidos. O sistema de cor SHALL implementar-se exclusivamente com custom properties CSS nativas, sem preprocessadores nem dependências de build adicionais. As fontes tipográficas SHALL ser servidas desde `src/assets/fonts/` como ficheiros estáticos copiados pelo build.

#### Scenario: Página carrega sem pedidos a domínios externos para CSS
- **WHEN** a página é carregada com a rede cortada após o HTML inicial
- **THEN** o estilo visual é preservado sem erros de recursos em falta

#### Scenario: Variables de color resolvibles sin build step
- **WHEN** el CSS es inspeccionado en el navegador
- **THEN** todas las custom properties de color están definidas en `:root` y son resolvibles por el navegador sin transformación previa

#### Scenario: Fuentes tipográficas sin petición a dominios externos
- **WHEN** se inspecciona el tráfico de red al cargar cualquier página
- **THEN** los archivos de fuente se sirven desde el mismo dominio, sin peticiones a CDN ni servicios de tipografía externos
