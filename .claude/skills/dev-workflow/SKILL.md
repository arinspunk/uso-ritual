---
name: dev-workflow
description: >
  Local development workflow for the uso-ritual Lume/Deno project.
  Use this skill when the user asks how to run, start, serve, or preview the site,
  how to build it, or what to do when deno/lume commands fail.
  Trigger phrases: "levantar el servidor", "ver el site", "cómo sirvo", "preview",
  "make build", "deno task", "no me abre", "cómo arranco", "cómo compilo",
  "watch mode", "puerto 3000", "localhost".
  Do NOT use for content editing, CSS changes, deployment to Netlify,
  or unrelated Deno projects.
---

# Dev Workflow — uso-ritual

## Prerequisites

Deno is installed at `~/.deno/bin/deno` but is only in the PATH of zsh, not bash.
Cursor terminals run bash, so source the config before any task:

```bash
source ~/.bashrc
```

`~/.bashrc` exports `DENO_INSTALL` and adds `~/.deno/bin` to `PATH`. This is
permanent — one run per terminal session is enough.

## Common tasks

### Preview with live reload (most common)

```bash
deno task lume -s
```

Lume builds the site and starts a local server with file watching.

> `deno task serve` exists in `deno.json` but silently drops the `-s` flag —
> always use `deno task lume -s` directly.

Expected success output:

```
🍾 Site built into ./_site
  11 files generated in 0.05 seconds
  Server started at:
  http://localhost:3000/ (local)
  http://192.168.1.33:3000/ (network)
```

The network IP varies per machine — copy it from the terminal, never invent it.

### Response format after a successful serve

After the server starts, always reply using this structure (substitute the real
network IP from the terminal; adjust the port if it differs from 3000):

```
Servidor listo:

- Local:   http://localhost:3000/
- Red:     http://<network-ip>:3000/

Rutas de idioma:
- Português (default): http://localhost:3000/
- English:             http://localhost:3000/en/
```

The reason for this format: users need the network URL for mobile/device testing
and the language URLs to verify both locales at once.

### Cursor sandbox: PermissionDenied on serve

Symptom — the build succeeds but the server crashes immediately:

```
PermissionDenied: Operation not permitted (os error 1)
  for (const info of Deno.networkInterfaces()) {
```

Cause: Cursor's sandbox blocks `Deno.networkInterfaces()` at OS level.

Fix: re-run the same command using `required_permissions: ["all"]` in the Shell
tool. A successful build does not mean the server started — wait for the
`Server started at:` lines before reporting success.

### Build only (no server)

```bash
deno task build
```

Output lands in `_site/`. Never commit that directory.

### Custom port

```bash
deno task lume -s --port 8080
```

## WebSocket noise in the terminal

`Socket errored / Unexpected EOF` lines during serve are Lume's live-reload
WebSocket reconnecting when the browser tab closes or reloads. They are harmless.

## Version reference

| Context | Deno   | Lume  |
|---------|--------|-------|
| Local   | 2.9.5  | 2.3.3 |
| Netlify | 2.1.0  | 2.3.3 |

Netlify's Deno version is pinned in `netlify.toml`. If local behavior differs
from a Netlify build, check the version gap first.

To confirm the active Lume version:

```bash
deno task lume --version
```
