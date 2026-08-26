## REMOVED Requirements

### Requirement: Campo media opcional no frontmatter de um post
**Reason**: El campo `media` del frontmatter desaparece como mecanismo de inserción de media. La media se inserta ahora inline en el cuerpo del post usando shortcodes.
**Migration**: Eliminar el campo `media` del frontmatter y reemplazar cada ítem por el shortcode equivalente en el cuerpo del post. Ver spec `blog/post-media` para la API de shortcodes.

## ADDED Requirements

### Requirement: Campo thumbnail opcional en el frontmatter de un post
Un post PUEDE declarar el campo `thumbnail` (string, path relativo a `src/assets/images/`) en el frontmatter para indicar qué imagen se usa como miniatura en la card de la listagem. Cuando `thumbnail` está presente, el sistema SHALL usar esa imagen en el cartão. Cuando no está presente, el cartão se renderiza sin miniatura.

#### Scenario: Post con thumbnail aparece con miniatura en la listagem
- **WHEN** un post declara `thumbnail: disco/cover.jpg` en el frontmatter
- **THEN** el cartão del post en la listagem muestra esa imagen como miniatura

#### Scenario: Post sin thumbnail aparece sin miniatura en la listagem
- **WHEN** un post no declara el campo `thumbnail`
- **THEN** el cartão del post en la listagem no muestra miniatura, sin error
