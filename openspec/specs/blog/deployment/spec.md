## Purpose

Configuração de deploy contínuo do blogue em Netlify a partir do output estático gerado pelo Lume, com build automático em cada push para o repositório.

## Requirements

### Requirement: Build estático via Deno task publicado em Netlify
O sistema SHALL ser configurado para que o Netlify execute o build com `deno task build` e publique o diretório `_site` como raiz do site.

#### Scenario: Deploy bem-sucedido após push
- **WHEN** um commit é feito para o branch principal do repositório
- **THEN** o Netlify executa o build e publica o conteúdo de `_site` sem intervenção manual

#### Scenario: Build falha com erro visível
- **WHEN** o build do Lume falha (ex: erro de sintaxe num template)
- **THEN** o Netlify não publica a versão anterior nem uma versão parcial, e o erro é visível no log de deploy

### Requirement: Configuração de build declarada em netlify.toml
A configuração de build SHALL estar declarada num ficheiro `netlify.toml` na raiz do repositório, incluindo: comando de build, diretório de publicação, e versão de Deno a usar.

#### Scenario: netlify.toml existe na raiz do repositório
- **WHEN** o repositório é inspecionado
- **THEN** existe um ficheiro `netlify.toml` com `[build]` command e publish definidos

### Requirement: Redirects de idioma não configurados no servidor
O sistema SHALL NÃO implementar redirects automáticos baseados no idioma do browser (ex: redirect de `/` para `/en/` baseado em `Accept-Language`); a seleção de idioma SHALL ser feita exclusivamente pelo utilizador através do comutador de idioma.

#### Scenario: Acesso a / não redireciona baseado no browser
- **WHEN** um utilizador com browser configurado em inglês acede a `/`
- **THEN** recebe a página em português sem redirect
