---
name: dev-workflow
description: >
  Local development workflow for the uso-ritual Lume/Deno project.
  Use this skill when the user asks how to run, start, serve, or preview the site,
  how to build it, where to see it in the browser, or what to do when deno/lume
  commands fail. Also trigger on: "levantar el servidor", "ver el site", "make build",
  "deno task", "no me abre", "cómo arranco", "cómo compilo", "watch mode".
  Do NOT use for content editing, deployment to Netlify, or CSS changes.
---

# Dev Workflow — uso-ritual

## Prerequisites

Deno is installed at `~/.deno/bin/deno` but is only in the PATH of zsh, not bash.
The terminal in Cursor runs bash, so Deno must be sourced before any task.

If `deno: command not found`, run once per terminal session:

```bash
source ~/.bashrc
```

This is already permanent — `~/.bashrc` exports `DENO_INSTALL` and adds
`~/.deno/bin` to `PATH`. No further setup needed.

## Common tasks

### Preview with live reload (most common)

```bash
deno task lume -s
```

The site builds and a local server starts. Open in the browser:

- Portuguese (default): http://localhost:3000/
- English: http://localhost:3000/en/

Lume watches for file changes and rebuilds automatically. Leave this terminal
open while working. Stop with `Ctrl+C`.

> Note: `deno task serve` exists in `deno.json` but passes `-s` through an
> extra indirection that strips the flag — use `deno task lume -s` directly.

### Build only (no server)

```bash
deno task build
```

Output lands in `_site/`. Never commit that directory.

### Custom port

```bash
deno task lume -s --port 8080
```

## WebSocket errors in the terminal

The `Socket errored / Unexpected EOF` lines that appear during `serve` are
Lume's live-reload WebSocket reconnecting when the browser tab closes or
reloads. They are harmless — the server keeps running and the site stays
accessible.

## Deno version

| Context | Version |
|---------|---------|
| Local   | 2.9.5   |
| Netlify | 2.1.0 (pinned in `netlify.toml`) |

If local behavior differs from a Netlify build, the version difference is
the first thing to check.

## Lume version

Pinned to `2.3.3` in `deno.json` import map. To see what version is active:

```bash
deno task lume --version
```
