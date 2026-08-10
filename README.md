# Planist-MCP (Model Context Protocol Server)

> **Planist Page-Editing & AI Collaboration MCP Server**

MCP server for [Planist](https://github.com/MiuDog/Planist). It lets external AI clients
(Claude Desktop, Cursor, custom agents) inspect and propose page edits for Planist
workspaces over an out-of-process protocol.

## Status: not yet connectable

The Planist-side inbound adapter **does not exist yet**, and the transport contract is
not final. This repository currently holds the tool surface and the specification.

Design decisions live in the product repository:

- **ADR-0038** — MCP inbound adapter, tool packaging, per-Project authorization levels
- **ADR-0037** — Project variables and inline references
- **ADR-0031** — Page kind taxonomy
- **ADR-0029 / ADR-0030** — transport topology, capability handling

Blocking work, in order:

1. `D-MCP-01` spike — decides the adapter transport and the discovery-file contract
2. `apps/planist_server` and its MCP inbound adapter (default-off until the spike lands)
3. This server switches to reading the discovery file

## How it will connect

```text
MCP client  →  planist-mcp (stdio)  →  planist_server MCP adapter  →  ProjectAuthority
```

The adapter converts MCP calls into the existing typed commands. There is **no second
write path**: ACL, Grant, proposal review and Activity all stay on the paths they are on
today.

Two consequences worth knowing before you wire anything up:

- **Planist must be running.** When it is not, tools return an explicit "Planist is not
  running" error. There is no background wake-up and no headless read-only mode.
- **No fixed port, no token in the environment.** Planist writes the actual port and a
  single-use capability to a user-local discovery file; this server reads that file.
  ADR-0030 forbids passing capabilities through environment variables, CLI arguments or
  logs, so the earlier `PLANIST_API_HOST` / `PLANIST_GRANT_TOKEN` setup has been removed.

## Per-Project authorization

Each Project chooses its own level. The default is the strictest one.

| Level | Behaviour |
|---|---|
| `disabled` (default) | The Project is invisible to MCP |
| `readOnly` | List and read; every write is refused |
| `askAlways` | Reads run; **each write prompts for confirmation inside Planist** |
| `writeAllowed` | Content writes become proposals; variable writes apply and are logged |
| `trusted` | As above, but proposals may auto-apply |

`trusted` is the only level that bypasses human review. It must be enabled per Project by
the user and cannot be raised by an MCP call.

Page content writes always produce a `LivePageProposal`. **Project variables are the one
documented exception** (ADR-0037 §5): they are parameters rather than content, so they
apply directly — but every write is recorded in an append-only Activity entry.

## Tool packaging

Tools are packaged per Page kind so a client only loads what the current page needs.
The kinds are the five in ADR-0031: `docs`, `sheet`, `edgeless`, `design`, `dashboard`.

**Slide is not a Page kind.** Its data structure is the same as `docs`; it is a
presentation profile over a `docs` page, so `slide_*` tools live in the `doc` module.
See `docs/mcp-tools-spec.md`.

## Build

```bash
npm install
npm run build
```

`npm start` runs the server over stdio. Until the adapter exists it will report that
Planist is unreachable — that is the expected behaviour, not a misconfiguration.

## License

MIT
